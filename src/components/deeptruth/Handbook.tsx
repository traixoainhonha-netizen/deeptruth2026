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
            const Icon = icons[i];
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
                  <ul className="space-y-3 border-t bg-muted px-5 py-5 md:px-6">
                    {c.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sm leading-relaxed">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
