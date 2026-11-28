import { HtmlHydrate } from "@effect/ui/html";
import { Effect, Layer } from "effect";
import { browserLayer } from "../queries/browser";
import type { IslandLoad, IslandName } from "./island";

/** One chunk per island, so a page loads only the islands it holds. */
const loaders: Record<IslandName, () => Promise<{ island: any }>> = {
  Quiz: () => import("./Quiz"),
  Comments: () => import("./Comments"),
  StatusTile: () => import("./StatusTile"),
  ListeningCell: () => import("./ListeningCell"),
  LastPushTag: () => import("./LastPushTag"),
};

const states: Record<string, any> = JSON.parse(document.getElementById("state")!.textContent!)[
  "~islands"
];

/** Resolves when the island's container is near the viewport, or the main thread is idle. */
const whenDue = (el: Element, load: IslandLoad) =>
  new Promise<void>((resolve) => {
    if (load === "idle") {
      (window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 200)))(() => resolve(), {
        timeout: 2000,
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          resolve();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
  });

const hydrateIsland = (el: HTMLElement) =>
  Effect.gen(function* () {
    const { island } = yield* Effect.promise(() => loaders[el.dataset.island as IslandName]());
    const state = states[el.dataset.islandId!];
    const root = yield* HtmlHydrate.hydrateEffect(
      island,
      HtmlHydrate.decodeProps(island, state),
      el,
      state,
    );
    yield* root.adopted;
    return yield* Effect.never;
  });

const run = Effect.forEach(
  Array.from(document.querySelectorAll<HTMLElement>("[data-island]")),
  (el) =>
    Effect.promise(() => whenDue(el, el.dataset.islandLoad as IslandLoad)).pipe(
      Effect.andThen(hydrateIsland(el)),
    ),
  { concurrency: "unbounded", discard: true },
).pipe(Effect.scoped, Effect.provide(Layer.mergeAll(browserLayer)));

Effect.runFork(run as Effect.Effect<never>);
