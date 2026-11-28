import { HtmlServer } from "@effect/ui/html";
import { Context, Effect, Logger, type Layer, Option, Scope } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/http";
import { AppRoute } from "../routes";
import { App } from "../App";
import { PROPS_ATTR, type IslandName } from "./island";
import * as Comments from "./Comments";
import * as LastPushTag from "./LastPushTag";
import * as ListeningCell from "./ListeningCell";
import * as MusicBody from "./MusicBody";
import * as Quiz from "./Quiz";
import * as ScrobbleCount from "./ScrobbleCount";
import * as StatusTile from "./StatusTile";

const islands: Record<IslandName, { island: any }> = {
  Quiz,
  Comments,
  StatusTile,
  ListeningCell,
  LastPushTag,
  MusicBody,
  ScrobbleCount,
};

// `renderToHtml` writes these around each component instance. A root that is never hydrated has no use for them.
const HYDRATION_MARKERS = /<!--[[\]][^>]*-->/g;

const PLACEHOLDER = /<div ([^>]*\bdata-island="[^>]*)><\/div>/g;

const attributesOf = (source: string) =>
  Object.fromEntries(Array.from(source.matchAll(/([\w-]+)="([^"]*)"/g), (m) => [m[1]!, m[2]!]));

/**
 * Fills each `Island` placeholder in the page with the island's own server
 * render, and collects the states the browser hydrates them with.
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
  readonly budget: string;
}): Layer.Layer<never, never, any> =>
  HttpRouter.use(
    Effect.fnUntraced(function* (router) {
      const services = Context.omit(Scope.Scope)(yield* Effect.context<any>());
      const budget = options.budget as any;
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
            return HttpServerResponse.text(
              `Render failed for ${request.url}:\n${errors.join("\n")}`,
              { status: 500 },
            );
          }
          return HttpServerResponse.text(
            options.document({ ...rendered, html, state: { "~islands": states } as never }),
            { status: notFound ? 404 : 200, contentType: "text/html" },
          );
        });
        return page.pipe(
          Effect.provide(Logger.layer([catcher], { mergeWithExisting: true })),
          Effect.provideContext(services as Context.Context<any>),
        ) as Effect.Effect<HttpServerResponse.HttpServerResponse>;
      });
    }),
  );
