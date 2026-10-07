import { useEffect, useState } from "react";
import { format, formatDistance } from "date-fns";
import { vi } from "date-fns/locale";

/** "Vừa xong", "5 phút trước", "khoảng 2 giờ trước"… relative to `now`. */
export function timeAgo(iso: string, now: number) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  if (now - date.getTime() < 45_000) return "Vừa xong";
  return formatDistance(date, now, { addSuffix: true, locale: vi });
}

export function formatClock(ms: number) {
  return format(ms, "HH:mm:ss", { locale: vi });
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : format(date, "HH:mm, dd/MM/yyyy", { locale: vi });
}

/** Current time that ticks every `intervalMs`, so relative timestamps stay fresh. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
