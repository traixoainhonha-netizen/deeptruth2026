import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/deeptruth/Hero";
import { HERO_IMAGE } from "@/components/deeptruth/hero-image";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { MapTeaser } from "@/components/home/MapTeaser";
import { QuizTeaser } from "@/components/home/QuizTeaser";
import { ReportCta } from "@/components/home/ReportCta";
import { ReviewsTeaser } from "@/components/home/ReviewsTeaser";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: seo({
      title: "DeepTruth – Bạn đang nhìn thấy thật hay giả?",
      description:
        "Dự án NCKH giúp học sinh nhận biết và phòng chống Deepfake: cẩm nang, thử thách thật – giả, bản đồ cảnh báo thời gian thực và kênh báo cáo.",
    }),
    links: [
      // The hero illustration is the largest above-the-fold image: fetch it first.
      {
        rel: "preload",
        as: "image",
        type: "image/webp",
        href: HERO_IMAGE.src,
        imageSrcSet: HERO_IMAGE.srcSet,
        imageSizes: HERO_IMAGE.sizes,
        fetchPriority: "high",
      },
    ],
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
