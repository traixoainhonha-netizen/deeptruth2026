import { createFileRoute } from "@tanstack/react-router";
import { Quiz } from "@/components/deeptruth/Quiz";
import { quiz } from "@/components/deeptruth/data";
import { NextStep } from "@/components/layout/NextStep";
import { PageHero } from "@/components/layout/PageHero";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/thu-thach")({
  head: () => ({
    meta: seo({
      title: "Thử thách Thật hay Giả – DeepTruth",
      description: `Thử tài phân biệt nội dung thật và Deepfake qua ${quiz.length} ví dụ video, hình ảnh thực tế kèm giải thích chi tiết.`,
    }),
  }),
  component: QuizPage,
});

function QuizPage() {
  return (
    <>
      <PageHero
        page="/thu-thach"
        title="Thử thách Thật – Giả"
        description={`${quiz.length} ví dụ thực tế. Quan sát thật kỹ, chọn Thật hoặc Giả và khám phá những dấu hiệu bạn có thể đã bỏ lỡ.`}
      />
      <Quiz />
      <NextStep from="/thu-thach" />
    </>
  );
}
