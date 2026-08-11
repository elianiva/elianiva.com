import { useEffect, useRef, useState } from "react";
import type { BackgroundRenderer } from "~/lib/background";
import { computeCanvasSize, generateShapes } from "~/lib/background";
import { createWebGLRenderer } from "~/lib/webgl-background";
import { createWebGPURenderer } from "~/lib/webgpu-background";

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const MAX_LOSSES_BEFORE_FALLBACK = 2;

interface MountState {
  key: number;
  webgl: boolean;
}

export function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mount, setMount] = useState<MountState>({ key: 0, webgl: false });

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shapes = generateShapes();

    let renderer: BackgroundRenderer | null = null;
    let raf = 0;
    let running = true;
    let starting = false;
    let pendingLost: boolean | null = null;
    let disposed = false;
    let losses = 0;
    let backend: "webgpu" | "webgl" = "webgl";
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
      // Apply big changes (initial load, orientation) immediately. Small
      // changes during scroll are the mobile URL bar resizing the viewport;
      // deferring them keeps the buffer (and the shader's aspect) stable
      // until the viewport settles, avoiding shape jumps.
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
        try {
          renderer?.frame(0);
        } catch (error) {
          console.error("background render error", error);
          handleLost(backend === "webgl");
        }
        return;
      }

      currentTime = (now - startTime) * 0.001;
      try {
        renderer?.frame(currentTime);
      } catch (error) {
        console.error("background render error", error);
        handleLost(backend === "webgl");
        return;
      }
      raf = requestAnimationFrame(render);
    }

    async function start(preferWebGL: boolean) {
      if (starting || disposed) return;
      starting = true;
      try {
        let next: BackgroundRenderer | null = null;
        if (!preferWebGL && navigator.gpu) {
          try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
              next = await createWebGPURenderer(canvas, shapes, onWebGPULost);
            }
          } catch (error) {
            console.error("WebGPU init failed, falling back to WebGL", error);
          }
        }
        if (disposed) {
          next?.destroy();
          return;
        }
        if (!next) {
          // A webgpu context already claimed this canvas, so a fresh canvas is
          // needed before WebGL can take it.
          if (!preferWebGL && canvas.getContext("webgpu")) {
            setMount((m) => ({ key: m.key + 1, webgl: true }));
            return;
          }
          next = createWebGLRenderer(canvas, shapes, onWebGLLost);
        }
        backend = preferWebGL ? "webgl" : "webgpu";
        renderer = next;
        resize();
        if (running) {
          lastFrameTime = 0;
          raf = requestAnimationFrame(render);
        }
      } finally {
        starting = false;
        if (pendingLost !== null) {
          const lostPreferWebGL = pendingLost;
          pendingLost = null;
          handleLost(lostPreferWebGL);
        }
      }
    }

    function handleLost(preferWebGL: boolean) {
      if (disposed) return;
      if (starting) {
        pendingLost = preferWebGL;
        return;
      }
      if (!preferWebGL) losses++;
      renderer?.destroy();
      renderer = null;
      cancelAnimationFrame(raf);
      if (!preferWebGL && losses >= MAX_LOSSES_BEFORE_FALLBACK) {
        setMount((m) => ({ key: m.key + 1, webgl: true }));
        return;
      }
      void start(preferWebGL);
    }

    function onWebGPULost() {
      handleLost(false);
    }

    function onWebGLLost() {
      handleLost(true);
    }

    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]!.isIntersecting;
        if (visible && !running && renderer) {
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

    void start(mount.webgl);

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      renderer?.destroy();
    };
  }, [mount.key, mount.webgl]);

  return (
    <canvas
      key={mount.key}
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ imageRendering: "auto" }}
      aria-hidden="true"
    />
  );
}
