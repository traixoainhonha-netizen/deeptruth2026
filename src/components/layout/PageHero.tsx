import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOURNEY, pageFor, type PagePath } from "./site-nav";

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/** Soft animated colour fields behind page heroes (transform-only, GPU friendly). */
export function Aurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="aurora-a absolute -left-[10%] -top-1/3 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_65%)]" />
      <div className="aurora-b absolute -right-[12%] top-[10%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--success)_20%,transparent),transparent_65%)]" />
    </div>
  );
}

/** The five-step learning journey, with the current page highlighted. */
function JourneyProgress({ current }: { current: PagePath }) {
  const currentIndex = JOURNEY.findIndex((p) => p.to === current);
  return (
    <ol
      className="scrollbar-thin mt-10 flex gap-2 overflow-x-auto pb-1"
      aria-label="Hành trình DeepTruth"
    >
      {JOURNEY.map((p, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "todo";
        return (
          <li key={p.to} className="min-w-[9.5rem] flex-1">
            <Link
              to={p.to}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-all duration-300",
                state === "current"
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "bg-background/60 backdrop-blur-sm hover:-translate-y-0.5 hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                  state === "current"
                    ? "bg-primary-foreground text-primary"
                    : state === "done"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-primary",
                )}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden /> : p.step.index}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-[11px] font-semibold uppercase tracking-wider",
                    state === "current" ? "opacity-80" : "text-muted-foreground",
                  )}
                >
                  {p.step.verb}
                </span>
                <span className="block truncate font-bold">{p.label}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

type Props = {
  page: PagePath;
  title: ReactNode;
  description: ReactNode;
  /** Dark "operations center" styling, used by the threat map. */
  tone?: "light" | "dark";
  actions?: ReactNode;
};

export function PageHero({ page, title, description, tone = "light", actions }: Props) {
  const meta = pageFor(page);
  const Icon = meta.icon;
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden px-4 pb-12 pt-8 md:pb-16 md:pt-12",
        tone === "dark" ? "ops-theme ops-grid-bg" : "tech-bg",
      )}
    >
      <Aurora />
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="animate-rise">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="transition-colors hover:text-primary">
                Trang chủ
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <li aria-current="page" className="font-semibold text-foreground">
              {meta.label}
            </li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            {meta.step && (
              <p
                className="animate-rise inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary"
                style={delay(60)}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                Bước {meta.step.index}/{JOURNEY.length} · {meta.step.verb}
              </p>
            )}
            <h1
              className="animate-rise mt-4 text-4xl font-extrabold leading-[1.1] text-primary md:text-5xl"
              style={delay(120)}
            >
              {title}
            </h1>
            <p
              className="animate-rise mt-4 max-w-2xl text-lg text-muted-foreground"
              style={delay(180)}
            >
              {description}
            </p>
          </div>
          {actions && (
            <div className="animate-rise flex shrink-0 flex-wrap gap-3" style={delay(240)}>
              {actions}
            </div>
          )}
        </div>

        <div className="animate-rise" style={delay(300)}>
          <JourneyProgress current={page} />
        </div>
      </div>
    </section>
  );
}
