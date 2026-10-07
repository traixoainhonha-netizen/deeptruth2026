import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = ["Rất tệ", "Chưa tốt", "Bình thường", "Tốt", "Tuyệt vời"];

/** Read-only stars; fractional values partially fill a star (e.g. 4.3). */
export function StarRating({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex gap-0.5", className)}
      role="img"
      aria-label={`${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} trên 5 sao`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block h-[1em] w-[1em]">
            <Star className="absolute inset-0 h-full w-full text-border" aria-hidden />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="h-[1em] w-[1em] fill-warning text-warning" aria-hidden />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Accessible star picker built on native radio inputs (arrow keys work out of the box). */
export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  return (
    <fieldset className="flex items-center gap-3">
      <legend className="sr-only">Chấm số sao</legend>
      <div className="flex gap-1" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <label key={i} className="cursor-pointer" onMouseEnter={() => setHover(i)}>
            <input
              type="radio"
              name="review-rating"
              value={i}
              checked={value === i}
              onChange={() => onChange(i)}
              className="peer sr-only"
            />
            <Star
              aria-hidden
              className={cn(
                "h-8 w-8 rounded-sm transition-transform duration-200 hover:scale-110 peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                i <= shown ? "fill-warning text-warning" : "text-border",
              )}
            />
            <span className="sr-only">
              {i} sao – {LABELS[i - 1]}
            </span>
          </label>
        ))}
      </div>
      <span className="text-sm font-semibold text-muted-foreground" aria-live="polite">
        {LABELS[shown - 1] ?? ""}
      </span>
    </fieldset>
  );
}
