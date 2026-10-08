import {
  AudioLines,
  Banknote,
  CircleDot,
  CircleHelp,
  Megaphone,
  MessageCircle,
  Phone,
  Share2,
  UserX,
  Video,
  type LucideIcon,
} from "lucide-react";
import { randomUuid } from "@/lib/uuid";

// Keep these lists in sync with the CHECK constraints in
// drizzle/migrations/0002_threat_map_review_archive.sql.
export const THREAT_CATEGORIES = [
  "money_transfer",
  "celebrity_impersonation",
  "voice_clone",
  "defamation",
  "other",
] as const;
export type ThreatCategory = (typeof THREAT_CATEGORIES)[number];

export const THREAT_CHANNELS = [
  "video_call",
  "phone_call",
  "social_media",
  "messaging_app",
  "other",
] as const;
export type ThreatChannel = (typeof THREAT_CHANNELS)[number];

export const REGION_AREAS = ["north", "central", "highlands", "south", "online"] as const;
export type RegionArea = (typeof REGION_AREAS)[number];

type Rgb = [number, number, number];

export const CATEGORY_META: Record<
  ThreatCategory,
  { label: string; description: string; color: string; rgb: Rgb; icon: LucideIcon }
> = {
  money_transfer: {
    label: "Lừa đảo chuyển tiền",
    description: "Giả mạo người thân, bạn bè qua video hoặc giọng nói để vay, xin chuyển tiền gấp.",
    color: "oklch(0.8 0.15 75)",
    rgb: [0.96, 0.72, 0.3],
    icon: Banknote,
  },
  celebrity_impersonation: {
    label: "Giả danh người nổi tiếng",
    description:
      "Dùng hình ảnh, giọng nói người nổi tiếng để quảng cáo đầu tư, bán hàng hay từ thiện giả.",
    color: "oklch(0.74 0.16 300)",
    rgb: [0.72, 0.52, 0.96],
    icon: Megaphone,
  },
  voice_clone: {
    label: "Giả giọng nói (audio)",
    description: "Nhân bản giọng nói để gọi điện hoặc gửi tin nhắn thoại giả mạo.",
    color: "oklch(0.78 0.12 220)",
    rgb: [0.42, 0.76, 0.96],
    icon: AudioLines,
  },
  defamation: {
    label: "Ghép ảnh/video bôi nhọ",
    description:
      "Cắt ghép khuôn mặt vào ảnh, video nhạy cảm để bôi nhọ, bắt nạt hoặc đe doạ tống tiền.",
    color: "oklch(0.7 0.19 10)",
    rgb: [0.95, 0.42, 0.52],
    icon: UserX,
  },
  other: {
    label: "Thủ đoạn khác",
    description: "Các hình thức sử dụng Deepfake khác.",
    color: "oklch(0.75 0.03 220)",
    rgb: [0.66, 0.72, 0.8],
    icon: CircleHelp,
  },
};

export const CHANNEL_META: Record<ThreatChannel, { label: string; icon: LucideIcon }> = {
  video_call: { label: "Cuộc gọi video", icon: Video },
  phone_call: { label: "Cuộc gọi thoại", icon: Phone },
  social_media: { label: "Mạng xã hội", icon: Share2 },
  messaging_app: { label: "Ứng dụng nhắn tin", icon: MessageCircle },
  other: { label: "Kênh khác", icon: CircleDot },
};

export const AREA_LABELS: Record<RegionArea, string> = {
  north: "Miền Bắc",
  central: "Miền Trung",
  highlands: "Tây Nguyên",
  south: "Miền Nam",
  online: "Trên mạng",
};

/**
 * Region name for compact spots (KPIs, rankings, the globe label). The online bucket's
 * full name is the longest one, so it gets a short form; "TP. Hồ Chí Minh" is then the
 * longest label and the layouts are sized for it.
 */
export function shortRegionName(region: { name: string; area: RegionArea }) {
  return region.area === "online" ? AREA_LABELS.online : region.name;
}

