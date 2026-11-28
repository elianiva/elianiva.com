import type { Renderer } from "@effect/ui";
import { HtmlServer } from "@effect/ui/html";
import { Cause, Context, Effect, Logger, type Duration, type Layer, Option, Scope } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/http";
import { AppRoute } from "../routes";
import { App } from "../App";
import { isDefinition, WRAPPER, type Definition } from "./define";

/** Every island, by file name. Eager: the server renders whichever a page holds. */
const modules = import.meta.glob<Record<string, unknown>>("../islands/*.ts", { eager: true });
const definitions: Definition[] = [];
for (const [path, module] of Object.entries(modules)) {
  const name = /([^/]+)\.ts$/.exec(path)![1]!;
  const definition = module[name];
  if (!isDefinition(definition)) {
    throw new Error(`app/islands/${name}.ts must export its island as \`${name}\``);
  }
  definition.file = name;
  definitions.push(definition);
}

/**
 * Only an island's own instances are hydrated, so only they keep their state
 * and their markers: everything the page itself holds is dropped. An island's
 * path has the island's root in it, as in `/App/Post[/posts/x]/Island[Quizx1]`.
 */
const islandPaths = new RegExp(`/${WRAPPER}\\[`);

const onlyIslands = (page: HtmlServer.Rendered<unknown>, belongs: RegExp) => {
  const state: Record<string, unknown> = { "~deferred": [], "~query": {}, "~static": true };
  for (const [path, value] of Object.entries(page.state)) {
    if (path.startsWith("/") && belongs.test(path)) state[path] = value;
  }
  state["~deferred"] = (page.state["~deferred"] ?? []).filter((path) => belongs.test(path));
  const status = Object.entries(page.state["~status"] ?? {}).filter(([path]) => belongs.test(path));
  if (status.length > 0) state["~status"] = Object.fromEntries(status);
  return {
    ...page,
    state: state as Renderer.State,
    html: page.html.replace(/<!--[[\]]([^>]*)-->/g, (marker, path: string) =>
      belongs.test(path) ? marker : "",
    ),
  };
};

/**
 * The server for a site of static pages with islands. The page is `App`,
 * rendered once to a string; then each island is rendered as a root of its
 * own. The document's state is `{"~islands": {id: state}}`, which
 * `app/islands/hydrate.ts` reads.
 *
 * A render that logs an error (a view that throws, a failed layer) answers
 * 500, which fails the build's prerender instead of writing a broken page.
 */
export const layerHttp = (options: {
  readonly document: (rendered: HtmlServer.Rendered<unknown>) => string;
  readonly budget: Duration.Input;
}): Layer.Layer<never, never, any> =>
  HttpRouter.use(
    Effect.fnUntraced(function* (router) {
      const services = Context.omit(Scope.Scope)(yield* Effect.context<any>());
      // A view calls an island like a component, so every island's chunk is loaded before any page renders.
      yield* Effect.promise(() => Promise.all(definitions.map((d) => d.root())));
      const belongs = islandPaths;
      const budget = options.budget;
      yield* router.add("GET", "*", (request) => {
        const resolved = AppRoute.resolve(request.url);
        if (Option.isNone(resolved)) {
          return Effect.succeed(HttpServerResponse.text("Not found", { status: 404 }));
        }
        const { invalid, notFound, redirected, route } = resolved.value;
        if (redirected || invalid.length > 0) {
          return Effect.succeed(
            HttpServerResponse.redirect(AppRoute.print(route), {
              status: invalid.length > 0 ? 302 : 301,
            }),
          );
        }
        const errors: string[] = [];
        const catcher = Logger.make<unknown, void>((entry) => {
          if (entry.logLevel === "Error" || entry.logLevel === "Fatal") {
            errors.push(String(entry.message));
          }
        });
        const page = Effect.gen(function* () {
          const rendered = yield* HtmlServer.renderToHtml(App, { route }, { budget });
          if (errors.length > 0 || rendered.model === undefined) {
            const body = `Render failed for ${request.url}:\n${errors.join("\n")}`;
            console.error(body);
            return HttpServerResponse.text(body, { status: 500 });
          }
          return HttpServerResponse.text(options.document(onlyIslands(rendered, belongs)), {
            status: notFound ? 404 : 200,
            contentType: "text/html",
          });
        });
        return page.pipe(
          // A thrown error is as fatal as a logged one: say what it was, since the build only sees the 500.
          Effect.catchCause((cause) => {
            const body = `Render failed for ${request.url}:\n${Cause.pretty(cause)}`;
            console.error(body);
            return Effect.succeed(HttpServerResponse.text(body, { status: 500 }));
          }),
          Effect.provide(Logger.layer([catcher], { mergeWithExisting: true })),
          Effect.provideContext(services as Context.Context<any>),
        ) as Effect.Effect<HttpServerResponse.HttpServerResponse>;
      });
    }),
  );
