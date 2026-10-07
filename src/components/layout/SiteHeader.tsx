import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-128.webp";
import { useScrolledPast } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { PAGES } from "./site-nav";

function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-left bg-gradient-to-r from-primary to-success"
      style={{ transform: "scaleX(0)" }}
    />
  );
}

const desktopLink =
  "relative whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-foreground/75 transition-colors duration-200 hover:bg-secondary/70 hover:text-primary";
const desktopActive = "bg-secondary text-primary";

export function SiteHeader() {
  const scrolled = useScrolledPast(8);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled || menuOpen
          ? "border-border bg-background/85 shadow-[0_10px_30px_-20px_rgb(0_0_0/0.35)] backdrop-blur-md"
          : "border-transparent bg-background/60 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[padding] duration-300",
          scrolled ? "py-2" : "py-3",
        )}
      >
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-extrabold text-primary transition-opacity hover:opacity-80"
        >
          <img src={logo} alt="" aria-hidden width={111} height={128} className="h-9 w-auto" />
          DeepTruth
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
          {PAGES.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className={desktopLink}
              activeProps={{ className: desktopActive }}
              activeOptions={{ exact: p.to === "/" }}
            >
              {p.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full text-primary transition-colors hover:bg-secondary lg:hidden"
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Điều hướng chính"
          className="animate-in fade-in-0 slide-in-from-top-2 border-t duration-200 lg:hidden"
        >
          <div className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
            {PAGES.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.to}
                  to={p.to}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors hover:bg-secondary/60"
                  activeProps={{ className: "bg-secondary text-primary" }}
                  activeOptions={{ exact: p.to === "/" }}
                >
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  {p.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <ScrollProgress />
    </header>
  );
}
