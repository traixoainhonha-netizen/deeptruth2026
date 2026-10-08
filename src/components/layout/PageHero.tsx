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

type StepState = "done" | "current" | "todo";

function StepDot({
  state,
  index,
  className,
}: {
  state: StepState;
  index: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold transition-colors duration-300",
        state === "current"
          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
          : state === "done"
            ? "bg-primary text-primary-foreground"
            : "border-2 border-border bg-background text-muted-foreground",
        className,
      )}
    >
      {state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden /> : index}
    </span>
  );
}

/**
 * The five-step learning journey. Phones get five connected dots that always fit
 * the screen; wider screens get five equal cards. Nothing scrolls sideways.
 */
function JourneyProgress({ current }: { current: PagePath }) {
  const currentIndex = JOURNEY.findIndex((p) => p.to === current);
  const stateOf = (i: number): StepState =>
    i < currentIndex ? "done" : i === currentIndex ? "current" : "todo";
  // Dots sit at the centre of five equal columns: 10% … 90% of the row.
  const progress = Math.max(0, currentIndex) / (JOURNEY.length - 1);

  return (
    <nav aria-label="Hành trình DeepTruth" className="mt-10">
      <ol className="relative grid grid-cols-5 md:hidden">
        <span aria-hidden className="absolute left-[10%] right-[10%] top-4 h-0.5 bg-border" />
        <span
          aria-hidden
          className="absolute left-[10%] top-4 h-0.5 bg-primary transition-[width] duration-700"
          style={{ width: `${progress * 80}%` }}
        />
        {JOURNEY.map((p, i) => {
          const state = stateOf(i);
          return (
            <li key={p.to} className="relative flex justify-center">
              <Link
                to={p.to}
                aria-current={state === "current" ? "step" : undefined}
                aria-label={`Bước ${p.step.index}: ${p.label}`}
                className="flex flex-col items-center gap-1.5 px-0.5 text-center"
              >
                <StepDot state={state} index={p.step.index} className="h-8 w-8 text-xs" />
                <span
                  className={cn(
                    "text-[11px] font-semibold leading-tight",
                    state === "current" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {p.step.verb}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <ol className="hidden grid-cols-5 gap-2 md:grid">
        {JOURNEY.map((p, i) => {
          const state = stateOf(i);
          return (
            <li key={p.to}>
              <Link
                to={p.to}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex h-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-[transform,border-color] duration-300",
                  state === "current"
                    ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "bg-background/85 hover:-translate-y-0.5 hover:border-primary/40",
                )}
              >
                <StepDot
                  state={state}
                  index={p.step.index}
                  className={cn(
                    "h-6 w-6 text-xs",
                    state === "current" && "bg-primary-foreground text-primary ring-0",
                  )}
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[11px] font-semibold uppercase tracking-wider",
                      state === "current" ? "opacity-80" : "text-muted-foreground",
                    )}
                  >
                    {p.step.verb}
                  </span>
                  <span className="block font-bold leading-tight">{p.label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
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
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
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
              className="animate-rise mt-4 text-3xl font-extrabold leading-[1.15] text-primary sm:text-4xl md:text-5xl"
              style={delay(120)}
            >
              {title}
            </h1>
            <p
              className="animate-rise mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg"
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
