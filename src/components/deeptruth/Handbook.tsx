import { useState } from "react";
import { BookOpen, Eye, ShieldCheck, Scale, ChevronDown } from "lucide-react";
import { chapters } from "./data";

const icons = [BookOpen, Eye, ShieldCheck, Scale];

export function Handbook() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="cam-nang" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">Phần 1</p>
        <h2 className="mt-2 text-center text-3xl font-bold text-primary md:text-4xl">Cẩm nang nhận biết</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Trang bị kiến thức khoa học để nhận diện chính xác ảnh, cuộc gọi và giọng nói giả mạo.
        </p>
        <div className="mt-10 space-y-4">
          {chapters.map((c, i) => {
            const Icon = icons[i] ?? BookOpen;
            const isOpen = open === i;
            return (
              <div key={c.no} className="card-soft overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 p-4 text-left md:p-5"
                  aria-expanded={isOpen}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase text-muted-foreground">Chương {c.no}</span>
                    <span className="block font-bold">{c.title}</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="space-y-6 border-t bg-muted px-4 py-5 md:px-6">
                    {c.groups.map((g, gi) => (
                      <div key={g.heading}>
                        {c.groups.length > 1 && (
                          <h3 className="mb-3 text-lg font-bold text-primary">{g.heading}</h3>
                        )}
                        <ol className="space-y-3">
                          {g.items.map((it, idx) => (
                            <li key={it.title} className="flex gap-4 rounded-2xl border bg-card p-4">
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display font-bold text-primary-foreground">
                                {c.groups.slice(0, gi).reduce((n, x) => n + x.items.length, 0) + idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground">{it.title}</p>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                    {c.note && (
                      <p className="rounded-2xl border border-primary/40 bg-secondary p-4 text-sm leading-relaxed">
                        <strong className="text-primary">{c.note.label}</strong> {c.note.text}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
