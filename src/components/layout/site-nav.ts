import {
  BookOpen,
  Home,
  MessageSquareHeart,
  Radar,
  ScanEye,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export type PagePath = "/" | "/cam-nang" | "/thu-thach" | "/ban-do" | "/bao-cao" | "/danh-gia";

export type SitePage = {
  to: PagePath;
  label: string;
  /** Journey step shown in page heroes ("Bước 2/5 · Luyện tập"). */
  step?: { index: number; verb: string };
  description: string;
  icon: LucideIcon;
};

export const PAGES: SitePage[] = [
  {
    to: "/",
    label: "Trang chủ",
    description: "Tổng quan dự án DeepTruth.",
    icon: Home,
  },
  {
    to: "/cam-nang",
    label: "Cẩm nang",
    step: { index: 1, verb: "Tìm hiểu" },
    description: "Kiến thức khoa học để nhận diện ảnh, video và giọng nói giả mạo.",
    icon: BookOpen,
  },
  {
    to: "/thu-thach",
    label: "Thật hay giả",
    step: { index: 2, verb: "Luyện tập" },
    description: "Thử tài phân biệt nội dung thật và Deepfake qua các ví dụ thực tế.",
    icon: ScanEye,
  },
  {
    to: "/ban-do",
    label: "Bản đồ cảnh báo",
    step: { index: 3, verb: "Theo dõi" },
    description: "Các thủ đoạn Deepfake đang lan truyền, do cộng đồng báo cáo và chấm điểm.",
    icon: Radar,
  },
  {
    to: "/bao-cao",
    label: "Báo cáo",
    step: { index: 4, verb: "Hành động" },
    description: "Đường dây nóng và kênh báo cáo bảo mật cho Nhóm NCKH.",
    icon: ShieldAlert,
  },
  {
    to: "/danh-gia",
    label: "Đánh giá",
    step: { index: 5, verb: "Góp ý" },
    description: "Kho lưu trữ toàn bộ đánh giá của người dùng về DeepTruth.",
    icon: MessageSquareHeart,
  },
];

export const JOURNEY = PAGES.filter(
  (p): p is SitePage & { step: NonNullable<SitePage["step"]> } => !!p.step,
);

export function pageFor(to: PagePath) {
  return PAGES.find((p) => p.to === to)!;
}

/** The page that follows `to` in the learning journey, if any. */
export function nextPage(to: PagePath) {
  const i = JOURNEY.findIndex((p) => p.to === to);
  return i >= 0 ? JOURNEY[i + 1] : JOURNEY[0];
}
