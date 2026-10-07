import { createElement, useEffect, useRef, type CSSProperties, type HTMLAttributes } from "react";
import { observeReveal } from "@/lib/reveal";

export type RevealVariant = "up" | "fade" | "scale" | "left" | "right";
type RevealTag =
  | "div"
  | "li"
  | "article"
  | "header"
  | "section"
  | "p"
  | "span"
  | "h2"
  | "h3"
  | "ol"
  | "ul"
  | "form";

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  variant?: RevealVariant;
  /** Stagger delay in milliseconds. */
  delay?: number;
};

/** Fades/slides its content in the first time it enters the viewport. */
export function Reveal({ as = "div", variant = "up", delay = 0, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    return el ? observeReveal(el) : undefined;
  }, []);

  return createElement(as, {
    ...rest,
    ref,
    "data-reveal": variant,
    style: delay ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties) : style,
  });
}
