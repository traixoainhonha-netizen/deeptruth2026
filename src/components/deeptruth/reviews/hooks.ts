import { useEffect, useId } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchLatestReviews,
  fetchReviewPage,
  fetchReviewStats,
  submitReview,
  type Review,
  type ReviewQuery,
} from "./api";

export const reviewKeys = {
  all: ["reviews"] as const,
  stats: ["reviews", "stats"] as const,
  latest: (limit: number) => ["reviews", "latest", limit] as const,
  page: (query: ReviewQuery) => ["reviews", "page", query] as const,
};

export function useReviewStats(enabled = true) {
  return useQuery({
    queryKey: reviewKeys.stats,
    queryFn: fetchReviewStats,
    enabled,
    staleTime: 60_000,
  });
}

export function useLatestReviews(limit: number, enabled = true) {
  return useQuery({
    queryKey: reviewKeys.latest(limit),
    queryFn: () => fetchLatestReviews(limit),
    enabled,
    staleTime: 60_000,
  });
}

export function useReviewPage(query: ReviewQuery) {
  return useQuery({
    queryKey: reviewKeys.page(query),
    queryFn: () => fetchReviewPage(query),
    // Keep the previous page on screen while the next one loads: no flashing.
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function addToLatest(queryClient: QueryClient, review: Review) {
  queryClient.setQueriesData<Review[]>({ queryKey: ["reviews", "latest"] }, (prev) =>
    prev && !prev.some((r) => r.id === review.id)
      ? [review, ...prev].slice(0, prev.length || 6)
      : prev,
  );
}

function refreshAggregates(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: reviewKeys.stats });
  void queryClient.invalidateQueries({ queryKey: ["reviews", "page"] });
}

/** Pushes reviews posted anywhere into every open list. */
export function useReviewsRealtime(enabled: boolean) {
  const queryClient = useQueryClient();
  const channelId = useId();

  useEffect(() => {
    if (!enabled) return undefined;
    const channel = supabase
      .channel(`reviews-feed-${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reviews" },
        (payload) => {
          const r = payload.new;
          if (
            typeof r["id"] === "string" &&
            typeof r["name"] === "string" &&
            typeof r["content"] === "string" &&
            typeof r["created_at"] === "string"
          ) {
            addToLatest(queryClient, {
              id: r["id"],
              name: r["name"],
              rating: Number(r["rating"]),
              content: r["content"],
              created_at: r["created_at"],
            });
          }
          refreshAggregates(queryClient);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, channelId]);
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitReview,
    onSuccess: (review) => {
      addToLatest(queryClient, review);
      refreshAggregates(queryClient);
    },
  });
}
