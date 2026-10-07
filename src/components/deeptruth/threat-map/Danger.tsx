import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toThreatError } from "./api";
import { useVoteThreat } from "./hooks";
import { DANGER_LEVELS, dangerColor, dangerLabel } from "./model";

/** Five-segment gauge for a community danger score. */
export function DangerMeter({ score, votes }: { score: number | null; votes: number }) {
  const filled = score === null ? 0 : Math.round(score);
  return (
    <div
      className="flex items-center gap-2"
      title={`Mức nguy hiểm trung bình từ ${votes} lượt chấm`}
    >
      <div className="flex gap-0.5" aria-hidden>
        {DANGER_LEVELS.map((l) => (
          <span
            key={l.value}
            className="h-2.5 w-4 rounded-sm transition-colors duration-500"
            style={{
              backgroundColor:
                l.value <= filled
                  ? dangerColor(score)
                  : "color-mix(in oklab, var(--muted-foreground) 25%, transparent)",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold" style={{ color: dangerColor(score) }}>
        {score === null ? "Chưa chấm" : `${score.toFixed(1)}/5 · ${dangerLabel(score)}`}
      </span>
      <span className="sr-only">
        Mức nguy hiểm {score === null ? "chưa có" : `${score.toFixed(1)} trên 5`}, {votes} lượt chấm
      </span>
    </div>
  );
}

/** Lets this browser rate a report once; the database enforces the same rule. */
export function DangerVote({ reportId, myVote }: { reportId: string; myVote: number | undefined }) {
  const vote = useVoteThreat();
  const [hover, setHover] = useState<number | null>(null);

  if (myVote) {
    return (
      <p className="text-xs text-muted-foreground">
        Bạn đã chấm{" "}
        <strong style={{ color: dangerColor(myVote) }}>
          {myVote}/5 · {dangerLabel(myVote)}
        </strong>
      </p>
    );
  }

  const preview = hover ?? vote.variables?.score ?? null;

  return (
    <div
      role="group"
      aria-label="Chấm điểm mức độ nguy hiểm"
      className="flex items-center gap-1"
      onMouseLeave={() => setHover(null)}
    >
      <span className="mr-1 text-xs text-muted-foreground">
        {preview ? dangerLabel(preview) : "Chấm điểm:"}
      </span>
      {DANGER_LEVELS.map((l) => {
        const lit = preview !== null && l.value <= preview;
        return (
          <button
            key={l.value}
            type="button"
            disabled={vote.isPending}
            onMouseEnter={() => setHover(l.value)}
            onFocus={() => setHover(l.value)}
            onBlur={() => setHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              vote.mutate(
                { threatId: reportId, score: l.value },
                {
                  onSuccess: (result) =>
                    result.status === "duplicate"
                      ? toast.info("Bạn đã chấm điểm báo cáo này trước đó.")
                      : toast.success("Cảm ơn bạn đã góp phần đánh giá mức nguy hiểm!"),
                  onError: (error) => toast.error(toThreatError(error).message),
                },
              );
            }}
            aria-label={`${l.value} điểm – ${l.label}`}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-lg border text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60",
              lit ? "border-transparent text-black/80" : "bg-background/40 text-muted-foreground",
            )}
            style={lit ? { backgroundColor: dangerColor(preview) } : undefined}
          >
            {vote.isPending && vote.variables?.score === l.value ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              l.value
            )}
          </button>
        );
      })}
    </div>
  );
}
