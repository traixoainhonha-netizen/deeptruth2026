import { useState } from "react";
import { CheckCircle2, XCircle, Headphones, RotateCcw, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { quiz, levelFor } from "./data";

export function Quiz() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<"real" | "fake" | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState<"idle" | "ok" | "err">("idle");

  const item = quiz[idx];
  const score = answers.filter(Boolean).length;

  function choose(c: "real" | "fake") {
    if (picked) return;
    setPicked(c);
    setAnswers((a) => [...a, c === item.answer]);
  }

  async function next() {
    if (idx < quiz.length - 1) {
      setIdx(idx + 1);
      setPicked(null);
      return;
    }
    setDone(true);
    const final = answers.filter(Boolean).length;
    const { error } = await supabase.from("quiz_results").insert({
      score: final,
      total: quiz.length,
      level: levelFor(final, quiz.length).label,
      answers,
    });
    setSaved(error ? "err" : "ok");
  }

  function restart() {
    setIdx(0); setPicked(null); setAnswers([]); setDone(false); setSaved("idle");
  }

  const correct = picked && picked === item.answer;
  const lv = levelFor(score, quiz.length);

  return (
    <section id="thu-thach" className="scroll-mt-20 bg-muted px-4 py-20">
      <div className="mx-auto max-w-2xl">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">Phần 2</p>
        <h2 className="mt-2 text-center text-3xl font-bold text-primary md:text-4xl">Phân biệt Thật – Giả</h2>

        {done ? (
          <div className="card-soft mt-10 p-8 text-center">
            <Trophy className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-4 text-5xl font-extrabold text-primary">{score}/{quiz.length}</p>
            <p className="mt-3 text-xl font-bold">{lv.label}</p>
            <p className="mt-2 text-muted-foreground">{lv.note}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {saved === "ok" && "Kết quả đã được lưu ẩn danh cho nghiên cứu. Cảm ơn bạn!"}
              {saved === "err" && "Chưa lưu được kết quả, nhưng bạn vẫn có thể thử lại."}
            </p>
            <button onClick={restart} className="btn-pill mt-6"><RotateCcw className="h-4 w-4" /> Làm lại</button>
          </div>
        ) : (
          <div className="card-soft mt-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 text-sm font-semibold text-muted-foreground">
              <span>Câu {idx + 1}/{quiz.length}</span>
              <span>Điểm: {score}</span>
            </div>
            <div className="mx-5 mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${(idx / quiz.length) * 100}%` }} />
            </div>
            <div className="p-5">
              {item.kind === "image" ? (
                <img src={item.media} alt="Ví dụ cần phân biệt" width={816} height={816} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
              ) : (
                <div className="rounded-2xl bg-secondary p-6">
                  <div className="flex items-center gap-3 font-bold text-primary"><Headphones className="h-6 w-6" /> Bản ghi âm cuộc gọi</div>
                  <div className="my-4 flex h-12 items-end gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <span key={i} className="w-full rounded-full bg-primary/60" style={{ height: `${20 + ((i * 37) % 80)}%` }} />
                    ))}
                  </div>
                  <p className="italic leading-relaxed">{item.transcript}</p>
                </div>
              )}
              <p className="mt-5 text-lg font-bold">{item.prompt}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(["real", "fake"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => choose(c)}
                    disabled={!!picked}
                    className={picked === c ? "btn-pill" : "btn-pill-outline"}
                  >
                    {c === "real" ? "Thật" : "Giả"}
                  </button>
                ))}
              </div>
              {picked && (
                <div className={`mt-5 rounded-2xl border p-4 ${correct ? "border-success bg-secondary" : "border-destructive/40 bg-destructive/5"}`}>
                  <p className="flex items-center gap-2 font-bold">
                    {correct ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    {correct ? "Chính xác! Bạn thật tinh mắt 🎉" : `Chưa đúng rồi — đây là ảnh ${item.answer === "real" ? "THẬT" : "GIẢ"}.`}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{item.explain}</p>
                  {!correct && <p className="mt-2 text-sm font-semibold text-primary">Không sao cả, câu tiếp theo bạn sẽ làm tốt hơn!</p>}
                  <button onClick={next} className="btn-pill mt-4 w-full">
                    {idx < quiz.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
