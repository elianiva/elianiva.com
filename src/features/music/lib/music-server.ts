import { createServerFn } from "@tanstack/react-start";
import { Effect, Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/http";
import { KvCache } from "~/lib/cache";
import { LastFM } from "./lastfm.service";

/**
 * Server-only Last.fm reads. The API key lives in the Worker's env and is
 * read per request inside the handler — it never reaches the client bundle,
 * the browser only ever receives the returned data.
 *
 * Without `LASTFM_API_KEY` the service degrades to empty data, so the
 * sections render their empty states instead of failing.
 */
export const fetchRecentTracks = createServerFn().handler(async () => {
  const apiKey = process.env.LASTFM_API_KEY ?? "";
  const live = LastFM.layerFromToken(apiKey).pipe(
    Layer.provideMerge(Layer.merge(FetchHttpClient.layer, KvCache.layerFrom(undefined))),
  );
  const runtime = ManagedRuntime.make(live);
  return runtime.runPromise(
    Effect.gen(function* () {
      const service = yield* LastFM;
      return yield* service.getRecentTracks();
    }),
  );
});

export const fetchTopListsData = createServerFn().handler(async () => {
  const apiKey = process.env.LASTFM_API_KEY ?? "";
  const live = LastFM.layerFromToken(apiKey).pipe(
    Layer.provideMerge(Layer.merge(FetchHttpClient.layer, KvCache.layerFrom(undefined))),
  );
  const runtime = ManagedRuntime.make(live);
  return runtime.runPromise(
    Effect.gen(function* () {
      const service = yield* LastFM;
      return yield* service.getTopListsData();
    }),
  );
});

/**
 * Client-side Last.fm reads. These call the server functions above, so the
 * API key stays on the server — the browser only fetches the results.
 */
export function getTopListsData() {
  return fetchTopListsData();
}

export function getRecentTracks() {
  return fetchRecentTracks();
}
