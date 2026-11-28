import type { Renderer } from "@effect/ui";
import { HtmlHydrate } from "@effect/ui/html";
import { Effect, Layer } from "effect";
import { isDefinition } from "./define";

/** One chunk per island, so a page loads only the islands it holds. */
const modules = import.meta.glob<Record<string, unknown>>("../islands/*.ts");

/** The state of every island on the page, each under the path the server rendered it at. */
const page: Renderer.State = JSON.parse(document.getElementById("state")!.textContent!);

const unescapePath = (path: string) =>
  path.replace(/%u([0-9A-F]{4})|%([0-9A-F]{2})/g, (_, wide: string, narrow: string) =>
    String.fromCharCode(Number.parseInt(wide ?? narrow, 16)),
  );

/**
 * The server rendered the island as a child of the page, at a path such as
 * `/App/Post[/posts/x]/Island[Quizx1]`. Hydrated alone it is a root at
 * `/Island[Quizx1]`, so its state and the markers around its nodes move there.
 */
const asRoot = (el: HTMLElement) => {
  const open = el.firstChild as Comment;
  const escaped = open.data.slice(1);
  const from = unescapePath(escaped);
  const segment = from.slice(from.lastIndexOf("/") + 1);
  const to = `/${segment}`;
  const move = (path: string) =>
    path === from || path.startsWith(`${from}/`) ? to + path.slice(from.length) : undefined;

  const state: Record<string, unknown> = { "~query": {}, "~static": true };
  state["~key"] = segment.slice(segment.indexOf("[") + 1, -1);
  for (const [path, value] of Object.entries(page)) {
    if (path.startsWith("/") && move(path) !== undefined) state[move(path)!] = value;
  }
  state["~deferred"] = (page["~deferred"] ?? []).flatMap((path) => move(path) ?? []);
  const status = Object.entries(page["~status"] ?? {}).flatMap(([path, value]) => {
    const moved = move(path);
    return moved === undefined ? [] : [[moved, value] as const];
  });
  if (status.length > 0) state["~status"] = Object.fromEntries(status);

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_COMMENT);
  const target = `/${escaped.slice(escaped.lastIndexOf("/") + 1)}`;
  for (
    let node = walker.nextNode() as Comment | null;
    node;
    node = walker.nextNode() as Comment | null
  ) {
    const rest = node.data.slice(1);
    if (rest === escaped || rest.startsWith(`${escaped}/`)) {
      node.data = node.data[0] + target + rest.slice(escaped.length);
    }
  }
  return state as Renderer.State;
};

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
        const handle = yield* HtmlHydrate.hydrateEffect(root, props, el, asRoot(el));
        yield* handle.adopted;
        return yield* Effect.never;
      }).pipe(Effect.provide(layer));
    }).pipe(Effect.scoped),
  );
