import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { nextPage, type PagePath } from "./site-nav";

/** Closing call-to-action that walks the visitor to the next step of the journey. */
export function NextStep({ from }: { from: PagePath }) {
  const next = nextPage(from);
  if (!next) return null;
  const Icon = next.icon;
  return (
    <section className="px-4 pb-20 pt-4">
      <Reveal className="mx-auto max-w-6xl">
        <Link
          to={next.to}
          data-spotlight
          className="card-soft card-hover group flex flex-col gap-5 overflow-hidden p-6 sm:flex-row sm:items-center md:p-8"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
            <Icon className="h-7 w-7" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tiếp theo · Bước {next.step.index}: {next.step.verb}
            </span>
            <span className="mt-1 block font-display text-2xl font-extrabold text-primary">
              {next.label}
            </span>
            <span className="mt-1 block text-muted-foreground">{next.description}</span>
          </span>
          <span className="btn-pill shrink-0 self-start sm:self-center">
            Đi tiếp
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
