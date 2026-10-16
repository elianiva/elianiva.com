import { useEffect, useMemo, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { generateShapes, N } from "~/lib/background";

/**
 * Decorative drifting shapes. Every motion is a CSS transform/opacity animation,
 * so the compositor runs it off the main thread. Layers are kept to two per shape,
 * the animation pauses while the tab is hidden, unfocused or idle, low-end devices get fewer shapes, and nothing renders under
 * prefers-reduced-motion. Geometry is expressed in container-query
 * units, so resizing needs no work beyond updating one aspect-ratio variable.
 *
 * Timing is derived from the same parameters the old canvas renderer used:
 * drift wraps around the viewport (a negative delay seeds the phase), rotation is
 * linear, and the opacity "breathes" on a sine.
 */

function subscribeReduceMotion(cb: () => void) {
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Pause the drift after this long without input; any input resumes it. */
const IDLE_MS = 45_000;
const LOW_END_SHAPES = 3;

function isLowEnd() {
  const { hardwareConcurrency, deviceMemory } = navigator as Navigator & { deviceMemory?: number };
  return (hardwareConcurrency ?? 8) <= 4 || (deviceMemory ?? 8) <= 4;
}

const TAU = Math.PI * 2;
/** How many sizes of travel past the edge before a wrapping shape reappears. */
const WRAP_MARGIN = 2.5;

type Shape = {
  points: string;
  extent: number;
  filled: boolean;
  fill: string;
  style: CSSProperties;
};

const fract = (v: number) => v - Math.floor(v);

/** Linear loop covering one pass in `duration`, started `phase` (0..1) of the way through. */
function loop(velocity: number, phase: number, span: number) {
  const duration = span / Math.abs(velocity);
  // Reverse playback runs 1 → 0, so the same position sits at 1 - phase.
  const start = velocity < 0 ? 1 - phase : phase;
  return { duration, delay: -start * duration, direction: velocity < 0 ? "reverse" : "normal" };
}

function buildShapes(): Shape[] {
  const s = generateShapes();
  const out: Shape[] = [];

  for (let i = 0; i < N; i++) {
    const size = s.size[i]!;
    const ax = s.aspect[i * 2]!;
    const ay = s.aspect[i * 2 + 1]!;
    const isDiamond = s.kind[i]! >= 0.5;
    const filled = s.filled[i]! > 0.5;

    // Geometry in units of the shape's size.
    const scale = (ax + ay) * 0.5;
    const pts: Array<[number, number]> = isDiamond
      ? [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ]
      : [0, 1, 2].map((k) => {
          const angle = (TAU * k) / 3 - Math.PI / 2;
          return [(Math.cos(angle) * scale) / ax, (Math.sin(angle) * scale) / ay];
        });
    const extent = Math.max(...pts.flat().map(Math.abs)) + (filled ? 0 : 0.1);

    const margin = extent * size * 100 * WRAP_MARGIN;
    const speed = s.driftSpeed[i]!;
    const offset = s.driftOffset[i]!;
    const dx = s.dir[i * 2]!;
    const dy = s.dir[i * 2 + 1]!;
    // x grows with the direction; y is flipped because the canvas drew bottom-up.
    const x = loop(dx * speed, fract(s.pos[i * 2]! + dx * offset), 1 + (2 * margin) / 100);
    const y = loop(-dy * speed, 1 - fract(s.pos[i * 2 + 1]! + dy * offset), 1 + (2 * margin) / 100);

    const rot = s.rotSpeed[i]!;
    const spinDuration = TAU / Math.abs(rot);
    const breathe = Math.PI / s.breatheSpeed[i]!;
    const breathePhase = ((s.breathePhase[i]! + Math.PI / 2) % TAU) / s.breatheSpeed[i]!;
    const [r, g, b] = [0, 1, 2].map((c) => Math.round(s.color[i * 3 + c]! * 255));

    out.push({
      points: pts.map((p) => p.join(",")).join(" "),
      extent,
      filled,
      fill: `rgb(${r},${g},${b})`,
      style: {
        "--m": margin,
        "--side": extent * size * 200,
        "--ext": extent,
        "--x-dur": `${x.duration}s`,
        "--x-delay": `${x.delay}s`,
        "--x-dir": x.direction,
        "--y-dur": `${y.duration}s`,
        "--y-delay": `${y.delay}s`,
        "--y-dir": y.direction,
        "--spin-dur": `${spinDuration}s`,
        "--spin-dir": rot < 0 ? "reverse" : "normal",
        "--breathe-dur": `${breathe}s`,
        "--breathe-delay": `${-breathePhase}s`,
        "--alpha": s.baseAlpha[i]!,
      } as CSSProperties,
    });
  }
  return out;
}

export function FloatingShapes() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shapes = useMemo(() => buildShapes().slice(0, isLowEnd() ? LOW_END_SHAPES : N), []);
  const reduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => root.style.setProperty("--ar", String(innerWidth / innerHeight));
    let idleTimer: ReturnType<typeof setTimeout>;
    let idle = false;
    const syncPaused = () =>
      root.toggleAttribute("data-paused", document.hidden || !document.hasFocus() || idle);
    const wake = () => {
      clearTimeout(idleTimer);
      if (idle) {
        idle = false;
        syncPaused();
      }
      idleTimer = setTimeout(() => {
        idle = true;
        syncPaused();
      }, IDLE_MS);
    };
    const wakeEvents = ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"];
    update();
    syncPaused();
    wake();
    addEventListener("resize", update, { passive: true });
    addEventListener("focus", syncPaused);
    addEventListener("blur", syncPaused);
    document.addEventListener("visibilitychange", syncPaused);
    for (const ev of wakeEvents) addEventListener(ev, wake, { passive: true });
    return () => {
      clearTimeout(idleTimer);
      removeEventListener("resize", update);
      removeEventListener("focus", syncPaused);
      removeEventListener("blur", syncPaused);
      document.removeEventListener("visibilitychange", syncPaused);
      for (const ev of wakeEvents) removeEventListener(ev, wake);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div ref={rootRef} className="floating-shapes" aria-hidden="true">
      {shapes.map((shape, i) => (
        <div key={i} className="fs-pos" style={shape.style}>
          <svg
            className="fs-svg"
            viewBox={`${-shape.extent} ${-shape.extent} ${shape.extent * 2} ${shape.extent * 2}`}
          >
            <polygon
              points={shape.points}
              strokeLinejoin="round"
              strokeWidth={0.15}
              fill={shape.filled ? shape.fill : "none"}
              stroke={shape.filled ? "none" : shape.fill}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
