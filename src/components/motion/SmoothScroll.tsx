import { useEffect } from "react";
import type Lenis from "lenis";
import { HEADER_OFFSET, prefersReducedMotion, scrollToTarget, setLenis } from "@/lib/smooth-scroll";

/**
 * Inertia-smoothed wheel scrolling (Lenis), loaded lazily after hydration.
 * Touch devices keep native momentum scrolling, and users who prefer reduced
 * motion keep the browser default.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let instance: Lenis | null = null;
    let cancelled = false;

    void import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      instance = new LenisCtor({
        autoRaf: true,
        lerp: 0.1,
        smoothWheel: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      });
      setLenis(instance);
    });

    // Same-page anchor links: animate instead of jumping, and keep the URL hash in sync.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;

      const url = new URL(anchor.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;

      const id = decodeURIComponent(url.hash.slice(1));
      const section = document.getElementById(id);
      if (!section) return;

      event.preventDefault();
      scrollToTarget(id === "trang-chu" ? 0 : section, { offset: -HEADER_OFFSET });
      if (location.hash !== url.hash) history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick);
      instance?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
