import { Router } from "@effect/ui";
import { BrowserRouter, HtmlHydrate } from "@effect/ui/html";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { JsonApi } from "./queries/JsonApi";
import { App } from "./App";
import * as Pages from "./pages/lazy.ts";
import { AppRoute } from "./routes";
import { listenForCopies } from "./ui/code-copy";

const hydrate = Effect.gen(function* () {
  // Load the current page's chunk first, so hydration adopts the prerendered
  // nodes instead of swapping them for the fallback.
  const route = yield* Router.currentRoute(AppRoute);
  const page = (
    {
      Home: Pages.Home,
      Posts: Pages.Posts,
      Post: Pages.Post,
      Projects: Pages.Projects,
      Project: Pages.Project,
      Work: Pages.Work,
      Uses: Pages.Uses,
      Neighbours: Pages.Neighbours,
      Music: Pages.Music,
    } as const
  )[route._tag as never] as { preload?: () => Promise<unknown> } | undefined;
  if (page) yield* Effect.promise(() => page.preload!());
  const state = JSON.parse(document.getElementById("state")!.textContent!);
  const root = yield* HtmlHydrate.hydrateEffect(
    App,
    Router.props(AppRoute),
    document.getElementById("app")!,
    state,
  );
  yield* root.adopted;
  yield* listenForCopies;
  return yield* Effect.never;
}).pipe(
  Effect.scoped,
  Effect.provide(
    Layer.mergeAll(
      BrowserRouter.layer({ routes: AppRoute }),
      FetchHttpClient.layer,
      JsonApi.layerHttp.pipe(Layer.provide(FetchHttpClient.layer)),
    ),
  ),
);

// `Post`'s query layer is typed with an open requirement; the browser run covers it.
Effect.runFork(hydrate as Effect.Effect<never>);
