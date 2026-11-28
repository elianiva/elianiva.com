import { Mount, UiSchema } from "@effect/ui";
import { Html, HtmlSubscription } from "@effect/ui/html";
import { Effect, Schema, Stream } from "effect";
import { generateShapes, N } from "../lib/background";

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
const IDLE_MS = 45_000;
const LOW_END_SHAPES = 3;
const TAU = Math.PI * 2;
/** How many sizes of travel past the edge before a wrapping shape reappears. */
const WRAP_MARGIN = 2.5;

const isLowEnd = () => {
  const { hardwareConcurrency, deviceMemory } = navigator as Navigator & { deviceMemory?: number };
  return (hardwareConcurrency ?? 8) <= 4 || (deviceMemory ?? 8) <= 4;
};

type Shape = {
  points: string;
  extent: number;
  filled: boolean;
  fill: string;
  style: Html.Style;
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
const shapes = () => (drawn ??= buildShapes().slice(0, isLowEnd() ? LOW_END_SHAPES : N));

/** Waits for the browser to be idle, so the shapes stay off the critical path. */
const WaitForIdle = Mount.make("WaitForIdle", {}, (_node: HTMLElement) =>
  Effect.callback<void>((resume) => {
    const run = () => resume(Effect.void);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      return Effect.sync(() => window.cancelIdleCallback(id));
    }
    const id = setTimeout(run, 200);
    return Effect.sync(() => clearTimeout(id));
  }),
);

/**
 * Keeps `--ar` at the viewport's aspect ratio and toggles `data-paused` while
 * the tab is hidden, unfocused, or has had no input for `IDLE_MS`. It touches
 * only attributes the view never sets, so a re-render leaves them alone.
 */
const TrackViewport = Mount.makeStream("TrackViewport", {}, (root: HTMLElement) =>
  Stream.callback<never>(
    Effect.fnUntraced(function* () {
      yield* Effect.acquireRelease(
        Effect.sync(() => {
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
          const wakeEvents = [
            "pointermove",
            "pointerdown",
            "keydown",
            "wheel",
            "scroll",
            "touchstart",
          ];
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
        }),
        (cleanup) => Effect.sync(cleanup),
      );
    }),
  ),
);

const FloatingShapesMessage = UiSchema.TaggedEnum({
  Idled: {},
  ChangedReduceMotion: { reduce: Schema.Boolean },
});

export const FloatingShapes = Html.component({
  name: "FloatingShapes",
  model: Schema.Struct({ ready: Schema.Boolean, reduceMotion: Schema.Boolean }),
  message: FloatingShapesMessage,
}).make({
  init: () => ({ ready: false, reduceMotion: false }),
  update: ($, message) =>
    FloatingShapesMessage.match(message, {
      Idled: () => $.evolve({ ready: true }),
      ChangedReduceMotion: ({ reduce }) => $.evolve({ reduceMotion: reduce }),
    }),
  subscriptions: () => [
    HtmlSubscription.onMediaQuery("(prefers-reduced-motion: reduce)", (reduce) =>
      FloatingShapesMessage.ChangedReduceMotion({ reduce }),
    ),
  ],
  view: (h, { ready, reduceMotion }) =>
    ready && !reduceMotion
      ? h.div
          .class("floating-shapes")
          .attr("aria-hidden", "true")
          .onMount(TrackViewport())
          .children(
            shapes().map((shape, i) =>
              h.div
                .key(String(i))
                .class("fs-pos")
                .style(shape.style)
                .children(
                  h.svg
                    .class("fs-svg")
                    .attr(
                      "viewBox",
                      `${-shape.extent} ${-shape.extent} ${shape.extent * 2} ${shape.extent * 2}`,
                    )
                    .children(
                      h.polygon.attrs({
                        points: shape.points,
                        "stroke-linejoin": "round",
                        "stroke-width": "0.15",
                        fill: shape.filled ? shape.fill : "none",
                        stroke: shape.filled ? "none" : shape.fill,
                      }),
                    ),
                ),
            ),
          )
      : // Nothing to draw yet (or ever, under reduced motion); the sentinel
        // only gives the idle wait an element to start from.
        h.span
          .attr("hidden", "")
          .onMount(WaitForIdle().pipe(Mount.map(() => FloatingShapesMessage.Idled()))),
});
