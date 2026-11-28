import type { Renderer } from "@effect/ui";
import { HtmlServer } from "@effect/ui/html";
import { Cause, Context, Effect, Logger, type Duration, type Layer, Option, Scope } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/http";
import { AppRoute } from "../routes";
import { App } from "../App";
import { isDefinition, SLOT_ATTR, slots, type Definition } from "./define";

/** Every island, by file name. Eager: the server renders whichever a page holds. */
const modules = import.meta.glob<Record<string, unknown>>("../islands/*.ts", { eager: true });
const names = new Map<Definition, string>();
for (const [path, module] of Object.entries(modules)) {
  const name = /([^/]+)\.ts$/.exec(path)![1]!;
  const definition = module[name];
  if (!isDefinition(definition)) {
    throw new Error(`app/islands/${name}.ts must export its island as \`${name}\``);
  }
  names.set(definition, name);
}

// `renderToHtml` writes these around each component instance. A root that is never hydrated has no use for them.
const HYDRATION_MARKERS = /<!--[[\]][^>]*-->/g;

/** The placeholder a view leaves: an empty `div` whose one distinguishing attribute is its token. */
const PLACEHOLDER = new RegExp(`<div\\b[^<>]*?\\s${SLOT_ATTR}="(i\\d+)"[^<>]*></div>`, "g");

const escapeAttribute = (value: string) => value.replace(/[&"<>]/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Fills each placeholder in the page with the island's own server render, and
 * collects the states the browser hydrates them with. An island's id is its
 * name and its place among that name's islands on the page.
 */
export const renderIslands = (html: string, budget: Duration.Input) =>
  Effect.gen(function* () {
    const states: Record<string, Renderer.State> = {};
    const seen = new Map<string, number>();
    let out = "";
    let last = 0;
    for (const match of html.matchAll(PLACEHOLDER)) {
      const token = match[1]!;
      const slot = slots.get(token);
      if (slot === undefined) throw new Error(`No island is waiting at ${token}`);
      slots.delete(token);
      const name = names.get(slot.definition);
      if (name === undefined) throw new Error("An island is not in app/islands/");
      const index = seen.get(name) ?? 0;
      seen.set(name, index + 1);
      const id = `${name}-${index}`;
      const root = yield* Effect.promise(() => slot.definition.root());
      const rendered = yield* HtmlServer.renderToHtml(
        root,
        slot.definition.decodeProps(slot.props),
        { budget, key: id },
      );
      states[id] = rendered.state;
      const attributes = [
        `data-island="${name}"`,
        `data-island-id="${id}"`,
        `data-island-load="${slot.load}"`,
        `data-island-props="${escapeAttribute(JSON.stringify(slot.props))}"`,
      ].join(" ");
      out +=
        html.slice(last, match.index) +
        match[0].replace(`${SLOT_ATTR}="${token}"`, attributes).replace(/<\/div>$/, "") +
        rendered.html +
        "</div>";
      last = match.index + match[0].length;
    }
    return { html: out + html.slice(last), states };
  });

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
          const { html, states } = yield* renderIslands(
            rendered.html.replace(HYDRATION_MARKERS, ""),
            budget,
          );
          if (errors.length > 0 || rendered.model === undefined) {
            const body = `Render failed for ${request.url}:\n${errors.join("\n")}`;
            console.error(body);
            return HttpServerResponse.text(body, { status: 500 });
          }
          return HttpServerResponse.text(
            options.document({ ...rendered, html, state: { "~islands": states } as never }),
            { status: notFound ? 404 : 200, contentType: "text/html" },
          );
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