export const DANGER_LEVELS = [
  { value: 1, label: "Thấp" },
  { value: 2, label: "Cần lưu ý" },
  { value: 3, label: "Trung bình" },
  { value: 4, label: "Cao" },
  { value: 5, label: "Nghiêm trọng" },
] as const;

const DANGER_RGB: Rgb[] = [
  [0.32, 0.85, 0.62],
  [0.66, 0.86, 0.36],
  [0.98, 0.8, 0.3],
  [0.98, 0.55, 0.22],
  [0.95, 0.28, 0.3],
];

export function clampDanger(score: number) {
  return Math.min(5, Math.max(1, score));
}

export function dangerLabel(score: number | null) {
  if (score === null) return "Chưa chấm";
  return DANGER_LEVELS[Math.round(clampDanger(score)) - 1]?.label ?? "Chưa chấm";
}

/** CSS colour token for a (possibly fractional) danger score. */
export function dangerColor(score: number | null) {
  if (score === null) return "var(--muted-foreground)";
  return `var(--danger-${Math.round(clampDanger(score))})`;
}

/** Smoothly interpolated RGB (0..1) used by the WebGL globe. */
export function dangerRgb(score: number | null): Rgb {
  if (score === null) return [0.6, 0.7, 0.75];
  const x = clampDanger(score) - 1;
  const i = Math.min(3, Math.floor(x));
  const t = x - i;
  const a = DANGER_RGB[i]!;
  const b = DANGER_RGB[i + 1]!;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Average danger computed from the counters every row carries (also present in realtime events). */
export function dangerScoreOf(report: { vote_count: number; danger_total: number }) {
  return report.vote_count > 0
    ? Math.round((report.danger_total / report.vote_count) * 100) / 100
    : null;
}

export function isThreatCategory(value: unknown): value is ThreatCategory {
  return typeof value === "string" && (THREAT_CATEGORIES as readonly string[]).includes(value);
}

export function isThreatChannel(value: unknown): value is ThreatChannel {
  return typeof value === "string" && (THREAT_CHANNELS as readonly string[]).includes(value);
}

export function isRegionArea(value: unknown): value is RegionArea {
  return typeof value === "string" && (REGION_AREAS as readonly string[]).includes(value);
}

// Mirrors public.contains_personal_info() in SQL. Lookbehind is avoided on purpose:
// older Safari versions cannot parse it and would fail to load the whole bundle.
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const DIGIT_SEPARATOR = /(\d)[ .-](?=\d)/g;
const PHONE = /(^|\D)(\+?84|0)\d{9,10}(\D|$)/;
const LONG_NUMBER = /\d{12,}/;

/** True when text looks like it contains a phone number, email or ID/bank number. */
export function containsPersonalInfo(text: string) {
  if (EMAIL.test(text)) return true;
  const compact = text.replace(DIGIT_SEPARATOR, "$1");
  return PHONE.test(compact) || LONG_NUMBER.test(compact);
}

export const PERSONAL_INFO_MESSAGE =
  "Vì quyền riêng tư, vui lòng xoá số điện thoại, email, số tài khoản hoặc CCCD khỏi nội dung.";

// Anonymous per-browser identity: lets the database allow one vote per report
// without accounts. It is random and never linked to a person.
const TOKEN_KEY = "deeptruth:voter-token";
const VOTES_KEY = "deeptruth:threat-votes";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let memoryToken: string | null = null;

export function getVoterToken() {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored && UUID.test(stored)) return stored;
    const token = randomUuid();
    localStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch {
    memoryToken ??= randomUuid();
    return memoryToken;
  }
}

/** Votes this browser has cast, keyed by report id (kept locally for instant UI state). */
export function readVotes(): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(VOTES_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, number] =>
          typeof entry[1] === "number" && entry[1] >= 1 && entry[1] <= 5,
      ),
    );
  } catch {
    return {};
  }
}

export function rememberVote(threatId: string, score: number) {
  try {
    const votes = readVotes();
    votes[threatId] = score;
    const entries = Object.entries(votes).slice(-500);
    localStorage.setItem(VOTES_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Storage can be unavailable (private mode); the database still enforces one vote.
  }
}
