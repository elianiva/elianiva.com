import { FetchHttpClient } from "effect/unstable/http";
import { Layer, ManagedRuntime } from "effect";
import type { KVNamespace } from "@cloudflare/workers-types";
import { env } from "cloudflare:workers";
import { KvCache } from "./cache";
import { GitHubService } from "~/features/github/lib/github.service";
import { LastFM } from "~/features/music/lib/lastfm.service";
import { Tokscale } from "~/features/ai/lib/tokscale.service";

export function makeInfra(ns: KVNamespace | undefined) {
  return Layer.merge(FetchHttpClient.layer, KvCache.layerFrom(ns));
}

export function makeAppLayer(ns: KVNamespace | undefined) {
  const infra = makeInfra(ns);
  return Layer.orDie(
    Layer.mergeAll(
      GitHubService.layer.pipe(Layer.provideMerge(infra)),
      LastFM.layer.pipe(Layer.provideMerge(infra)),
      Tokscale.layer.pipe(Layer.provideMerge(infra)),
    ),
  );
}

type EnvWithCache = { CACHE?: KVNamespace };

function getKvNamespace(): KVNamespace | undefined {
  try {
    const maybe = (env as unknown as EnvWithCache).CACHE;
    return maybe;
  } catch {
    return undefined;
  }
}

export const runtime = ManagedRuntime.make(makeAppLayer(getKvNamespace()));

export function makeRuntime(ns: KVNamespace | undefined) {
  return ManagedRuntime.make(makeAppLayer(ns));
}
