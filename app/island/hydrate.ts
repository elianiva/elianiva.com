import type { Renderer } from "@effect/ui";
import { HtmlHydrate } from "@effect/ui/html";
import { Effect, Layer } from "effect";
import { isDefinition } from "./define";

/** One chunk per island, so a page loads only the islands it holds. */
const modules = import.meta.glob<Record<string, unknown>>("../islands/*.ts");

const states: Record<string, Renderer.State> = JSON.parse(
  document.getElementById("state")!.textContent!,
)["~islands"];

/** Hydrates one island into its own root, for as long as the page lives. */
export const hydrateIsland = (el: HTMLElement) =>
  Effect.runFork(
    Effect.gen(function* () {
      const name = el.dataset.island!;
      const module = yield* Effect.promise(() => modules[`../islands/${name}.ts`]!());
      const definition = module[name];
      if (!isDefinition(definition)) return yield* Effect.die(`${name} is not an island`);
      const root = yield* Effect.promise(() => definition.root());
      const props = definition.decodeProps(JSON.parse(el.dataset.islandProps!));
      // Only the islands that list layers pay for them: an island with none loads no HTTP client.
      const layer = definition.layers.reduce<Layer.Layer<never>>(
        (all, layer) => Layer.merge(all, layer),
        Layer.empty,
      );
      return yield* Effect.gen(function* () {
        const handle = yield* HtmlHydrate.hydrateEffect(
          root,
          props,
          el,
          states[el.dataset.islandId!]!,
        );
        yield* handle.adopted;
        return yield* Effect.never;
      }).pipe(Effect.provide(layer));
    }).pipe(Effect.scoped),
  );
