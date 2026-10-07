import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo, useNow } from "@/lib/time";
import type { ThreatRegion, ThreatReport } from "./api";
import { DangerMeter, DangerVote } from "./Danger";
import { CATEGORY_META, CHANNEL_META, dangerScoreOf } from "./model";

type Props = {
  reports: ThreatReport[];
  regions: Map<string, ThreatRegion>;
  votes: Record<string, number>;
  selectedId: string | null;
  onSelect: (report: ThreatReport) => void;
};

export function ThreatFeed({ reports, regions, votes, selectedId, onSelect }: Props) {
  const now = useNow();
  // Reports present on first load render plainly; anything arriving later animates in.
  const initialIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (initialIds.current === null && reports.length > 0) {
      initialIds.current = new Set(reports.map((r) => r.id));
    }
  }, [reports]);

  return (
    <ol className="space-y-3" aria-label="Báo cáo Deepfake mới nhất">
      {reports.map((r) => {
        const meta = CATEGORY_META[r.category];
        const channel = CHANNEL_META[r.channel];
        const region = regions.get(r.region_code);
        const selected = r.id === selectedId;
        const isNew = initialIds.current !== null && !initialIds.current.has(r.id);
        const Icon = meta.icon;
        const ChannelIcon = channel.icon;
        return (
          <li
            key={r.id}
            className={cn(
              "rounded-2xl border p-4 transition-[border-color,background-color,box-shadow] duration-300",
              selected
                ? "border-primary/60 bg-card shadow-[var(--shadow-lift)]"
                : "border-border/70 bg-card/55 hover:border-primary/35 hover:bg-card",
              isNew && "animate-[feed-enter_0.8s_var(--ease-out-expo)_both]",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(r)}
              aria-expanded={selected}
              className="block w-full rounded-lg text-left"
            >
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
                  style={{
                    color: meta.color,
                    backgroundColor: `color-mix(in oklab, ${meta.color} 15%, transparent)`,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden /> {meta.label}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {region?.name ?? "Không rõ"}
                </span>
                <time dateTime={r.created_at} className="ml-auto text-muted-foreground">
                  {timeAgo(r.created_at, now)}
                </time>
              </span>
              <span className="mt-2 block font-bold leading-snug">{r.title}</span>
              <span
                className={cn(
                  "mt-1 block whitespace-pre-line text-sm leading-relaxed text-muted-foreground",
                  !selected && "line-clamp-2",
                )}
              >
                {r.description}
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ChannelIcon className="h-3.5 w-3.5" aria-hidden /> {channel.label}
              </span>
            </button>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/60 pt-3">
              <DangerMeter score={dangerScoreOf(r)} votes={r.vote_count} />
              <DangerVote reportId={r.id} myVote={votes[r.id]} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
