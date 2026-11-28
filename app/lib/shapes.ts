import { generateShapes, N } from "./background";

/**
 * Decorative drifting shapes. Every motion is a CSS transform/opacity
 * animation, so the compositor runs it off the main thread. Layers are kept
 * to two per shape, the animation pauses while the tab is hidden, unfocused
 * or idle, low-end devices get fewer shapes, and nothing renders under
 * prefers-reduced-motion. Geometry is in container-query units, so resizing
 * needs no work beyond updating one aspect-ratio variable.
 *
 * The shapes are drawn once the page has had a chance to render
 * (`requestIdleCallback`), so the first paint and the prerendered HTML do not
 * carry them. The rules are in `panda/global.ts`.
 */

/** Pause the drift after this long without input; any input resumes it. */
export const IDLE_MS = 45_000;
const LOW_END_SHAPES = 3;
const TAU = Math.PI * 2;
/** How many sizes of travel past the edge before a wrapping shape reappears. */
const WRAP_MARGIN = 2.5;

export const isLowEnd = () => {
  const { hardwareConcurrency, deviceMemory } = navigator as Navigator & { deviceMemory?: number };
  return (hardwareConcurrency ?? 8) <= 4 || (deviceMemory ?? 8) <= 4;
};

export type Shape = {
  points: string;
  extent: number;
  filled: boolean;
  fill: string;
  style: Record<string, string>;
};

const fract = (v: number) => v - Math.floor(v);

/** Linear loop covering one pass in `duration`, started `phase` (0..1) of the way through. */
const loop = (velocity: number, phase: number, span: number) => {
  const duration = span / Math.abs(velocity);
  // Reverse playback runs 1 → 0, so the same position sits at 1 - phase.
  const start = velocity < 0 ? 1 - phase : phase;
  return { duration, delay: -start * duration, direction: velocity < 0 ? "reverse" : "normal" };
};

const buildShapes = (): Shape[] => {
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
        "--m": String(margin),
        "--side": String(extent * size * 200),
        "--ext": String(extent),
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
        "--alpha": String(s.baseAlpha[i]!),
      },
    });
  }
  return out;
};

/**
 * Drawn once, in the browser, the first time the shapes are shown: they are
 * random, so the prerender cannot hold them, and re-rolling them on a later
 * render would restart every animation.
 */
let drawn: Shape[] | undefined;
export const shapes = () => (drawn ??= buildShapes().slice(0, isLowEnd() ? LOW_END_SHAPES : N));

const SVG = "http://www.w3.org/2000/svg";

/**
 * Draws the shapes with plain DOM, for pages that ship no Effect runtime. The
 * markup and classes are what `FloatingShapes` renders, so `panda/global.ts`
 * styles both. Call it from an idle callback.
 */
export const drawShapes = () => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.createElement("div");
  root.className = "floating-shapes";
  root.setAttribute("aria-hidden", "true");
  for (const shape of shapes()) {
    const pos = document.createElement("div");
    pos.className = "fs-pos";
    for (const [key, value] of Object.entries(shape.style)) pos.style.setProperty(key, value);
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "fs-svg");
    svg.setAttribute(
      "viewBox",
      `${-shape.extent} ${-shape.extent} ${shape.extent * 2} ${shape.extent * 2}`,
    );
    const polygon = document.createElementNS(SVG, "polygon");
    polygon.setAttribute("points", shape.points);
    polygon.setAttribute("stroke-linejoin", "round");
    polygon.setAttribute("stroke-width", "0.15");
    polygon.setAttribute("fill", shape.filled ? shape.fill : "none");
    polygon.setAttribute("stroke", shape.filled ? "none" : shape.fill);
    svg.appendChild(polygon);
    pos.appendChild(svg);
    root.appendChild(pos);
  }
  document.body.insertBefore(root, document.body.firstChild);
  trackViewport(root);
};

/** `--ar` follows the viewport; `data-paused` is set while hidden, unfocused or idle. */
const trackViewport = (root: HTMLElement) => {
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
  update();
  syncPaused();
  wake();
  addEventListener("resize", update, { passive: true });
  addEventListener("focus", syncPaused);
  addEventListener("blur", syncPaused);
  document.addEventListener("visibilitychange", syncPaused);
  for (const ev of ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"]) {
    addEventListener(ev, wake, { passive: true });
  }
};
