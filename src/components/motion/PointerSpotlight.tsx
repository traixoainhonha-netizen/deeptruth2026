import { useEffect } from "react";

/**
 * One document-level listener drives the hover glow of every `[data-spotlight]`
 * element by writing CSS variables — no per-card listeners, no React renders.
 */
export function PointerSpotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    let frame = 0;
    let event: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const target = (event?.target as Element | null)?.closest?.("[data-spotlight]");
      if (!(target instanceof HTMLElement) || !event) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      target.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      event = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}
