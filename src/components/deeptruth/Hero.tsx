import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Radar, ScanEye } from "lucide-react";
import { Aurora } from "@/components/layout/PageHero";
import { cn } from "@/lib/utils";
import { chapters, quiz } from "./data";
import { HERO_IMAGE } from "./hero-image";

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

const STATS = [
  {
    to: "/cam-nang",
    icon: BookOpen,
    value: String(chapters.length),
    label: "Chương cẩm nang",
    hint: "Kiến thức nhận diện từ A đến Z",
    live: false,
  },
  {
    to: "/thu-thach",
    icon: ScanEye,
    value: String(quiz.length),
    label: "Thử thách thật – giả",
    hint: "Video và hình ảnh thực tế",
    live: false,
  },
  {
    to: "/ban-do",
    icon: Radar,
    value: "Live",
    label: "Bản đồ cảnh báo",
    hint: "Cập nhật theo thời gian thực",
    live: true,
  },
] as const;

export function Hero() {
  return (
    <section className="tech-bg relative isolate overflow-hidden px-4 pb-14 pt-10 md:pb-20 md:pt-16">
      <Aurora />
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div className="text-center md:text-left">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-bold text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Cùng khám phá Deepfake nhé!
          </span>
          <h1
            className="animate-rise mt-5 text-4xl font-extrabold leading-[1.1] text-primary md:text-6xl"
            style={delay(80)}
          >
            Bạn đang nhìn thấy <span className="text-gradient">thật hay giả?</span>
          </h1>
          <p className="animate-rise mt-5 text-lg text-muted-foreground" style={delay(160)}>
            Hãy để chúng tôi đồng hành cùng bạn trong việc nhận diện và hiểu rõ hơn về Deepfake —
            chủ động trước những nội dung do AI tạo ra.
          </p>
          <div
            className="animate-rise mt-8 flex flex-wrap justify-center gap-3 md:justify-start"
            style={delay(240)}
          >
            <Link to="/cam-nang" className="btn-pill group">
              Khám phá ngay
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link to="/thu-thach" className="btn-pill-outline">
              Thử thách nhận biết
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div
            aria-hidden
            className="absolute inset-[10%] -z-10 rounded-full bg-primary/20 blur-3xl"
          />
          <img
            {...HERO_IMAGE}
            fetchPriority="high"
            decoding="async"
            alt="Học sinh soi kính lúp vào khuôn mặt nửa thật nửa giả trên điện thoại"
            className="animate-float w-full drop-shadow-[0_30px_40px_rgb(0_0_0/0.12)]"
          />
        </div>
      </div>

      {/* Quick-access strip: each cell is one link to the page behind the number. */}
      <dl
        className="animate-rise mx-auto mt-12 grid max-w-6xl overflow-hidden rounded-3xl border bg-background/80 shadow-[var(--shadow-soft)] backdrop-blur-md md:mt-16 md:grid-cols-3"
        style={delay(360)}
      >
        {STATS.map((s, i) => (
          <div
            key={s.to}
            data-spotlight
            className={cn(
              "group relative flex items-center gap-4 p-5 transition-colors duration-300 hover:bg-secondary/50 lg:p-6",
              i > 0 && "border-t md:border-l md:border-t-0",
            )}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 md:h-11 md:w-11 lg:h-12 lg:w-12">
              <s.icon className="h-6 w-6 md:h-5 md:w-5 lg:h-6 lg:w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-sm font-semibold text-muted-foreground">{s.label}</dt>
              <dd>
                <Link
                  to={s.to}
                  aria-label={`${s.label}: ${s.value} — ${s.hint}`}
                  className="flex items-center gap-2 font-display text-3xl font-extrabold leading-tight text-primary after:absolute after:inset-0"
                >
                  {s.live && <span className="live-dot" aria-hidden />}
                  {s.value}
                </Link>
                <span className="block truncate text-xs text-muted-foreground">{s.hint}</span>
              </dd>
            </div>
            <ArrowRight
              aria-hidden
              className="h-5 w-5 shrink-0 -translate-x-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </div>
        ))}
      </dl>
    </section>
  );
}
