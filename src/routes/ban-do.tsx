import { createFileRoute } from "@tanstack/react-router";
import { ThreatMapSection } from "@/components/deeptruth/threat-map/ThreatMapSection";
import { NextStep } from "@/components/layout/NextStep";
import { PageHero } from "@/components/layout/PageHero";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/ban-do")({
  head: () => ({
    meta: seo({
      title: "Bản đồ cảnh báo Deepfake thời gian thực – DeepTruth",
      description:
        "Theo dõi các thủ đoạn Deepfake đang lan truyền: lừa đảo chuyển tiền, giả danh người nổi tiếng, giả giọng nói. Cộng đồng báo cáo và chấm điểm mức độ nguy hiểm.",
    }),
  }),
  component: ThreatMapPage,
});

function ThreatMapPage() {
  return (
    <>
      <PageHero
        page="/ban-do"
        tone="dark"
        title={
          <>
            Bản đồ cảnh báo Deepfake <span className="text-foreground">thời gian thực</span>
          </>
        }
        description="Trung tâm giám sát cộng đồng: theo dõi các thủ đoạn Deepfake đang lan truyền, chia sẻ vụ việc bạn gặp ngoài đời thực và cùng chấm điểm mức độ nguy hiểm."
      />
      <ThreatMapSection />
      <NextStep from="/ban-do" />
    </>
  );
}
