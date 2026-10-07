import hero448 from "@/assets/hero-448.webp";
import hero896 from "@/assets/hero-896.webp";

// Shared by <Hero> and the route head, which preloads the LCP image.
export const HERO_IMAGE = {
  src: hero896,
  srcSet: `${hero448} 448w, ${hero896} 896w`,
  sizes: "(min-width: 768px) 448px, 90vw",
  width: 896,
  height: 896,
};
