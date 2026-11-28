import { Router } from "@effect/ui";
import { BrowserRouter, HtmlHydrate } from "@effect/ui/html";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { JsonApi } from "./queries/JsonApi";
import { App } from "./App";
import { AppRoute } from "./routes";

const hydrate = Effect.gen(function* () {
  const state = JSON.parse(document.getElementById("state")!.textContent!);
  const root = yield* HtmlHydrate.hydrateEffect(
    App,
    Router.props(AppRoute),
    document.getElementById("app")!,
    state,
  );
  yield* root.adopted;
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
