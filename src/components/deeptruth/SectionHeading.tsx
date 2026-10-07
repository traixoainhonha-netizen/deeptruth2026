import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, className }: Props) {
  return (
    <Reveal as="header" className={cn("text-center", className)}>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">{title}</h2>
      {description && <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{description}</p>}
    </Reveal>
  );
}
