import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanEye } from "lucide-react";
import { Handbook } from "@/components/deeptruth/Handbook";
import { NextStep } from "@/components/layout/NextStep";
import { PageHero } from "@/components/layout/PageHero";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/cam-nang")({
  head: () => ({
    meta: seo({
      title: "Cẩm nang nhận biết Deepfake – DeepTruth",
      description:
        "Bản chất công nghệ Deepfake, dấu hiệu nhận biết qua thị giác và âm thanh, cách phòng tránh và khía cạnh pháp lý.",
    }),
  }),
  component: HandbookPage,
});

function HandbookPage() {
  return (
    <>
      <PageHero
        page="/cam-nang"
        title="Cẩm nang nhận biết Deepfake"
        description="Trang bị kiến thức khoa học để nhận diện chính xác ảnh, cuộc gọi và giọng nói giả mạo."
        actions={
          <Link to="/thu-thach" className="btn-pill">
            <ScanEye className="h-4 w-4" /> Kiểm tra kiến thức
          </Link>
        }
      />
      <Handbook />
      <NextStep from="/cam-nang" />
    </>
  );
}
