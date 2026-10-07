// Kept dependency-free: route configs ship in the main bundle, so anything
// imported here is paid for on every page.

export const REVIEW_SORTS = ["newest", "oldest", "highest", "lowest"] as const;
export type ReviewSort = (typeof REVIEW_SORTS)[number];

export type ArchiveSearch = {
  page?: number | undefined;
  rating?: number | undefined;
  q?: string | undefined;
  sort?: ReviewSort | undefined;
};

function intInRange(value: unknown, min: number, max: number) {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

/** Validates archive URL params, dropping anything malformed instead of failing. */
export function parseArchiveSearch(raw: Record<string, unknown>): ArchiveSearch {
  // The router JSON-parses params, so "?q=113" arrives as a number.
  const rawQ = raw["q"];
  const q =
    typeof rawQ === "string" || typeof rawQ === "number" ? String(rawQ).trim().slice(0, 100) : "";
  return {
    page: intInRange(raw["page"], 1, 10_000),
    rating: intInRange(raw["rating"], 1, 5),
    q: q || undefined,
    sort: REVIEW_SORTS.find((s) => s === raw["sort"]),
  };
}
