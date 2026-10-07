import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/smooth-scroll";

type Props = {
  value: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
};

/** Counts up to `value` once visible, and eases between later changes. */
export function CountUp({ value, decimals = 0, durationMs = 1200, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !visible) return undefined;
    const format = (n: number) =>
      n.toLocaleString("vi-VN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

    if (prefersReducedMotion()) {
      shown.current = value;
      el.textContent = format(value);
      return undefined;
    }

    const from = shown.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 4);
      shown.current = from + (value - from) * eased;
      el.textContent = format(shown.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, visible, decimals, durationMs]);

  return (
    <span ref={ref} className={className}>
      {(0).toFixed(decimals).replace(".", ",")}
    </span>
  );
}
