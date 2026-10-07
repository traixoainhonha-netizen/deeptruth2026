/** Page numbers with ellipses, e.g. 1 … 4 5 6 … 12. */
export function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  keep.forEach((p, i) => {
    const prev = keep[i - 1];
    if (prev !== undefined && p - prev > 1) out.push("gap");
    out.push(p);
  });
  return out;
}
