import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Globe2, MapPinned, Plus, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInView } from "@/hooks/use-in-view";
import { pauseSmoothScroll, resumeSmoothScroll } from "@/lib/smooth-scroll";
import { formatClock } from "@/lib/time";
import { cn } from "@/lib/utils";
import { isUnavailable, type RegionStat, type ThreatRegion, type ThreatReport } from "./api";
import {
  useLocalVotes,
  useThreatFeed,
  useThreatRealtime,
  useThreatRegions,
  useThreatStats,
  type LiveStatus,
} from "./hooks";
import {
  CATEGORY_META,
  THREAT_CATEGORIES,
  dangerColor,
  dangerLabel,
  dangerRgb,
  shortRegionName,
  type ThreatCategory,
} from "./model";
import type { GlobeArc, GlobeMarker, GlobeView } from "./ThreatGlobe";
import { ThreatFeed } from "./ThreatFeed";
import { ThreatReportForm } from "./ThreatReportForm";
import { supportsWebGL } from "./webgl";

// cobe + WebGL code ships in its own chunk, fetched only when the map nears the viewport.
const ThreatGlobe = lazy(() => import("./ThreatGlobe"));

function buildMarkers(stats: RegionStat[]): GlobeMarker[] {
  const max = Math.max(1, ...stats.map((s) => s.reportCount));
  return stats.flatMap((s) =>
    s.latitude !== null && s.longitude !== null
      ? [
          {
            lat: s.latitude,
            lng: s.longitude,
            size: 0.028 + (s.reportCount / max) * 0.055,
            color: dangerRgb(s.avgDanger),
            pulse: s.reportsLast7d > 0,
          },
        ]
      : [],
  );
}

/** Links consecutive reports of the same tactic in different places ("same scam, spreading"). */
function buildArcs(reports: ThreatReport[], regions: Map<string, ThreatRegion>): GlobeArc[] {
  const arcs: GlobeArc[] = [];
  const seen = new Set<string>();
  for (const category of THREAT_CATEGORIES) {
    const chain = reports.flatMap((r) => {
      const region = regions.get(r.region_code);
      return r.category === category && region?.latitude != null && region.longitude != null
        ? [{ code: region.code, lat: region.latitude, lng: region.longitude }]
        : [];
    });
    let added = 0;
    for (let i = 0; i + 1 < chain.length && added < 3; i++) {
      const newer = chain[i]!;
      const older = chain[i + 1]!;
      const key = `${older.code}>${newer.code}`;
      if (older.code === newer.code || seen.has(key)) continue;
      seen.add(key);
      arcs.push({
        from: [older.lat, older.lng],
        to: [newer.lat, newer.lng],
        color: CATEGORY_META[category].rgb,
      });
      added++;
    }
  }
  return arcs.slice(0, 12);
}

function LiveBadge({ status, updatedAt }: { status: LiveStatus; updatedAt: number }) {
  const label =
    status === "live"
      ? "Trực tiếp"
      : status === "offline"
        ? "Mất kết nối trực tiếp"
        : "Đang kết nối…";
  return (
    <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-full border bg-card/90 px-4 py-1.5 text-xs font-semibold">
      <span
        className={cn("live-dot", status !== "live" && "after:hidden")}
        style={status === "live" ? undefined : { background: "var(--muted-foreground)" }}
        aria-hidden
      />
      {label}
      {updatedAt > 0 && (
        <span className="font-normal text-muted-foreground">
          · cập nhật {formatClock(updatedAt)}
        </span>
      )}
    </p>
  );
}

