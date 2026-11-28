import { Mount, UiSchema } from "@effect/ui";
import { Html, HtmlSubscription } from "@effect/ui/html";
import { Effect, Schema, Stream } from "effect";
import { IDLE_MS, shapes } from "../lib/shapes";

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
