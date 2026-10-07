import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/deeptruth/SectionHeading";
import { JOURNEY } from "@/components/layout/site-nav";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

// Bento layout on a 6-column grid: two wide cards, then three.
const SPANS = ["md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-2", "md:col-span-2"];

export function FeatureGrid() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Hành trình 5 bước"
          title="Làm chủ Deepfake cùng DeepTruth"
          description="Từ hiểu bản chất công nghệ đến tự tin nhận diện, cảnh báo cộng đồng và tìm kiếm hỗ trợ khi cần."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {JOURNEY.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.to} delay={i * 80} className={cn(SPANS[i])}>
                <Link
                  to={p.to}
                  data-spotlight
                  className="card-soft card-hover group flex h-full flex-col overflow-hidden p-6"
                >
                  <span className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span
                      aria-hidden
                      className="font-display text-5xl font-extrabold leading-none text-primary/10 transition-colors duration-500 group-hover:text-primary/20"
                    >
                      0{p.step.index}
                    </span>
                  </span>
                  <span className="mt-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Bước {p.step.index} · {p.step.verb}
                  </span>
                  <span className="mt-1 font-display text-xl font-bold text-primary">
                    {p.label}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </span>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Mở trang
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
