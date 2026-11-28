import { HtmlHydrate } from "@effect/ui/html";
import { Effect, Layer } from "effect";
import { browserLayer } from "../queries/browser";
import { JsonApi, type JsonApiError } from "../queries/JsonApi";
import type { IslandName } from "./island";

/** One chunk per island, so a page loads only the islands it holds. */
const loaders: Record<IslandName, () => Promise<{ island: any }>> = {
  Quiz: () => import("./Quiz"),
  Comments: () => import("./Comments"),
  StatusTile: () => import("./StatusTile"),
  ListeningCell: () => import("./ListeningCell"),
  LastPushTag: () => import("./LastPushTag"),
};

const inFlight = new Map<string, Effect.Effect<unknown, JsonApiError>>();

/**
 * Every island is a root with its own query cache, so two islands reading the
 * same URL (the status tile and the push tag both read GitHub) would fetch it
 * twice. This shares one request while it is in flight.
 */
const sharedApi = Layer.effect(
  JsonApi,
  Effect.gen(function* () {
    const api = yield* JsonApi;
    return JsonApi.of({
      get: (url) => {
        let shared = inFlight.get(url);
        if (!shared) {
          shared = Effect.runSync(
            Effect.cached(
              api.get(url).pipe(Effect.ensuring(Effect.sync(() => inFlight.delete(url)))),
            ),
          );
          inFlight.set(url, shared);
        }
        return shared;
      },
    });
  }),
).pipe(Layer.provide(browserLayer));

const states: Record<string, any> = JSON.parse(document.getElementById("state")!.textContent!)[
  "~islands"
];

/** Hydrates one island into its own root, for as long as the page lives. */
export const hydrateIsland = (el: HTMLElement) =>
  Effect.runFork(
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
    }).pipe(Effect.scoped, Effect.provide(sharedApi)) as Effect.Effect<never>,
  );
