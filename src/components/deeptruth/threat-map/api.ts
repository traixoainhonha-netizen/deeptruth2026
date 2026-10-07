import { supabase } from "@/integrations/supabase/client";
import { isMissingRelationError, isNetworkError } from "@/lib/db-errors";
import {
  isRegionArea,
  isThreatCategory,
  isThreatChannel,
  PERSONAL_INFO_MESSAGE,
  type RegionArea,
  type ThreatCategory,
  type ThreatChannel,
} from "./model";
import type { ThreatReportInput } from "./schema";

export type ThreatRegion = {
  code: string;
  name: string;
  area: RegionArea;
  latitude: number | null;
  longitude: number | null;
};

export type ThreatReport = {
  id: string;
  created_at: string;
  category: ThreatCategory;
  channel: ThreatChannel;
  region_code: string;
  title: string;
  description: string;
  vote_count: number;
  danger_total: number;
};

export type RegionStat = {
  regionCode: string;
  name: string;
  area: RegionArea;
  latitude: number | null;
  longitude: number | null;
  reportCount: number;
  reportsLast7d: number;
  avgDanger: number | null;
  lastReportedAt: string | null;
};

export type CategoryStat = {
  category: ThreatCategory;
  reportCount: number;
  reportsLast7d: number;
  avgDanger: number | null;
};

export type VoteResult = {
  status: "ok" | "duplicate";
  vote_count: number;
  danger_total: number;
};

export type ThreatErrorKind =
  | "unavailable"
  | "personal_info"
  | "rate_limited"
  | "not_found"
  | "invalid"
  | "network"
  | "unknown";

export class ThreatApiError extends Error {
  constructor(
    readonly kind: ThreatErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "ThreatApiError";
  }
}

const MESSAGES: Record<ThreatErrorKind, string> = {
  unavailable: "Bản đồ cảnh báo đang được khởi tạo. Vui lòng quay lại sau ít phút.",
  personal_info: PERSONAL_INFO_MESSAGE,
  rate_limited: "Bạn gửi hơi nhanh. Vui lòng đợi vài phút rồi thử lại nhé.",
  not_found: "Báo cáo này không còn tồn tại hoặc đã bị ẩn.",
  invalid: "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại các trường.",
  network: "Không kết nối được máy chủ. Kiểm tra mạng và thử lại.",
  unknown: "Đã có lỗi xảy ra. Vui lòng thử lại.",
};

export function toThreatError(error: { code?: string; message?: string } | null | undefined) {
  if (error instanceof ThreatApiError) return error;
  const message = error?.message ?? "";
  let kind: ThreatErrorKind = "unknown";
  if (isMissingRelationError(error)) kind = "unavailable";
  else if (message.includes("personal_info_detected")) kind = "personal_info";
  else if (message.includes("rate_limited")) kind = "rate_limited";
  else if (message.includes("threat_not_found")) kind = "not_found";
  else if (error?.code === "23514" || error?.code === "23503" || error?.code === "22023")
    kind = "invalid";
  else if (isNetworkError(error)) kind = "network";
  return new ThreatApiError(kind, MESSAGES[kind]);
}

export function isUnavailable(error: unknown) {
  return error instanceof ThreatApiError && error.kind === "unavailable";
}

const toNumber = (value: unknown) => (value === null || value === undefined ? null : Number(value));

/** Narrows an untyped row (query result or realtime payload) to a ThreatReport. */
export function parseThreatReport(row: Record<string, unknown>): ThreatReport | null {
  const { id, created_at, category, channel, region_code, title, description } = row;
  if (
    typeof id !== "string" ||
    typeof created_at !== "string" ||
    typeof region_code !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string"
  ) {
    return null;
  }
  return {
    id,
    created_at,
    category: isThreatCategory(category) ? category : "other",
    channel: isThreatChannel(channel) ? channel : "other",
    region_code,
    title,
    description,
    vote_count: Number(row["vote_count"] ?? 0),
    danger_total: Number(row["danger_total"] ?? 0),
  };
}

const REPORT_COLUMNS =
  "id,created_at,category,channel,region_code,title,description,vote_count,danger_total";

export async function fetchThreatRegions(): Promise<ThreatRegion[]> {
  const { data, error } = await supabase
    .from("threat_regions")
    .select("code,name,area,latitude,longitude")
    .order("sort_order");
  if (error) throw toThreatError(error);
  return data.map((r) => ({
    code: r.code,
    name: r.name,
    area: isRegionArea(r.area) ? r.area : "online",
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function fetchThreatFeed(limit = 60): Promise<ThreatReport[]> {
  const { data, error } = await supabase
    .from("threat_reports")
    .select(REPORT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw toThreatError(error);
  return data.flatMap((row) => parseThreatReport(row) ?? []);
}

export async function fetchRegionStats(): Promise<RegionStat[]> {
  const { data, error } = await supabase.from("threat_region_stats").select("*");
  if (error) throw toThreatError(error);
  return data.flatMap((r) =>
    r.region_code && r.name
      ? [
          {
            regionCode: r.region_code,
            name: r.name,
            area: isRegionArea(r.area) ? r.area : "online",
            latitude: r.latitude,
            longitude: r.longitude,
            reportCount: r.report_count ?? 0,
            reportsLast7d: r.reports_last_7d ?? 0,
            avgDanger: toNumber(r.avg_danger),
            lastReportedAt: r.last_reported_at,
          },
        ]
      : [],
  );
}

export async function fetchCategoryStats(): Promise<CategoryStat[]> {
  const { data, error } = await supabase.from("threat_category_stats").select("*");
  if (error) throw toThreatError(error);
  return data.flatMap((r) =>
    isThreatCategory(r.category)
      ? [
          {
            category: r.category,
            reportCount: r.report_count ?? 0,
            reportsLast7d: r.reports_last_7d ?? 0,
            avgDanger: toNumber(r.avg_danger),
          },
        ]
      : [],
  );
}

export async function submitThreatReport(input: ThreatReportInput, voterToken: string) {
  const { data, error } = await supabase.rpc("submit_threat_report", {
    p_category: input.category,
    p_channel: input.channel,
    p_region_code: input.regionCode,
    p_title: input.title,
    p_description: input.description,
    p_danger_score: input.danger,
    p_voter_token: voterToken,
  });
  if (error) throw toThreatError(error);
  if (typeof data !== "string") throw new ThreatApiError("unknown", MESSAGES.unknown);
  return data;
}

/** Validates the jsonb returned by vote_threat(). */
export function parseVoteResult(data: unknown): VoteResult | null {
  if (!data || typeof data !== "object") return null;
  const { status, vote_count, danger_total } = data as Record<string, unknown>;
  const count = Number(vote_count);
  const total = Number(danger_total);
  if (
    (status !== "ok" && status !== "duplicate") ||
    !Number.isFinite(count) ||
    !Number.isFinite(total)
  ) {
    return null;
  }
  return { status, vote_count: count, danger_total: total };
}

export async function voteThreat(threatId: string, voterToken: string, score: number) {
  const { data, error } = await supabase.rpc("vote_threat", {
    p_threat_id: threatId,
    p_voter_token: voterToken,
    p_danger_score: score,
  });
  if (error) throw toThreatError(error);
  const result = parseVoteResult(data);
  if (!result) throw new ThreatApiError("unknown", MESSAGES.unknown);
  return result;
}
