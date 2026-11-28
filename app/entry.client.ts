import { Router } from "@effect/ui";
import { BrowserRouter, HtmlHydrate } from "@effect/ui/html";
import { Effect } from "effect";
import { FetchHttpClient } from "effect/http";
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
  Effect.provide([BrowserRouter.layer({ routes: AppRoute }), FetchHttpClient.layer]),
);

Effect.runFork(hydrate);
