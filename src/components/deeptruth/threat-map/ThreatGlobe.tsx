import { useEffect, useRef } from "react";
import createGlobe, { type COBEOptions, type Globe, type Marker } from "cobe";
import { cn } from "@/lib/utils";

export type GlobeMarker = {
  lat: number;
  lng: number;
  size: number;
  color: [number, number, number];
  /** Recent activity makes the marker pulse. */
  pulse: boolean;
};

export type GlobeArc = {
  from: [number, number];
  to: [number, number];
  color: [number, number, number];
};

export type GlobeView = "vietnam" | "global";

type Props = {
  markers: GlobeMarker[];
  arcs: GlobeArc[];
  view: GlobeView;
  /** A location to rotate to (e.g. the selected report's region). */
  focus: { lat: number; lng: number } | null;
  className?: string;
};

const VIETNAM = { lat: 15.8, lng: 106.3 };
const VIEW_SCALE: Record<GlobeView, number> = { vietnam: 2.35, global: 1 };
const TAU = Math.PI * 2;
const IDLE_MS = 2500;

/** cobe's camera angles that put a lat/lng in the centre of the globe. */
function anglesFor({ lat, lng }: { lat: number; lng: number }) {
  return {
    phi: Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
    theta: (lat * Math.PI) / 180,
  };
}

/** Shortest signed angular distance from a to b. */
function angleDelta(a: number, b: number) {
  return ((((b - a) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
}

/** Frame-rate independent smoothing factor (`rate` is tuned for 60 fps). */
function ease(rate: number, dt: number) {
  return 1 - Math.pow(1 - rate, dt * 60);
}

export default function ThreatGlobe({ markers, arcs, view, focus, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<Globe | null>(null);

  // Animation inputs live in refs so prop changes never restart the render loop.
  const markersRef = useRef(markers);
  const viewRef = useRef(view);
  const focusRef = useRef(focus);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    viewRef.current = view;
    focusRef.current = focus;
  }, [view, focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = canvas.offsetWidth || 480;
    const home = anglesFor(VIETNAM);
    // Start zoomed out and turned away, then "lock on" to Vietnam.
    const state = {
      phi: home.phi - (reduceMotion ? 0 : 1.6),
      theta: 0.25,
      scale: reduceMotion ? VIEW_SCALE[viewRef.current] : 0.9,
      velocity: 0,
      dragging: false,
      lastX: 0,
      lastInteraction: Number.NEGATIVE_INFINITY,
      lastFrame: performance.now(),
      time: 0,
    };

    const options: COBEOptions = {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: state.phi,
      theta: state.theta,
      scale: state.scale,
      dark: 1,
      diffuse: 1.25,
      // Fewer land dots on small canvases: same look, far less GPU work on phones.
      mapSamples: size < 480 ? 11000 : 18000,
      mapBrightness: 5.5,
      mapBaseBrightness: 0.04,
      baseColor: [0.16, 0.3, 0.33],
      markerColor: [0.98, 0.45, 0.3],
      glowColor: [0.1, 0.42, 0.36],
      arcColor: [0.45, 0.9, 0.75],
      arcWidth: 0.55,
      arcHeight: 0.16,
      markerElevation: 0.015,
      opacity: 0.96,
      markers: [],
      arcs: [],
    };
    const globe = createGlobe(canvas, options);
    globeRef.current = globe;

    let frame = 0;
    let onScreen = true;

    const render = (now: number) => {
      frame = 0;
      const dt = Math.min(0.05, Math.max(0, (now - state.lastFrame) / 1000));
      state.lastFrame = now;
      state.time += dt;

      const targetView = viewRef.current;
      const target = anglesFor(focusRef.current ?? VIETNAM);
      const idle = now - state.lastInteraction > IDLE_MS;

      if (!state.dragging) {
        state.phi += state.velocity * dt * 60;
        state.velocity *= Math.pow(0.94, dt * 60);
        if (Math.abs(state.velocity) < 1e-4) state.velocity = 0;

        if (targetView === "global") {
          if (idle && !reduceMotion) state.phi += 0.13 * dt;
          state.theta += (0.25 - state.theta) * ease(0.04, dt);
        } else if (idle) {
          const sway = reduceMotion ? 0 : Math.sin(state.time * 0.35) * 0.05;
          state.phi += angleDelta(state.phi, target.phi + sway) * ease(0.045, dt);
          state.theta += (target.theta - state.theta) * ease(0.045, dt);
        }
      }
      state.scale += (VIEW_SCALE[targetView] - state.scale) * ease(0.05, dt);

      const beat = state.time * 3.2;
      const markerData: Marker[] = markersRef.current.map((m, i) => ({
        location: [m.lat, m.lng],
        size: m.pulse && !reduceMotion ? m.size * (1 + 0.28 * Math.sin(beat + i * 1.3)) : m.size,
        color: m.color,
      }));

      globe.update({ phi: state.phi, theta: state.theta, scale: state.scale, markers: markerData });
      schedule();
    };

    function schedule() {
      if (!frame && onScreen && !document.hidden) {
        frame = requestAnimationFrame(render);
      }
    }

    // Pause GPU work whenever the globe is off-screen or the tab is hidden.
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      if (onScreen) {
        state.lastFrame = performance.now();
        schedule();
      }
    });
    io.observe(canvas);
    const onVisibility = () => {
      state.lastFrame = performance.now();
      schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      const next = canvas.offsetWidth;
      if (next > 0 && next !== size) {
        size = next;
        globe.update({ width: size, height: size });
      }
    });
    ro.observe(canvas);

    const onPointerDown = (e: PointerEvent) => {
      state.dragging = true;
      state.lastX = e.clientX;
      state.velocity = 0;
      state.lastInteraction = performance.now();
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!state.dragging) return;
      const delta = ((e.clientX - state.lastX) / (size * state.scale)) * 3;
      state.lastX = e.clientX;
      state.phi += delta;
      state.velocity = delta;
      state.lastInteraction = performance.now();
    };
    const onPointerUp = (e: PointerEvent) => {
      state.dragging = false;
      state.lastInteraction = performance.now();
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "";
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    schedule();

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      globe.destroy();
      globeRef.current = null;
    };
  }, []);

  // Declared after the setup effect so the first run sees the freshly created globe.
  useEffect(() => {
    globeRef.current?.update({ arcs });
  }, [arcs]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "aspect-square w-full cursor-grab touch-pan-y animate-in fade-in-0 zoom-in-95 duration-1000",
        className,
      )}
    />
  );
}
