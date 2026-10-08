import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ScanEye } from "lucide-react";
import teaserImage from "@/assets/quiz/quiz-4-teaser.webp";
import { quiz } from "@/components/deeptruth/data";
import { Reveal } from "@/components/motion/Reveal";

const videos = quiz.filter((q) => q.kind === "video").length;
const images = quiz.filter((q) => q.kind === "image").length;

const points = [
  `${videos} video và ${images} hình ảnh lấy từ tình huống thực tế`,
  "Giải thích chi tiết từng dấu hiệu sau mỗi câu trả lời",
  "Kết quả được lưu ẩn danh để phục vụ nghiên cứu",
];

export function QuizTeaser() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="overflow-hidden bg-muted px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <Reveal variant="left" className="relative mx-auto w-full max-w-md">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border bg-card shadow-[var(--shadow-lift)]">
            {!imageFailed ? (
              <img
                src={teaserImage}
                alt="Một ví dụ trong thử thách Thật hay Giả"
                width={720}
                height={1082}
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover transition-transform duration-[1.5s] hover:scale-105"
              />
            ) : (
              <div className="grid h-full place-items-center bg-secondary">
                <ScanEye className="h-20 w-20 text-primary/40" aria-hidden />
              </div>
            )}
            <span className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1 text-sm font-bold text-primary shadow-sm">
              Thật hay giả?
            </span>
            <div aria-hidden className="absolute inset-x-4 bottom-4 grid grid-cols-2 gap-2">
              <span className="rounded-full bg-background/95 py-2 text-center font-bold text-primary shadow-sm">
                Thật
              </span>
              <span className="rounded-full bg-primary py-2 text-center font-bold text-primary-foreground">
                Giả
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal variant="right">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Bước 2 · Luyện tập
          </p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">Bạn có đủ tinh mắt?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {quiz.length} thử thách giúp bạn luyện phản xạ nhận diện Deepfake — chọn Thật hoặc Giả,
            rồi khám phá vì sao.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <Link to="/thu-thach" className="btn-pill group mt-8">
            Bắt đầu thử thách
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
