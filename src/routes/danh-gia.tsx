import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { ReviewArchive } from "@/components/deeptruth/reviews/ReviewArchive";
import { parseArchiveSearch, type ArchiveSearch } from "@/components/deeptruth/reviews/search";
import { PageHero } from "@/components/layout/PageHero";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/danh-gia")({
  // Filters live in the URL so archive views can be shared and the back button works.
  validateSearch: parseArchiveSearch,
  head: () => ({
    meta: seo({
      title: "Kho lưu trữ đánh giá – DeepTruth",
      description:
        "Toàn bộ đánh giá của người dùng về DeepTruth: thống kê, tìm kiếm, lọc theo số sao và tải xuống dạng CSV.",
    }),
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onChange = useCallback(
    (next: ArchiveSearch, options?: { replace?: boolean }) =>
      void navigate({ search: next, replace: options?.replace ?? false, resetScroll: false }),
    [navigate],
  );

  return (
    <>
      <PageHero
        page="/danh-gia"
        title="Kho lưu trữ đánh giá"
        description="Toàn bộ cảm nhận của người dùng về DeepTruth — xem thống kê, tìm kiếm, lọc theo số sao và tải xuống phục vụ nghiên cứu."
        actions={
          <a href="#viet-danh-gia" className="btn-pill">
            <PenLine className="h-4 w-4" /> Viết đánh giá
          </a>
        }
      />
      <ReviewArchive search={search} onChange={onChange} />
    </>
  );
}
