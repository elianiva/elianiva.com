import { FetchHttpClient } from "effect/http";
import { Layer, ManagedRuntime } from "effect";
import { KvCache } from "./cache";
import { GitHubService } from "~/features/github/lib/github.service";
import { LastFM } from "~/features/music/lib/lastfm.service";

/**
 * Client runtime for the Effect services. There is no server and no KV
 * namespace anymore, so the cache runs without a backing store (every load
 * executes, failures still degrade to the caller's fallback) and
 * react-query's `staleTime` owns in-session dedup instead.
 */
const infra = Layer.merge(FetchHttpClient.layer, KvCache.layerFrom(undefined));

const AppLayer = Layer.orDie(
  Layer.mergeAll(
    GitHubService.layer.pipe(Layer.provideMerge(infra)),
    LastFM.layer.pipe(Layer.provideMerge(infra)),
  ),
);

export const runtime = ManagedRuntime.make(AppLayer);
