import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Headphones,
  Lightbulb,
  MousePointerClick,
  RotateCcw,
  ScanEye,
  Trophy,
  XCircle,
} from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { HEADER_OFFSET, scrollToTarget } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import { levelFor, quiz } from "./data";

const GUIDE = [
  {
    icon: ScanEye,
    title: "Quan sát kỹ",
    text: "Xem video, ảnh hoặc đọc bản ghi âm trong từng câu.",
  },
  { icon: MousePointerClick, title: "Chọn Thật hoặc Giả", text: "Mỗi câu chỉ được chọn một lần." },
  {
    icon: Lightbulb,
    title: "Đọc giải thích",
    text: "Tìm hiểu dấu hiệu giúp phân biệt sau mỗi câu.",
  },
];

function QuizGuide() {
  return (
    <div className="space-y-4">
      <div className="card-soft p-5">
        <p className="font-bold">Cách chơi</p>
        <ol className="mt-4 space-y-4">
          {GUIDE.map((g, i) => (
            <li key={g.title} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <g.icon className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-bold">
                  {i + 1}. {g.title}
                </span>
                <span className="block text-sm text-muted-foreground">{g.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <Link
        to="/cam-nang"
        hash="chuong-2"
        className="card-soft card-hover group flex items-center gap-3 p-5"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <BookOpen className="h-5 w-5" aria-hidden />
        </span>
        <span className="text-sm">
          <span className="block font-bold">Cần gợi ý?</span>
          <span className="text-muted-foreground">
            Ôn Chương 2: Dấu hiệu nhận biết qua thị giác và âm thanh.
          </span>
        </span>
      </Link>
    </div>
  );
}

export function Quiz() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<"real" | "fake" | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState<"idle" | "ok" | "err">("idle");

  const item = quiz[idx]!;
  const score = answers.filter(Boolean).length;

  function bringCardIntoView() {
    const el = cardRef.current;
    if (el && el.getBoundingClientRect().top < HEADER_OFFSET) {
      scrollToTarget(el, { offset: -HEADER_OFFSET - 12 });
    }
  }

  function choose(c: "real" | "fake") {
    if (picked) return;
    setPicked(c);
    setAnswers((a) => [...a, c === item.answer]);
  }

  async function next() {
    bringCardIntoView();
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
    bringCardIntoView();
    setIdx(0);
    setPicked(null);
    setAnswers([]);
    setDone(false);
    setSaved("idle");
  }

  const correct = picked !== null && picked === item.answer;
  const lv = levelFor(score, quiz.length);

  return (
    <div className="px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[1fr_20rem]">
        <Reveal variant="scale">
          <div ref={cardRef} className="scroll-mt-24">
            {done ? (
              <div className="card-soft animate-in fade-in-0 zoom-in-95 p-8 text-center duration-500 md:p-12">
                <Trophy className="mx-auto h-14 w-14 animate-in spin-in-12 zoom-in-50 text-warning duration-700" />
                <p className="mt-4 font-display text-6xl font-extrabold text-primary">
                  <CountUp value={score} durationMs={900} />/{quiz.length}
                </p>
                <p className="mt-3 text-2xl font-bold">{lv.label}</p>
                <p className="mx-auto mt-2 max-w-md text-muted-foreground">{lv.note}</p>
                <div
                  className="mx-auto mt-6 flex max-w-sm justify-center gap-1.5"
                  aria-label="Kết quả từng câu"
                >
                  {answers.map((ok, i) => (
                    <span
                      key={i}
                      title={`Câu ${i + 1}: ${ok ? "đúng" : "sai"}`}
                      className={cn(
                        "h-2.5 flex-1 rounded-full",
                        ok ? "bg-success" : "bg-destructive/60",
                      )}
                    />
                  ))}
                </div>
                <p className="mt-5 text-xs text-muted-foreground">
                  {saved === "ok" && "Kết quả đã được lưu ẩn danh cho nghiên cứu. Cảm ơn bạn!"}
                  {saved === "err" && "Chưa lưu được kết quả, nhưng bạn vẫn có thể thử lại."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button onClick={restart} className="btn-pill">
                    <RotateCcw className="h-4 w-4" /> Làm lại
                  </button>
                  <Link to="/cam-nang" className="btn-pill-outline">
                    <BookOpen className="h-4 w-4" /> Ôn cẩm nang
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card-soft overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-5 text-sm font-semibold text-muted-foreground">
                  <span>
                    Câu {idx + 1}/{quiz.length}
                  </span>
                  <span>Điểm: {score}</span>
                </div>
                <div
                  className="mx-5 mt-3 h-2 overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={quiz.length}
                  aria-valuenow={answers.length}
                  aria-label="Tiến độ thử thách"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-[width] duration-700 ease-[var(--ease-out-expo)]"
                    style={{ width: `${(answers.length / quiz.length) * 100}%` }}
                  />
                </div>

                <div
                  key={idx}
                  className="animate-in fade-in-0 slide-in-from-right-6 p-5 duration-500"
                >
                  {item.kind === "video" ? (
                    <video
                      src={item.media}
                      controls
                      loop
                      playsInline
                      preload="metadata"
                      className="max-h-[70vh] w-full rounded-2xl bg-foreground"
                    />
                  ) : item.kind === "image" ? (
                    <img
                      src={item.media}
                      alt="Ví dụ cần phân biệt"
                      loading="lazy"
                      decoding="async"
                      className="max-h-[70vh] w-full rounded-2xl bg-muted object-contain"
                    />
                  ) : (
                    <div className="rounded-2xl bg-secondary p-6">
                      <div className="flex items-center gap-3 font-bold text-primary">
                        <Headphones className="h-6 w-6" /> Bản ghi âm cuộc gọi
                      </div>
                      <div className="my-4 flex h-12 items-end gap-1" aria-hidden>
                        {Array.from({ length: 40 }).map((_, i) => (
                          <span
                            key={i}
                            className="w-full rounded-full bg-primary/60"
                            style={{ height: `${20 + ((i * 37) % 80)}%` }}
                          />
                        ))}
                      </div>
                      <p className="italic leading-relaxed">{item.transcript}</p>
                    </div>
                  )}
                  <p className="mt-5 text-lg font-bold">{item.prompt}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {(["real", "fake"] as const).map((c) => {
                      const isAnswer = picked !== null && c === item.answer;
                      const isWrongPick = picked === c && c !== item.answer;
                      return (
                        <button
                          key={c}
                          onClick={() => choose(c)}
                          disabled={picked !== null}
                          className={cn(
                            picked === null || picked === c ? "btn-pill" : "btn-pill-outline",
                            "disabled:opacity-100",
                            isAnswer && "bg-success! text-white! ring-4 ring-success/25",
                            isWrongPick && "bg-destructive! text-white!",
                            picked !== null && !isAnswer && !isWrongPick && "opacity-50",
                          )}
                        >
                          {isAnswer && <CheckCircle2 className="h-4 w-4" />}
                          {isWrongPick && <XCircle className="h-4 w-4" />}
                          {c === "real" ? "Thật" : "Giả"}
                        </button>
                      );
                    })}
                  </div>
                  {picked && (
                    <div
                      role="status"
                      className={cn(
                        "mt-5 animate-in fade-in-0 slide-in-from-bottom-2 rounded-2xl border p-4 duration-500",
                        correct
                          ? "border-success bg-secondary"
                          : "border-destructive/40 bg-destructive/5",
                      )}
                    >
                      <p className="flex items-center gap-2 font-bold">
                        {correct ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        {correct
                          ? "Chính xác! Bạn thật tinh mắt 🎉"
                          : `Chưa đúng rồi — đây là nội dung ${item.answer === "real" ? "THẬT" : "GIẢ"}.`}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                        {item.explain}
                      </p>
                      {!correct && (
                        <p className="mt-2 text-sm font-semibold text-primary">
                          Không sao cả, câu tiếp theo bạn sẽ làm tốt hơn!
                        </p>
                      )}
                      <button onClick={next} className="btn-pill mt-4 w-full">
                        {idx < quiz.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal variant="right" delay={120} className="lg:sticky lg:top-24">
          <QuizGuide />
        </Reveal>
      </div>
    </div>
  );
}
