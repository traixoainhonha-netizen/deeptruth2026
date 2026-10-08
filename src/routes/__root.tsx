import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Compass, RotateCcw } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BackToTop } from "@/components/layout/BackToTop";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PointerSpotlight } from "@/components/motion/PointerSpotlight";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Lexend:wght@700;800&display=swap";

// Runs before first paint. Marks JS as available (scroll reveals rely on it) and
// injects the web-font stylesheet: script-inserted stylesheets don't block rendering,
// so text paints immediately in the fallback font and swaps when the fonts arrive.
const BOOT_SCRIPT = `document.documentElement.classList.add('js');var f=document.createElement('link');f.rel='stylesheet';f.href=${JSON.stringify(FONT_CSS)};document.head.appendChild(f);`;

// Opening the data connection early saves a DNS + TLS round trip on the first query.
const SUPABASE_ORIGIN = (() => {
  try {
    return new URL(import.meta.env["VITE_SUPABASE_URL"] ?? "").origin;
  } catch {
    return null;
  }
})();

// Toasts only follow user actions, so the toast UI loads after hydration, off the critical path.
const Toaster = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));

function NotFoundComponent() {
  return (
    <div className="tech-bg flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <p className="font-display text-8xl font-extrabold text-primary/20">404</p>
        <h1 className="mt-2 text-2xl font-bold text-primary">Không tìm thấy trang</h1>
        <p className="mt-2 text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc đã được chuyển đi — có thể chính đường link là “giả”? 😉
        </p>
        <Link to="/" className="btn-pill mt-6">
          <Compass className="h-4 w-4" /> Về trang chủ
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Trang chưa tải được
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đã có lỗi xảy ra. Bạn có thể thử lại hoặc quay về trang chủ.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-pill"
          >
            <RotateCcw className="h-4 w-4" /> Thử lại
          </button>
          <a href="/" className="btn-pill-outline">
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Fallback for pages without their own title (e.g. 404); routes override it.
      { title: "DeepTruth – Nhận biết & phòng chống Deepfake" },
      { name: "theme-color", content: "#2A5A43" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "DeepTruth" },
      { property: "og:locale", content: "vi_VN" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      ...(SUPABASE_ORIGIN
        ? [{ rel: "preconnect", href: SUPABASE_ORIGIN, crossOrigin: "anonymous" as const }]
        : []),
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    // Classes on <html> are added by BOOT_SCRIPT, Lenis and hydration — not by React.
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        {/* Raw HTML on purpose: React 19 hoists a <link rel="stylesheet"> element out of
            <noscript> into <head>, which would make the fonts render-blocking again. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<link rel="stylesheet" href="${FONT_CSS.replace(/&/g, "&amp;")}">`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("hydrated");
    setHydrated(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Bỏ qua điều hướng
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>
      <SiteFooter />
      <BackToTop />
      {hydrated && (
        <Suspense fallback={null}>
          <Toaster position="top-center" richColors closeButton />
        </Suspense>
      )}
      <SmoothScroll />
      <PointerSpotlight />
    </QueryClientProvider>
  );
}
