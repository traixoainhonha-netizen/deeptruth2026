import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Radar } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { isUnavailable } from "@/components/deeptruth/threat-map/api";
import {
  useThreatFeed,
  useThreatRegions,
  useThreatStats,
} from "@/components/deeptruth/threat-map/hooks";
import { CATEGORY_META } from "@/components/deeptruth/threat-map/model";
import { useInView } from "@/hooks/use-in-view";
import { timeAgo, useNow } from "@/lib/time";

export function MapTeaser() {
  const [ref, nearView] = useInView<HTMLElement>({ rootMargin: "500px 0px", once: true });
  const feed = useThreatFeed(nearView);
  const regions = useThreatRegions(nearView);
  const { regionStats, categoryStats } = useThreatStats(nearView);
  const unavailable = [feed, regions, regionStats, categoryStats].some((q) =>
    isUnavailable(q.error),
  );
  const now = useNow();

  const regionNames = useMemo(
    () => new Map((regions.data ?? []).map((r) => [r.code, r.name])),
    [regions.data],
  );
  const total = (categoryStats.data ?? []).reduce((n, c) => n + c.reportCount, 0);
  const recent = (categoryStats.data ?? []).reduce((n, c) => n + c.reportsLast7d, 0);
  const regionCount = (regionStats.data ?? []).length;
  const latest = (feed.data ?? []).slice(0, 3);

  return (
    <section
      ref={ref}
      className="ops-theme ops-grid-bg relative isolate overflow-hidden px-4 py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal variant="left">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="live-dot" aria-hidden /> Bước 3 · Theo dõi
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Bản đồ cảnh báo Deepfake <span className="text-primary">thời gian thực</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Mô phỏng một trung tâm giám sát an ninh mạng: cộng đồng báo cáo những vụ Deepfake gặp
            ngoài đời thực, cùng phân tích và chấm điểm mức độ nguy hiểm.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: "Báo cáo", value: total },
              { label: "7 ngày qua", value: recent },
              { label: "Khu vực", value: regionCount },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border bg-card/60 px-4 py-3 backdrop-blur">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  {k.label}
                </dt>
                <dd className="font-display text-3xl font-extrabold text-primary">
                  <CountUp value={k.value} />
                </dd>
              </div>
            ))}
          </dl>
          <Link to="/ban-do" className="btn-pill group mt-8">
            <Radar className="h-4 w-4" /> Mở bản đồ cảnh báo
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal variant="right" className="card-soft overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-2 text-primary">
              <span className="live-dot" aria-hidden /> LUỒNG CẢNH BÁO
            </span>
            <span>{latest.length ? `${latest.length} mới nhất` : "đang chờ dữ liệu"}</span>
          </div>
          <ul className="divide-y divide-border/60">
            {latest.length > 0 ? (
              latest.map((r) => {
                const meta = CATEGORY_META[r.category];
                const Icon = meta.icon;
                return (
                  <li key={r.id} className="flex gap-3 px-5 py-4">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{
                        color: meta.color,
                        backgroundColor: `color-mix(in oklab, ${meta.color} 15%, transparent)`,
                      }}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{r.title}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <span style={{ color: meta.color }}>{meta.label}</span>·
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden />
                          {regionNames.get(r.region_code) ?? "—"}
                        </span>
                        · {timeAgo(r.created_at, now)}
                      </span>
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="px-5 py-12 text-center text-sm text-muted-foreground">
                {unavailable
                  ? "Bản đồ cảnh báo đang được khởi tạo."
                  : !nearView || feed.isPending
                    ? "Đang kết nối luồng cảnh báo…"
                    : "Chưa có báo cáo nào — hãy là người đầu tiên cảnh báo cộng đồng."}
              </li>
            )}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