function GlobePlaceholder({ unsupported }: { unsupported?: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative grid aspect-square w-3/4 place-items-center rounded-full border border-primary/25 bg-[radial-gradient(circle_at_35%_30%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_65%)]">
        <Globe2 className="h-12 w-12 text-primary/50" aria-hidden />
        {unsupported && (
          <p className="absolute bottom-[18%] max-w-[70%] text-center text-xs text-muted-foreground">
            Trình duyệt không hỗ trợ WebGL — xem danh sách cảnh báo bên cạnh.
          </p>
        )}
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-border/60 p-4">
          <div className="skeleton-shimmer h-4 w-1/3 rounded-full" />
          <div className="skeleton-shimmer mt-3 h-4 w-4/5 rounded-full" />
          <div className="skeleton-shimmer mt-2 h-3 w-full rounded-full" />
          <div className="skeleton-shimmer mt-2 h-3 w-2/3 rounded-full" />
        </div>
      ))}
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    icon: Plus,
    title: "Gửi báo cáo ẩn danh",
    text: "Chia sẻ thủ đoạn, kênh và khu vực bạn gặp. Không cần tài khoản, không lưu thông tin cá nhân.",
  },
  {
    icon: ShieldAlert,
    title: "Cộng đồng chấm điểm",
    text: "Mỗi trình duyệt chấm mức nguy hiểm 1–5 một lần cho mỗi báo cáo; điểm là trung bình của cộng đồng.",
  },
  {
    icon: MapPinned,
    title: "Bản đồ cập nhật tức thì",
    text: "Báo cáo và điểm số mới xuất hiện trực tiếp trên mọi thiết bị đang mở bản đồ.",
  },
];

