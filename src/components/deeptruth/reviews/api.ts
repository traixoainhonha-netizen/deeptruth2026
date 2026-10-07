import { supabase } from "@/integrations/supabase/client";
import { isMissingRelationError } from "@/lib/db-errors";
import { formatDateTime } from "@/lib/time";
import { randomUuid } from "@/lib/uuid";
import type { ReviewSort } from "./search";

export type Review = {
  id: string;
  name: string;
  rating: number;
  content: string;
  created_at: string;
};

export type ReviewStats = {
  total: number;
  average: number;
  /** Counts for 1★ … 5★. */
  distribution: [number, number, number, number, number];
};

export type ReviewQuery = {
  page: number;
  pageSize: number;
  rating: number | undefined;
  q: string | undefined;
  sort: ReviewSort;
};

export const ANON_NAME = "Người dùng ẩn danh";
const COLUMNS = "id,name,rating,content,created_at";
const BATCH = 1000;
const EXPORT_LIMIT = 20_000;

export function displayName(name: string | null | undefined) {
  return name?.trim() || ANON_NAME;
}

export function computeReviewStats(ratings: number[]): ReviewStats {
  const distribution: ReviewStats["distribution"] = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const r of ratings) {
    if (r < 1 || r > 5) continue;
    distribution[r - 1]! += 1;
    sum += r;
  }
  const total = distribution.reduce((a, b) => a + b, 0);
  return { total, average: total ? Math.round((sum / total) * 100) / 100 : 0, distribution };
}

/** Strips characters that would break PostgREST filter syntax or act as LIKE wildcards. */
export function sanitizeSearch(q: string | undefined) {
  return (q ?? "")
    .slice(0, 100)
    .replace(/[%_\\,()"*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchReviewStats(): Promise<ReviewStats> {
  const { data, error } = await supabase.from("review_stats").select("*").maybeSingle();
  if (!error && data) {
    return {
      total: data.total ?? 0,
      average: Number(data.average ?? 0),
      distribution: [
        data.star_1 ?? 0,
        data.star_2 ?? 0,
        data.star_3 ?? 0,
        data.star_4 ?? 0,
        data.star_5 ?? 0,
      ],
    };
  }
  if (error && !isMissingRelationError(error)) throw error;

  // Before migration 0002 the stats view does not exist: aggregate ratings client-side.
  const ratings: number[] = [];
  for (let from = 0; from < EXPORT_LIMIT; from += BATCH) {
    const { data: rows, error: pageError } = await supabase
      .from("reviews")
      .select("rating")
      .range(from, from + BATCH - 1);
    if (pageError) throw pageError;
    ratings.push(...rows.map((r) => r.rating));
    if (rows.length < BATCH) break;
  }
  return computeReviewStats(ratings);
}

export async function fetchLatestReviews(limit: number): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

const SORT_ORDER = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  highest: { column: "rating", ascending: false },
  lowest: { column: "rating", ascending: true },
} as const satisfies Record<ReviewSort, { column: "created_at" | "rating"; ascending: boolean }>;

function buildQuery(
  { rating, q, sort }: Pick<ReviewQuery, "rating" | "q" | "sort">,
  withCount: boolean,
) {
  let filtered = supabase.from("reviews").select(COLUMNS, withCount ? { count: "exact" } : {});
  if (rating) filtered = filtered.eq("rating", rating);
  const term = sanitizeSearch(q);
  if (term) filtered = filtered.or(`content.ilike.%${term}%,name.ilike.%${term}%`);

  const { column, ascending } = SORT_ORDER[sort];
  let ordered = filtered.order(column, { ascending });
  // Stable, intuitive tie-break: newest first within the same star rating.
  if (column === "rating") ordered = ordered.order("created_at", { ascending: false });
  return ordered.order("id");
}

export async function fetchReviewPage(query: ReviewQuery) {
  const from = (query.page - 1) * query.pageSize;
  const { data, error, count } = await buildQuery(query, true).range(
    from,
    from + query.pageSize - 1,
  );
  if (error) throw error;
  return { rows: data, total: count ?? data.length };
}

export async function fetchReviewsForExport(query: Pick<ReviewQuery, "rating" | "q" | "sort">) {
  const rows: Review[] = [];
  for (let from = 0; from < EXPORT_LIMIT; from += BATCH) {
    const { data, error } = await buildQuery(query, false).range(from, from + BATCH - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < BATCH) break;
  }
  return rows;
}

export async function submitReview(input: { name: string; rating: number; content: string }) {
  const row = {
    id: randomUuid(),
    name: input.name.trim() || ANON_NAME,
    rating: input.rating,
    content: input.content.trim(),
  };
  const { error } = await supabase.from("reviews").insert(row);
  if (error) throw error;
  return { ...row, created_at: new Date().toISOString() } satisfies Review;
}

// Spreadsheet apps execute cells starting with these characters as formulas.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function csvCell(value: string | number) {
  let text = String(value);
  if (typeof value === "string" && FORMULA_PREFIX.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** UTF-8 CSV with BOM so Excel shows Vietnamese correctly. */
export function reviewsToCsv(rows: Review[]) {
  const header = ["Thời gian", "Thời gian (ISO 8601)", "Biệt danh", "Số sao", "Nội dung"];
  const lines = [
    header.map(csvCell).join(","),
    ...rows.map((r) =>
      [formatDateTime(r.created_at), r.created_at, displayName(r.name), r.rating, r.content]
        .map(csvCell)
        .join(","),
    ),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

export function downloadTextFile(filename: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
