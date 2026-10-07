// One IntersectionObserver shared by every <Reveal>: cheaper than one per element,
// and reveals toggle a class directly so scrolling never triggers React renders.
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (observer || typeof IntersectionObserver === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0 },
  );
  return observer;
}

/** Reveals `el` the first time it scrolls into view. Returns a cleanup function. */
export function observeReveal(el: Element) {
  const io = getObserver();
  if (!io) {
    el.classList.add("is-revealed");
    return () => {};
  }
  io.observe(el);
  return () => io.unobserve(el);
}