export function ThreatMapSection() {
  // Start fetching data and the globe chunk well before the section is on screen.
  const [sectionRef, nearView] = useInView<HTMLElement>({ rootMargin: "600px 0px", once: true });
  const regionsQuery = useThreatRegions(nearView);
  const feedQuery = useThreatFeed(nearView);
  const { regionStats, categoryStats } = useThreatStats(nearView);
  const queries = [regionsQuery, feedQuery, regionStats, categoryStats];
  const unavailable = queries.some((q) => isUnavailable(q.error));
  const failed = !unavailable && queries.some((q) => q.isError);
  const liveStatus = useThreatRealtime(nearView && !unavailable);
  const votes = useLocalVotes();

  const [view, setView] = useState<GlobeView>("vietnam");
  const [category, setCategory] = useState<ThreatCategory | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    if (nearView) setWebgl(supportsWebGL());
  }, [nearView]);

  useEffect(() => {
    if (formOpen) pauseSmoothScroll();
    else resumeSmoothScroll();
  }, [formOpen]);
  useEffect(() => resumeSmoothScroll, []);

  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);
  const reports = useMemo(() => feedQuery.data ?? [], [feedQuery.data]);
  const regionsByCode = useMemo(() => new Map(regions.map((r) => [r.code, r])), [regions]);
  const markers = useMemo(() => buildMarkers(regionStats.data ?? []), [regionStats.data]);
  const arcs = useMemo(() => buildArcs(reports, regionsByCode), [reports, regionsByCode]);
  const visibleReports =
    category === "all" ? reports : reports.filter((r) => r.category === category);

  const selectedRegion = useMemo(() => {
    const report = reports.find((r) => r.id === selectedId);
    return report ? regionsByCode.get(report.region_code) : undefined;
  }, [reports, selectedId, regionsByCode]);
  const focus = useMemo(
    () =>
      selectedRegion?.latitude != null && selectedRegion.longitude != null
        ? { lat: selectedRegion.latitude, lng: selectedRegion.longitude }
        : null,
    [selectedRegion],
  );

  const kpis = useMemo(() => {
    const cats = categoryStats.data ?? [];
    const total = cats.reduce((n, c) => n + c.reportCount, 0);
    const recent = cats.reduce((n, c) => n + c.reportsLast7d, 0);
    const scored = cats.filter((c) => c.avgDanger !== null);
    const weight = scored.reduce((n, c) => n + c.reportCount, 0);
    const avg = weight
      ? scored.reduce((n, c) => n + (c.avgDanger ?? 0) * c.reportCount, 0) / weight
      : null;
    const hottest = [...(regionStats.data ?? [])].sort(
      (a, b) => b.reportsLast7d - a.reportsLast7d || b.reportCount - a.reportCount,
    )[0];
    // Short label for the online bucket, so "TP. Hồ Chí Minh" is the longest name shown here.
    const hottestName = hottest ? shortRegionName(hottest) : null;
    return { total, recent, avg, hottest: hottestName };
  }, [categoryStats.data, regionStats.data]);

  const categoryCounts = useMemo(
    () => new Map((categoryStats.data ?? []).map((c) => [c.category, c])),
    [categoryStats.data],
  );
  const topRegions = useMemo(
    () => [...(regionStats.data ?? [])].sort((a, b) => b.reportCount - a.reportCount).slice(0, 5),
    [regionStats.data],
  );
  const topMax = topRegions[0]?.reportCount ?? 1;

  function selectReport(report: ThreatReport) {
    setSelectedId((prev) => (prev === report.id ? null : report.id));
    setView("vietnam");
  }

  function onSubmitted(id: string) {
    setFormOpen(false);
    setCategory("all");
    setSelectedId(id);
    setView("vietnam");
    toast.success("Đã gửi cảnh báo! Cảm ơn bạn đã giúp cộng đồng an toàn hơn.");
  }

  const loadingFeed =
    nearView && (feedQuery.isPending || regionsQuery.isPending) && !unavailable && !failed;

  return (
    <section
      ref={sectionRef}
      aria-label="Bảng điều khiển bản đồ cảnh báo"
      className="ops-theme ops-grid-bg relative overflow-hidden px-4 pb-20 pt-4"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {unavailable ? (
            <span />
          ) : (
            <LiveBadge status={liveStatus} updatedAt={feedQuery.dataUpdatedAt} />
          )}
          <button
            type="button"
            className="btn-pill px-5 py-2.5 text-sm"
            onClick={() => setFormOpen(true)}
            disabled={unavailable}
          >
            <Plus className="h-4 w-4" /> Báo cáo vụ việc
          </button>
        </div>

        {/* Phones: three numbers in a row, the hotspot name on its own full-width row.
            Wider screens: one row, with a wider column so every city name fits on one line. */}
        <dl className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-[1fr_1fr_1fr_1.6fr]">
          {[
            { label: "Tổng báo cáo", value: <CountUp value={kpis.total} />, wide: false },
            { label: "Trong 7 ngày qua", value: <CountUp value={kpis.recent} />, wide: false },
            {
              label: "Mức nguy hiểm TB",
              value:
                kpis.avg === null ? (
                  "—"
                ) : (
                  <span style={{ color: dangerColor(kpis.avg) }}>
                    <CountUp value={kpis.avg} decimals={1} />
                    <span className="text-sm sm:text-base">/5</span>
                  </span>
                ),
              wide: false,
            },
            { label: "Điểm nóng tuần này", value: kpis.hottest ?? "—", wide: true },
          ].map((k, i) => (
            <Reveal
              key={k.label}
              delay={i * 70}
              className={cn(
                "card-soft flex flex-col justify-between px-3 py-3 sm:px-4 sm:py-4",
                k.wide && "col-span-3 md:col-span-1",
              )}
            >
              <dt className="text-[11px] font-medium uppercase leading-snug tracking-wider text-muted-foreground sm:text-xs">
                {k.label}
              </dt>
              <dd
                className={cn(
                  "mt-1 break-words font-display font-extrabold leading-tight",
                  // Sized so "1.234", "4,0/5" and "TP. Hồ Chí Minh" each stay on one line, 320–1920px.
                  k.wide
                    ? "text-2xl lg:text-3xl"
                    : "text-xl min-[360px]:text-2xl md:text-[1.7rem] lg:text-3xl",
                )}
              >
                {k.value}
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Reveal variant="scale" className="card-soft relative overflow-hidden p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 font-bold">
                <MapPinned className="h-5 w-5 text-primary" aria-hidden /> Bản đồ nhiệt
              </p>
              <div
                role="radiogroup"
                aria-label="Chế độ xem"
                className="inline-flex rounded-full border bg-background/40 p-1 text-xs font-semibold"
              >
                {(
                  [
                    ["vietnam", "Việt Nam"],
                    ["global", "Toàn cầu"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={view === value}
                    onClick={() => setView(value)}
                    className={cn(
                      "rounded-full px-3 py-1.5 transition-colors duration-200",
                      view === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mx-auto mt-4 aspect-square w-full max-w-[560px]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[6%] rounded-full border border-primary/15"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[6%] animate-[radar-sweep_6s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,color-mix(in_oklab,var(--primary)_18%,transparent)_40deg,transparent_70deg)]"
              />
              {webgl ? (
                <Suspense fallback={<GlobePlaceholder />}>
                  <ThreatGlobe markers={markers} arcs={arcs} view={view} focus={focus} />
                </Suspense>
              ) : (
                <GlobePlaceholder unsupported={webgl === false} />
              )}
              {[
                "left-0 top-0 border-l-2 border-t-2",
                "right-0 top-0 border-r-2 border-t-2",
                "bottom-0 left-0 border-b-2 border-l-2",
                "bottom-0 right-0 border-b-2 border-r-2",
              ].map((pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={cn("pointer-events-none absolute h-6 w-6 border-primary/50", pos)}
                />
              ))}
              <p className="pointer-events-none absolute bottom-2 left-3 max-w-[calc(100%-1.5rem)] rounded-md bg-background/80 px-2 py-1 font-mono text-[11px] text-primary">
                {view === "global"
                  ? "TOÀN CẦU · kéo để xoay"
                  : `MỤC TIÊU · ${(selectedRegion ? shortRegionName(selectedRegion) : "Việt Nam").toUpperCase()}`}
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>Thấp</span>
                <span
                  aria-hidden
                  className="h-2 flex-1 rounded-full bg-[linear-gradient(90deg,var(--danger-1),var(--danger-2),var(--danger-3),var(--danger-4),var(--danger-5))]"
                />
                <span>Nghiêm trọng</span>
              </div>
              <p>
                Kích thước điểm = số báo cáo · màu = mức nguy hiểm trung bình · đường cung = cùng
                thủ đoạn xuất hiện liên tiếp ở nhiều nơi.
              </p>
            </div>

            {topRegions.length > 0 && (
              <div className="mt-5 border-t border-border/60 pt-4">
                <p className="text-sm font-bold">Khu vực có nhiều báo cáo nhất</p>
                <ol className="mt-3 space-y-2">
                  {topRegions.map((r) => (
                    <li
                      key={r.regionCode}
                      className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3 text-sm"
                    >
                      <span className="leading-tight">{shortRegionName(r)}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full transition-[width] duration-1000 ease-[var(--ease-out-expo)]"
                          style={{
                            width: `${Math.max(8, (r.reportCount / topMax) * 100)}%`,
                            backgroundColor: dangerColor(r.avgDanger),
                          }}
                        />
                      </span>
                      <span className="tabular-nums text-muted-foreground">{r.reportCount}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Reveal>

          <Reveal
            variant="scale"
            delay={120}
            className="card-soft flex flex-col p-4 sm:p-6 lg:min-h-[32rem]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="flex items-center gap-2 whitespace-nowrap font-bold">
                <ShieldAlert className="h-5 w-5 self-center text-primary" aria-hidden /> Luồng cảnh
                báo
              </p>
              <p className="text-xs text-muted-foreground">
                Chạm vào báo cáo để định vị trên bản đồ
              </p>
            </div>

            <div
              className="mt-4 flex flex-wrap gap-2"
              role="toolbar"
              aria-label="Lọc theo thủ đoạn"
            >
              {(["all", ...THREAT_CATEGORIES] as const).map((c) => {
                const count =
                  c === "all" ? reports.length : reports.filter((r) => r.category === c).length;
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {c === "all" ? "Tất cả" : CATEGORY_META[c].label} · {count}
                  </button>
                );
              })}
            </div>

            <div
              data-lenis-prevent
              className="scrollbar-thin -mr-2 mt-4 max-h-[min(36rem,70dvh)] flex-1 overflow-y-auto pr-2"
            >
              {!nearView || loadingFeed ? (
                <FeedSkeleton />
              ) : unavailable ? (
                <div className="grid h-full place-items-center py-12 text-center">
                  <div>
                    <Sparkles className="mx-auto h-10 w-10 text-primary" aria-hidden />
                    <p className="mt-3 font-bold">Bản đồ cảnh báo đang được khởi tạo</p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                      Hệ thống dữ liệu cho tính năng này đang được kích hoạt. Vui lòng quay lại sau
                      ít phút nhé!
                    </p>
                  </div>
                </div>
              ) : failed ? (
                <div className="grid h-full place-items-center py-12 text-center">
                  <div>
                    <p className="font-bold">Không tải được dữ liệu cảnh báo</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Kiểm tra kết nối mạng rồi thử lại.
                    </p>
                    <button
                      type="button"
                      className="btn-pill-outline mt-4 px-4 py-2 text-sm"
                      onClick={() => queries.forEach((q) => void q.refetch())}
                    >
                      <RefreshCw className="h-4 w-4" /> Thử lại
                    </button>
                  </div>
                </div>
              ) : visibleReports.length === 0 ? (
                <div className="grid h-full place-items-center py-12 text-center">
                  <div>
                    <ShieldAlert className="mx-auto h-10 w-10 text-primary" aria-hidden />
                    <p className="mt-3 font-bold">
                      {reports.length === 0
                        ? "Chưa có báo cáo nào"
                        : "Chưa có báo cáo cho thủ đoạn này"}
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                      Bạn từng gặp một vụ Deepfake? Hãy là người đầu tiên cảnh báo cộng đồng.
                    </p>
                  </div>
                </div>
              ) : (
                <ThreatFeed
                  reports={visibleReports}
                  regions={regionsByCode}
                  votes={votes}
                  selectedId={selectedId}
                  onSelect={selectReport}
                />
              )}
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {THREAT_CATEGORIES.map((c, i) => {
            const meta = CATEGORY_META[c];
            const stat = categoryCounts.get(c);
            const Icon = meta.icon;
            return (
              <Reveal key={c} delay={i * 60}>
                <button
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={cn(
                    "card-soft card-hover flex h-full w-full flex-col p-4 text-left",
                    category === c && "border-primary/60",
                  )}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{
                      color: meta.color,
                      backgroundColor: `color-mix(in oklab, ${meta.color} 15%, transparent)`,
                    }}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="mt-3 font-bold leading-snug">{meta.label}</span>
                  <span className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {meta.description}
                  </span>
                  <span className="mt-3 text-xs font-semibold">
                    {stat?.reportCount ?? 0} báo cáo
                    {stat?.avgDanger != null && (
                      <span style={{ color: dangerColor(stat.avgDanger) }}>
                        {" "}
                        · {dangerLabel(stat.avgDanger)}
                      </span>
                    )}
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-16">
          <Reveal as="h2" className="text-center text-2xl font-bold md:text-3xl">
            Cách bản đồ hoạt động
          </Reveal>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 100} className="card-soft relative p-6">
                <span
                  aria-hidden
                  className="absolute right-5 top-4 font-display text-5xl font-extrabold text-primary/10"
                >
                  0{i + 1}
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 font-bold">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          data-lenis-prevent
          className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto overscroll-contain rounded-2xl p-5 supports-[height:100dvh]:max-h-[90dvh] sm:max-w-2xl sm:p-6"
        >
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">Báo cáo một vụ Deepfake</DialogTitle>
            <DialogDescription>
              Chia sẻ ẩn danh vụ việc bạn gặp để cộng đồng cùng phân tích và chấm điểm mức độ nguy
              hiểm. Nếu bạn là nạn nhân, hãy gọi 113 hoặc gửi báo cáo bảo mật cho Nhóm NCKH ở trang
              Báo cáo.
            </DialogDescription>
          </DialogHeader>
          <ThreatReportForm regions={regions} onSubmitted={onSubmitted} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
