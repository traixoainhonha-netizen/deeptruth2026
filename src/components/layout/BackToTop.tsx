import { ArrowUp } from "lucide-react";
import { useScrolledPast } from "@/hooks/use-scroll";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const visible = useScrolledPast(700);

  return (
    <button
      type="button"
      aria-label="Lên đầu trang"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => scrollToTarget(0, { offset: 0 })}
      className={cn(
        "fixed bottom-4 right-4 z-40 grid h-11 w-11 place-items-center sm:bottom-5 sm:right-5 sm:h-12 sm:w-12 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 active:scale-95",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
