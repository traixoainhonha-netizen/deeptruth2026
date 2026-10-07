import { Star } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { cn } from "@/lib/utils";
import type { ReviewStats } from "./api";
import { StarRating } from "./Stars";

type Props = {
  stats: ReviewStats | undefined;
  /** When provided, each bar becomes a filter button. */
  onSelectRating?: (rating: number | undefined) => void;
  activeRating?: number | undefined;
  className?: string;
};

export function RatingSummary({ stats, onSelectRating, activeRating, className }: Props) {
  const total = stats?.total ?? 0;
  return (
    <div className={cn("card-soft p-6", className)}>
      <div className="flex items-end gap-3">
        <p className="font-display text-5xl font-extrabold leading-none text-primary">
          {stats ? <CountUp value={stats.average} decimals={1} /> : "–"}
        </p>
        <div className="pb-1">
          <StarRating value={stats?.average ?? 0} className="text-lg" />
          <p className="text-sm text-muted-foreground">
            {stats ? `${total.toLocaleString("vi-VN")} đánh giá` : "Đang tải…"}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats?.distribution[star - 1] ?? 0;
          const pct = total ? (count / total) * 100 : 0;
          const active = activeRating === star;
          const content = (
            <>
              <span className="flex w-8 shrink-0 items-center gap-0.5 font-semibold">
                {star} <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-warning transition-[width] duration-1000 ease-[var(--ease-out-expo)]"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">
                {count}
              </span>
            </>
          );
          return (
            <li key={star}>
              {onSelectRating ? (
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectRating(active ? undefined : star)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-secondary",
                    active && "bg-secondary ring-1 ring-primary/30",
                  )}
                  aria-label={`Lọc đánh giá ${star} sao (${count})`}
                >
                  {content}
                </button>
              ) : (
                <div className="flex items-center gap-3 px-2 py-1 text-sm">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
