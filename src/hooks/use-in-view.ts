import { useEffect, useRef, useState } from "react";

type Options = {
  /** Grow the viewport so work can start before the element is visible, e.g. "400px 0px". */
  rootMargin?: string;
  threshold?: number;
  /** Stay `true` after the first intersection. */
  once?: boolean;
};

/** Tracks whether an element is in (or near) the viewport. Always `false` during SSR. */
export function useInView<T extends Element>({
  rootMargin = "0px",
  threshold = 0,
  once = false,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return [ref, inView] as const;
}
