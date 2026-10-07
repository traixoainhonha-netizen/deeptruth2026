import type Lenis from "lenis";

/** Space kept above a scroll target so the sticky header never covers it. */
export const HEADER_OFFSET = 76;

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type ScrollTarget = string | HTMLElement | number;

/** Smoothly scrolls to a selector, element or Y position, with or without Lenis. */
export function scrollToTarget(
  target: ScrollTarget,
  { offset = -HEADER_OFFSET, immediate = false }: { offset?: number; immediate?: boolean } = {},
) {
  if (typeof window === "undefined") return;

  if (lenis) {
    lenis.scrollTo(target, { offset, immediate, duration: 1.2 });
    return;
  }

  let top: number | null = null;
  if (typeof target === "number") {
    top = target;
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el) top = el.getBoundingClientRect().top + window.scrollY + offset;
  }
  if (top === null) return;
  window.scrollTo({ top, behavior: immediate || prefersReducedMotion() ? "auto" : "smooth" });
}

/** Freezes smooth scrolling while a modal owns the page. */
export function pauseSmoothScroll() {
  lenis?.stop();
}

export function resumeSmoothScroll() {
  lenis?.start();
}
