import { Router } from "@effect/ui";
import { HtmlServer } from "@effect/ui/html";
import { Context, Effect, type Layer, Option, Scope } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/http";
import { AppRoute } from "../routes";
import { App, StaticApp } from "../App";
import { PROPS_ATTR, type IslandName } from "./island";
import * as Comments from "./Comments";
import * as LastPushTag from "./LastPushTag";
import * as ListeningCell from "./ListeningCell";
import * as Quiz from "./Quiz";
import * as StatusTile from "./StatusTile";

/** Routes drawn as static pages with islands. Every other route is one hydrated root (`App`). */
const ISLAND_ROUTES: ReadonlySet<string> = new Set(["Home", "Uses", "Post"]);

const islands: Record<IslandName, { island: any }> = {
  Quiz,
  Comments,
  StatusTile,
  ListeningCell,
  LastPushTag,
};

// `renderToHtml` writes these around each component instance. A root that is never hydrated has no use for them.
const HYDRATION_MARKERS = /<!--[[\]][^>]*-->/g;

const PLACEHOLDER = /<div ([^>]*\bdata-island="[^>]*)><\/div>/g;

const attributesOf = (source: string) =>
  Object.fromEntries(Array.from(source.matchAll(/([\w-]+)="([^"]*)"/g), (m) => [m[1]!, m[2]!]));

/**
 * Fills each `Island` placeholder in a static page with the island's own
 * server render, and collects the states the browser hydrates them with.
 */
const renderIslands = (html: string, budget: any) =>
  Effect.gen(function* () {
    const states: Record<string, unknown> = {};
    let out = "";
    let last = 0;
    for (const match of html.matchAll(PLACEHOLDER)) {
      const attrs = attributesOf(match[1]!);
      const entry = islands[attrs["data-island"] as IslandName];
      const id = attrs["data-island-id"]!;
      const props = JSON.parse(decodeURIComponent(attrs[PROPS_ATTR] ?? "%7B%7D"));
      const rendered: HtmlServer.Rendered<unknown> = yield* HtmlServer.renderToHtml(
        entry.island,
        props,
        { budget, key: id, includeProps: true },
      );
      states[id] = rendered.state;
      out += html.slice(last, match.index) + `<div ${match[1]}>${rendered.html}</div>`;
      last = match.index + match[0].length;
    }
    return { html: out + html.slice(last), states };
  });

/**
 * `HtmlServerHttp.layerHttp` for a site where some routes are static pages
 * with islands and the rest are one hydrated root. The static pages render
 * `StaticApp` once, then each island as a root of its own; the document
 * carries `{"~islands": {id: state}}` as its state, which `app/entry.client.ts`
 * reads to choose between hydrating one root and hydrating islands.
 */
export const layerHttp = (options: {
  readonly document: (rendered: HtmlServer.Rendered<unknown>) => string;
  readonly budget: string;
}): Layer.Layer<never, never, any> =>
  HttpRouter.use(
    Effect.fnUntraced(function* (router) {
      const services = Context.omit(Scope.Scope)(yield* Effect.context<any>());
      const budget = options.budget as any;
      const renderRoot = HtmlServer.renderToHtml(App, Router.props(AppRoute), { budget });
      const renderStatic = HtmlServer.renderToHtml(StaticApp, Router.props(AppRoute), { budget });
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
        const respond = (body: string) =>
          HttpServerResponse.text(body, { status: notFound ? 404 : 200, contentType: "text/html" });
        const page = ISLAND_ROUTES.has(route._tag)
          ? Effect.gen(function* () {
              const rendered = yield* renderStatic;
              const { html, states } = yield* renderIslands(
                rendered.html.replace(HYDRATION_MARKERS, ""),
                budget,
              );
              return respond(
                options.document({ ...rendered, html, state: { "~islands": states } as never }),
              );
            })
          : Effect.map(renderRoot, (rendered) => respond(options.document(rendered)));
        return page.pipe(
          Effect.provide(Router.static({ routes: AppRoute, url: request.url })),
          Effect.provideContext(services as Context.Context<any>),
        ) as Effect.Effect<HttpServerResponse.HttpServerResponse>;
      });
    }),
  );
