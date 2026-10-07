import { BookOpen, Eye, Scale, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { useScrollSpy } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { chapters } from "./data";

const ICONS = [BookOpen, Eye, ShieldCheck, Scale];
const chapterId = (no: number) => `chuong-${no}`;
const CHAPTER_IDS = chapters.map((c) => chapterId(c.no));

function TableOfContents() {
  const active = useScrollSpy(CHAPTER_IDS);
  return (
    <nav aria-label="Mục lục cẩm nang">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mục lục</p>
      <ol className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
        {chapters.map((c, i) => {
          const Icon = ICONS[i] ?? BookOpen;
          const isActive = active === chapterId(c.no);
          return (
            <li key={c.no} className="shrink-0">
              <a
                href={`#${chapterId(c.no)}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-300 lg:border-transparent",
                  isActive
                    ? "border-primary/30 bg-secondary font-semibold text-primary lg:border-primary/30"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors duration-300",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="max-w-[14rem] leading-snug">
                  <span className="block text-[11px] uppercase tracking-wider opacity-70">
                    Chương {c.no}
                  </span>
                  <span className="line-clamp-2">{c.title}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Handbook() {
  return (
    <div className="px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[17rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <TableOfContents />
        </aside>

        <div className="space-y-16">
          {chapters.map((c, ci) => {
            const Icon = ICONS[ci] ?? BookOpen;
            const ItemHeading = c.groups.length > 1 ? "h4" : "h3";
            let counter = 0;
            return (
              <section
                key={c.no}
                id={chapterId(c.no)}
                className="scroll-mt-24"
                aria-labelledby={`${chapterId(c.no)}-title`}
              >
                <Reveal as="header" className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
                    <Icon className="h-7 w-7" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Chương {c.no}
                    </p>
                    <h2
                      id={`${chapterId(c.no)}-title`}
                      className="text-2xl font-bold text-primary md:text-3xl"
                    >
                      {c.title}
                    </h2>
                  </div>
                </Reveal>

                <div className="mt-6 space-y-8">
                  {c.groups.map((g) => (
                    <div key={g.heading}>
                      {c.groups.length > 1 && (
                        <Reveal as="h3" className="mb-3 text-lg font-bold text-primary">
                          {g.heading}
                        </Reveal>
                      )}
                      <ol className="grid gap-3 md:grid-cols-2">
                        {g.items.map((it) => {
                          counter += 1;
                          return (
                            <Reveal
                              as="li"
                              key={it.title}
                              delay={(counter % 2) * 80}
                              data-spotlight
                              className="card-soft card-hover flex gap-4 p-5"
                            >
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary font-display font-bold text-primary">
                                {counter}
                              </span>
                              <div className="min-w-0">
                                <ItemHeading className="font-bold text-foreground">
                                  {it.title}
                                </ItemHeading>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                  {it.body}
                                </p>
                              </div>
                            </Reveal>
                          );
                        })}
                      </ol>
                    </div>
                  ))}
                  {c.note && (
                    <Reveal className="rounded-2xl border border-primary/40 bg-secondary p-5 text-sm leading-relaxed">
                      <strong className="text-primary">{c.note.label}</strong> {c.note.text}
                    </Reveal>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
