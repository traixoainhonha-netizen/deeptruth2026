import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/deeptruth/Hero";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { MapTeaser } from "@/components/home/MapTeaser";
import { QuizTeaser } from "@/components/home/QuizTeaser";
import { ReportCta } from "@/components/home/ReportCta";
import { ReviewsTeaser } from "@/components/home/ReviewsTeaser";
import { seo } from "@/lib/seo";

// No manual preload for the hero image: React 19 already emits one for the
// fetchPriority="high" <img> in <Hero>, and a second hint would duplicate it.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: seo({
      title: "DeepTruth – Bạn đang nhìn thấy thật hay giả?",
      description:
        "Dự án NCKH giúp học sinh nhận biết và phòng chống Deepfake: cẩm nang, thử thách thật – giả, bản đồ cảnh báo thời gian thực và kênh báo cáo.",
    }),
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <QuizTeaser />
      <MapTeaser />
      <ReviewsTeaser />
      <ReportCta />
    </>
  );
}
