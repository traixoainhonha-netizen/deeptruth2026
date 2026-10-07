import { createFileRoute } from "@tanstack/react-router";
import { Report } from "@/components/deeptruth/Report";
import { NextStep } from "@/components/layout/NextStep";
import { PageHero } from "@/components/layout/PageHero";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/bao-cao")({
  head: () => ({
    meta: seo({
      title: "Báo cáo & Hỗ trợ – DeepTruth",
      description:
        "Đường dây nóng khẩn cấp và kênh gửi báo cáo bảo mật về sự cố Deepfake cho Nhóm nghiên cứu.",
    }),
  }),
  component: ReportPage,
});

function ReportPage() {
  return (
    <>
      <PageHero
        page="/bao-cao"
        title="Báo cáo & Hỗ trợ"
        description="Bạn hoặc người thân gặp sự cố Deepfake? Liên hệ ngay đường dây nóng hoặc gửi báo cáo bảo mật — bạn không đơn độc."
      />
      <Report />
      <NextStep from="/bao-cao" />
    </>
  );
}
