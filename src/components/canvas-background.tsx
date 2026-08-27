import { useEffect, useRef } from "react";
import type { BackgroundRenderer } from "~/lib/background";
import { computeCanvasSize, generateShapes } from "~/lib/background";
import { createCanvasRenderer } from "~/lib/canvas-background";

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shapes = generateShapes();

    let renderer: BackgroundRenderer | null = createCanvasRenderer(canvas, shapes);
    let raf = 0;
    let running = true;
    let disposed = false;
    let startTime = performance.now();
    let lastFrameTime = 0;
    let currentTime = 0;
    let size = { width: 0, height: 0 };
    let pendingSize: { width: number; height: number } | null = null;
    let resizeTimer = 0;

    function applyResize(target: { width: number; height: number }) {
      if (target.width === size.width && target.height === size.height) return;
      size = target;
      renderer?.resize(target.width, target.height);
      renderer?.frame(prefersReducedMotion ? 0 : currentTime);
    }

    function resize() {
      const target = computeCanvasSize(canvas.clientWidth, canvas.clientHeight);
      if (target.width === size.width && target.height === size.height) {
        pendingSize = null;
        if (resizeTimer) {
          window.clearTimeout(resizeTimer);
          resizeTimer = 0;
        }
        return;
      }
      pendingSize = target;
      const changed = Math.max(
        Math.abs(target.width - size.width) / Math.max(size.width, 1),
        Math.abs(target.height - size.height) / Math.max(size.height, 1),
      );
      if (size.width === 0 || changed > 0.2) {
        applyResize(target);
        return;
      }
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeTimer = 0;
        if (pendingSize) applyResize(pendingSize);
      }, 200);
    }

    function render(now: number) {
      if (!running || disposed) return;
      if (now - lastFrameTime < FRAME_INTERVAL) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = now;
      if (prefersReducedMotion) {
        renderer?.frame(0);
        return;
      }
      currentTime = (now - startTime) * 0.001;
      renderer?.frame(currentTime);
      raf = requestAnimationFrame(render);
    }

    const handleVisibility = () => {
      if (document.hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!document.hidden && !running) {
        const entry = canvas.getBoundingClientRect();
        const inView = entry.bottom > 0 && entry.top < window.innerHeight;
        if (inView) {
          running = true;
          lastFrameTime = 0;
          raf = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]!.isIntersecting;
        if (visible && !running) {
          running = true;
          lastFrameTime = 0;
          raf = requestAnimationFrame(render);
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    resize();
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      renderer?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ imageRendering: "auto" }}
      aria-hidden="true"
    />
  );
}
