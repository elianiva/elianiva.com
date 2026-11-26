import { createServerFn } from "@tanstack/react-start";
import { Effect, Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/http";
import { getCacheBindings, KvCache } from "~/lib/cache";
import { LastFM } from "./lastfm.service";

/**
 * Server-only Last.fm reads. The API key lives in the Worker's env and is
 * read per request inside the handler — it never reaches the client bundle,
 * the browser only ever receives the returned data.
 *
 * Cached reads come from KV. A fresh entry is returned directly, a stale one
 * is returned while the refresh runs in the background, and a failed refresh
 * keeps serving the last good copy.
 */
export const fetchRecentTracks = createServerFn().handler(async () => {
  const apiKey = process.env.LASTFM_API_KEY ?? "";
  const { namespace, waitUntil } = await getCacheBindings();
  const live = LastFM.layerFromToken(apiKey).pipe(
    Layer.provideMerge(Layer.merge(FetchHttpClient.layer, KvCache.layerFrom(namespace, waitUntil))),
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
  const { namespace, waitUntil } = await getCacheBindings();
  const live = LastFM.layerFromToken(apiKey).pipe(
    Layer.provideMerge(Layer.merge(FetchHttpClient.layer, KvCache.layerFrom(namespace, waitUntil))),
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
