import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Loader2,
  PenLine,
  Search,
  SearchX,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/motion/Reveal";
import { pageNumbers } from "@/lib/pagination";
import { HEADER_OFFSET, scrollToTarget } from "@/lib/smooth-scroll";
import { useNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import { downloadTextFile, fetchReviewsForExport, reviewsToCsv, type ReviewQuery } from "./api";
import { useReviewPage, useReviewStats, useReviewsRealtime } from "./hooks";
import { RatingSummary } from "./RatingSummary";
import { ReviewCard, ReviewCardSkeleton } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import type { ArchiveSearch, ReviewSort } from "./search";

const PAGE_SIZE = 12;

const SORT_LABELS: Record<ReviewSort, string> = {
  newest: "Mới nhất",
  oldest: "Cũ nhất",
  highest: "Điểm cao nhất",
  lowest: "Điểm thấp nhất",
};

type Props = {
  search: ArchiveSearch;
  onChange: (next: ArchiveSearch, options?: { replace?: boolean }) => void;
};

export function ReviewArchive({ search, onChange }: Props) {
  const page = search.page ?? 1;
  const sort = search.sort ?? "newest";
  const query: ReviewQuery = {
    page,
    pageSize: PAGE_SIZE,
    rating: search.rating,
    q: search.q,
    sort,
  };

  const stats = useReviewStats();
  const result = useReviewPage(query);
  useReviewsRealtime(true);
  const now = useNow();
  const listRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState(search.q ?? "");
  const [exporting, setExporting] = useState(false);

  // Keep the input in sync when the URL changes (back/forward), without
  // clobbering a trailing space the user is still typing.
  useEffect(() => {
    setTerm((t) => (t.trim() === (search.q ?? "") ? t : (search.q ?? "")));
  }, [search.q]);

  // Debounced search: update the URL 350 ms after typing stops.
  useEffect(() => {
    const next = term.trim();
    if (next === (search.q ?? "")) return undefined;
    const timer = setTimeout(
      () => onChange({ ...search, q: next || undefined, page: undefined }, { replace: true }),
      350,
    );
    return () => clearTimeout(timer);
  }, [term, search, onChange]);

  const total = result.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = result.data?.rows ?? [];
  const from = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(total, page * PAGE_SIZE);
  const hasFilters = search.rating !== undefined || !!search.q;

  function goToPage(p: number) {
    onChange({ ...search, page: p > 1 ? p : undefined });
    if (listRef.current) scrollToTarget(listRef.current, { offset: -HEADER_OFFSET - 16 });
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const all = await fetchReviewsForExport({ rating: search.rating, q: search.q, sort });
      const stamp = new Date().toISOString().slice(0, 10);
      downloadTextFile(
        `danh-gia-deeptruth-${stamp}.csv`,
        reviewsToCsv(all),
        "text/csv;charset=utf-8",
      );
      toast.success(`Đã xuất ${all.length.toLocaleString("vi-VN")} đánh giá ra tệp CSV.`);
    } catch {
      toast.error("Chưa xuất được dữ liệu, vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[20rem_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24">
          <Reveal>
            <RatingSummary
              stats={stats.data}
              activeRating={search.rating}
              onSelectRating={(rating) => onChange({ ...search, rating, page: undefined })}
            />
          </Reveal>
          <Reveal delay={80} className="card-soft space-y-3 p-5">
            <p className="flex items-center gap-2 font-bold">
              <Database className="h-4 w-4 text-primary" aria-hidden /> Dữ liệu nghiên cứu
            </p>
            <p className="text-sm text-muted-foreground">
              Đánh giá được lưu trữ an toàn trong cơ sở dữ liệu của dự án. Tải xuống bản CSV (mở
              được bằng Excel) theo bộ lọc hiện tại.
            </p>
            <button
              type="button"
              className="btn-pill w-full"
              onClick={exportCsv}
              disabled={exporting || total === 0}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Tải CSV ({total.toLocaleString("vi-VN")})
            </button>
          </Reveal>
          <Reveal delay={140}>
            <a href="#viet-danh-gia" className="btn-pill-outline w-full">
              <PenLine className="h-4 w-4" /> Viết đánh giá
            </a>
          </Reveal>
        </aside>

        <div ref={listRef} className="scroll-mt-24">
          <div className="card-soft flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Tìm trong đánh giá</span>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                className="field pl-10"
                placeholder="Tìm theo nội dung hoặc biệt danh…"
                value={term}
                maxLength={100}
                onChange={(e) => setTerm(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="shrink-0 font-semibold text-muted-foreground">Sắp xếp</span>
              <select
                className="field py-2.5"
                value={sort}
                onChange={(e) =>
                  onChange({
                    ...search,
                    sort: e.target.value === "newest" ? undefined : (e.target.value as ReviewSort),
                    page: undefined,
                  })
                }
              >
                {(Object.keys(SORT_LABELS) as ReviewSort[]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <p className="text-muted-foreground" aria-live="polite">
              {result.isPending
                ? "Đang tải…"
                : total
                  ? `Hiển thị ${from}–${to} trong ${total.toLocaleString("vi-VN")} đánh giá`
                  : "Không có đánh giá phù hợp"}
            </p>
            {search.rating !== undefined && (
              <button
                type="button"
                onClick={() => onChange({ ...search, rating: undefined, page: undefined })}
                aria-label={`Bỏ lọc ${search.rating} sao`}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-semibold text-primary transition-colors hover:bg-accent"
              >
                {search.rating}{" "}
                <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden />
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
            {search.q && (
              <button
                type="button"
                onClick={() => onChange({ ...search, q: undefined, page: undefined })}
                aria-label={`Bỏ tìm kiếm “${search.q}”`}
                className="inline-flex max-w-[16rem] items-center gap-1 rounded-full bg-secondary px-3 py-1 font-semibold text-primary transition-colors hover:bg-accent"
              >
                <span className="truncate">“{search.q}”</span>
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </button>
            )}
          </div>

          <div
            className={cn(
              "mt-4 grid gap-4 transition-opacity duration-300 md:grid-cols-2",
              result.isPlaceholderData && "opacity-50",
            )}
            aria-busy={result.isFetching}
          >
            {result.isPending ? (
              Array.from({ length: 6 }, (_, i) => <ReviewCardSkeleton key={i} />)
            ) : result.isError ? (
              <div className="card-soft p-8 text-center md:col-span-2">
                <p className="font-bold">Chưa tải được đánh giá</p>
                <button
                  type="button"
                  className="btn-pill-outline mt-4"
                  onClick={() => void result.refetch()}
                >
                  Thử lại
                </button>
              </div>
            ) : rows.length === 0 ? (
              <div className="card-soft p-10 text-center md:col-span-2">
                <SearchX className="mx-auto h-10 w-10 text-primary" aria-hidden />
                <p className="mt-3 font-bold">Không tìm thấy đánh giá phù hợp</p>
                {hasFilters && (
                  <button
                    type="button"
                    className="btn-pill-outline mt-4"
                    onClick={() => onChange({ sort: search.sort })}
                  >
                    Xoá bộ lọc
                  </button>
                )}
              </div>
            ) : (
              rows.map((r, i) => (
                <div
                  key={r.id}
                  className="animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <ReviewCard review={r} now={now} />
                </div>
              ))
            )}
          </div>

          {pageCount > 1 && (
            <nav
              aria-label="Phân trang"
              className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="grid h-10 w-10 place-items-center rounded-full border transition-colors hover:bg-secondary disabled:opacity-40"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageNumbers(page, pageCount).map((p, i) =>
                p === "gap" ? (
                  <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={cn(
                      "h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition-colors",
                      p === page
                        ? "bg-primary text-primary-foreground"
                        : "border hover:bg-secondary",
                    )}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= pageCount}
                className="grid h-10 w-10 place-items-center rounded-full border transition-colors hover:bg-secondary disabled:opacity-40"
                aria-label="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}

          <section id="viet-danh-gia" className="mt-16 scroll-mt-24" aria-label="Viết đánh giá">
            <Reveal>
              <ReviewForm />
            </Reveal>
          </section>
        </div>
      </div>
    </div>
  );
}
