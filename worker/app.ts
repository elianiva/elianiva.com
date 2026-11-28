import { Effect, Layer } from "effect";
import { FetchHttpClient, HttpRouter, HttpServerResponse } from "effect/http";
import type { KVNamespace } from "@cloudflare/workers-types";
import { KvCache, type CacheScheduler } from "./cache";
import { GitHubService } from "./github.service";
import { LastFM } from "./lastfm.service";

/** What one request needs to answer: secrets, the KV cache, and background work. */
export type ApiRuntime = {
  readonly githubToken: string;
  readonly lastfmKey: string;
  readonly kv?: KVNamespace | undefined;
  readonly schedule?: CacheScheduler | undefined;
};

/**
 * Services for one request. An empty token degrades its service to empty data,
 * and a missing `kv` runs without a cache (plain `vite dev`).
 */
const servicesFor = (runtime: ApiRuntime) =>
  Layer.mergeAll(
    GitHubService.layerFromToken(runtime.githubToken),
    LastFM.layerFromToken(runtime.lastfmKey),
  ).pipe(
    Layer.provide(
      Layer.merge(FetchHttpClient.layer, KvCache.layerFrom(runtime.kv, runtime.schedule)),
    ),
  );

/**
 * The JSON routes the browser reads. Every handler is total: the services turn
 * upstream failures into the last good copy or an empty fallback, so a route
 * never answers with an error.
 *
 * `runtime` is read once per request. In a Worker it needs the request's
 * context, which is why it is an Effect and not a value.
 */
export const apiRoutes = <R>(runtime: Effect.Effect<ApiRuntime, never, R>) => {
  const get = (
    path: `/api/${string}`,
    read: Effect.Effect<unknown, never, GitHubService | LastFM>,
  ) =>
    HttpRouter.add(
      "GET",
      path,
      Effect.gen(function* () {
        const rt = yield* runtime;
        const body = yield* read.pipe(Effect.provide(servicesFor(rt)));
        return HttpServerResponse.jsonUnsafe(body);
      }),
    );

  const github = <A>(read: (s: GitHubService["Service"]) => Effect.Effect<A>) =>
    Effect.gen(function* () {
      return yield* read(yield* GitHubService);
    });
  const lastfm = <A>(read: (s: LastFM["Service"]) => Effect.Effect<A>) =>
    Effect.gen(function* () {
      return yield* read(yield* LastFM);
    });

  return Layer.mergeAll(
    get(
      "/api/github/prs",
      github((s) => s.getPRs()),
    ),
    get(
      "/api/github/contributions",
      github((s) => s.getContributions()),
    ),
    get(
      "/api/music/recent",
      lastfm((s) => s.getRecentTracks()),
    ),
    get(
      "/api/music/top",
      lastfm((s) => s.getTopListsData()),
    ),
  );
};
