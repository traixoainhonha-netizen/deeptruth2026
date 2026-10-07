import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchCategoryStats,
  fetchRegionStats,
  fetchThreatFeed,
  fetchThreatRegions,
  isUnavailable,
  parseThreatReport,
  submitThreatReport,
  voteThreat,
  type ThreatReport,
} from "./api";
import { getVoterToken, readVotes, rememberVote } from "./model";
import type { ThreatReportInput } from "./schema";

export const threatKeys = {
  all: ["threats"] as const,
  regions: ["threats", "regions"] as const,
  feed: ["threats", "feed"] as const,
  regionStats: ["threats", "region-stats"] as const,
  categoryStats: ["threats", "category-stats"] as const,
};

const FEED_LIMIT = 60;

// Don't hammer a database that has not been migrated yet.
const retry = (failureCount: number, error: unknown) => !isUnavailable(error) && failureCount < 2;

export function useThreatRegions(enabled: boolean) {
  return useQuery({
    queryKey: threatKeys.regions,
    queryFn: fetchThreatRegions,
    enabled,
    staleTime: Infinity,
    retry,
  });
}

export function useThreatFeed(enabled: boolean) {
  return useQuery({
    queryKey: threatKeys.feed,
    queryFn: () => fetchThreatFeed(FEED_LIMIT),
    enabled,
    staleTime: 30_000,
    refetchInterval: enabled ? 120_000 : false,
    retry,
  });
}

export function useThreatStats(enabled: boolean) {
  const regionStats = useQuery({
    queryKey: threatKeys.regionStats,
    queryFn: fetchRegionStats,
    enabled,
    staleTime: 30_000,
    retry,
  });
  const categoryStats = useQuery({
    queryKey: threatKeys.categoryStats,
    queryFn: fetchCategoryStats,
    enabled,
    staleTime: 30_000,
    retry,
  });
  return { regionStats, categoryStats };
}

function upsertReport(queryClient: QueryClient, report: ThreatReport) {
  queryClient.setQueryData<ThreatReport[]>(threatKeys.feed, (prev = []) => {
    const index = prev.findIndex((r) => r.id === report.id);
    if (index === -1) return [report, ...prev].slice(0, FEED_LIMIT);
    const next = prev.slice();
    next[index] = { ...prev[index], ...report };
    return next;
  });
}

function invalidateStats(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: threatKeys.regionStats });
  void queryClient.invalidateQueries({ queryKey: threatKeys.categoryStats });
}

export type LiveStatus = "idle" | "connecting" | "live" | "offline";

/** Streams new reports and score changes into the cache while the map is on screen. */
export function useThreatRealtime(enabled: boolean) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LiveStatus>("idle");

  useEffect(() => {
    if (!enabled) return undefined;
    setStatus("connecting");
    let statsTimer: ReturnType<typeof setTimeout> | undefined;
    const refreshStatsSoon = () => {
      clearTimeout(statsTimer);
      statsTimer = setTimeout(() => invalidateStats(queryClient), 800);
    };

    const channel = supabase
      .channel("threat-map-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "threat_reports" },
        (payload) => {
          const row = payload.eventType === "DELETE" ? null : parseThreatReport(payload.new);
          if (row) upsertReport(queryClient, row);
          else void queryClient.invalidateQueries({ queryKey: threatKeys.feed });
          refreshStatsSoon();
        },
      )
      .subscribe((state) => {
        if (state === "SUBSCRIBED") setStatus("live");
        else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") setStatus("offline");
      });

    return () => {
      clearTimeout(statsTimer);
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);

  return status;
}

/** Votes cast from this browser, kept in sync across components. */
export function useLocalVotes() {
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    setVotes(readVotes());
    const onStorage = () => setVotes(readVotes());
    window.addEventListener("storage", onStorage);
    window.addEventListener("deeptruth:votes", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("deeptruth:votes", onStorage);
    };
  }, []);

  return votes;
}

function storeVote(threatId: string, score: number) {
  rememberVote(threatId, score);
  window.dispatchEvent(new Event("deeptruth:votes"));
}

export function useSubmitThreatReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ThreatReportInput) => {
      const id = await submitThreatReport(input, getVoterToken());
      return { id, input };
    },
    onSuccess: ({ id, input }) => {
      storeVote(id, input.danger);
      upsertReport(queryClient, {
        id,
        created_at: new Date().toISOString(),
        category: input.category,
        channel: input.channel,
        region_code: input.regionCode,
        title: input.title.trim(),
        description: input.description.trim(),
        vote_count: 1,
        danger_total: input.danger,
      });
      invalidateStats(queryClient);
    },
  });
}

export function useVoteThreat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threatId, score }: { threatId: string; score: number }) =>
      voteThreat(threatId, getVoterToken(), score),
    onSuccess: (result, { threatId, score }) => {
      storeVote(threatId, score);
      queryClient.setQueryData<ThreatReport[]>(threatKeys.feed, (prev) =>
        prev?.map((r) =>
          r.id === threatId
            ? { ...r, vote_count: result.vote_count, danger_total: result.danger_total }
            : r,
        ),
      );
      invalidateStats(queryClient);
    },
  });
}
