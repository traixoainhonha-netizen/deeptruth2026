import { useEffect, useState } from "react";

/** `true` once the page is scrolled past `offset` pixels; re-renders only when that flips. */
export function useScrolledPast(offset: number) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setPast(window.scrollY > offset);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [offset]);

  return past;
}

/**
 * Id of the section being read: the one crossing a band 20–30% down the viewport,
 * just below the sticky header, where a section lands after a table-of-contents jump.
 */
export function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    if (!key || typeof IntersectionObserver === "undefined") return undefined;
    const sections = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
