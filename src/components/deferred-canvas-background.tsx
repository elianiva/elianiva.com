import { lazy, Suspense, useEffect, useState } from "react";

const CanvasBackground = lazy(() =>
  import("./canvas-background").then((m) => ({ default: m.CanvasBackground })),
);

/**
 * The animated background is decoration, so keep its code and first paint off
 * the critical path: load it once the page has had a chance to render.
 */
export function DeferredCanvasBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(run, 200);
    return () => clearTimeout(id);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <CanvasBackground />
    </Suspense>
  ) : null;
}
