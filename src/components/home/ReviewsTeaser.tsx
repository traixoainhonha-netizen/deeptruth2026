import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/deeptruth/SectionHeading";
import { useLatestReviews, useReviewStats } from "@/components/deeptruth/reviews/hooks";
import { RatingSummary } from "@/components/deeptruth/reviews/RatingSummary";
import { ReviewCard, ReviewCardSkeleton } from "@/components/deeptruth/reviews/ReviewCard";
import { Reveal } from "@/components/motion/Reveal";
import { useInView } from "@/hooks/use-in-view";
import { useNow } from "@/lib/time";

export function ReviewsTeaser() {
  const [ref, nearView] = useInView<HTMLElement>({ rootMargin: "500px 0px", once: true });
  const stats = useReviewStats(nearView);
  const latest = useLatestReviews(3, nearView);
  const now = useNow();

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Bước 5 · Góp ý"
          title="Cộng đồng nói gì về DeepTruth"
          description="Đánh giá thật, ẩn danh từ người dùng — được lưu trữ an toàn trong cơ sở dữ liệu của dự án."
        />
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
          <Reveal className="space-y-4">
            <RatingSummary stats={stats.data} />
            <Link to="/danh-gia" className="btn-pill-outline group w-full">
              Xem kho lưu trữ đánh giá
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {!nearView || latest.isPending
              ? [0, 1, 2].map((i) => <ReviewCardSkeleton key={i} />)
              : (latest.data ?? []).map((r, i) => (
                  <Reveal key={r.id} delay={i * 90}>
                    <ReviewCard review={r} now={now} />
                  </Reveal>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
