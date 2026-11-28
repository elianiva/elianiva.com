import { HtmlHydrate } from "@effect/ui/html";
import { Effect, Layer } from "effect";
import type { IslandName } from "./island";

/** One chunk per island, so a page loads only the islands it holds. */
const loaders: Record<IslandName, () => Promise<{ island: any; api: boolean }>> = {
  Quiz: () => import("./Quiz"),
  Comments: () => import("./Comments"),
  StatusTile: () => import("./StatusTile"),
  ListeningCell: () => import("./ListeningCell"),
  LastPushTag: () => import("./LastPushTag"),
  MusicBody: () => import("./MusicBody"),
  ScrobbleCount: () => import("./ScrobbleCount"),
};

const states: Record<string, any> = JSON.parse(document.getElementById("state")!.textContent!)[
  "~islands"
];

/** Hydrates one island into its own root, for as long as the page lives. */
export const hydrateIsland = (el: HTMLElement) =>
  Effect.runFork(
    Effect.gen(function* () {
      const { island, api } = yield* Effect.promise(() =>
        loaders[el.dataset.island as IslandName](),
      );
      // Only the islands that read `/api/*` load the HTTP client and its Layer.
      const layer = api
        ? yield* Effect.promise(() => import("./api").then((m) => m.sharedApi))
        : Layer.empty;
      const state = states[el.dataset.islandId!];
      return yield* Effect.gen(function* () {
        const root = yield* HtmlHydrate.hydrateEffect(
          island,
          HtmlHydrate.decodeProps(island, state),
          el,
          state,
        );
        yield* root.adopted;
        return yield* Effect.never;
      }).pipe(Effect.provide(layer));
    }).pipe(Effect.scoped) as Effect.Effect<never>,
  );
