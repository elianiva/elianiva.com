import { FetchHttpClient } from "effect/unstable/http";
import { Layer, ManagedRuntime } from "effect";
import type { KVNamespace } from "@cloudflare/workers-types";
import { env } from "cloudflare:workers";
import { KvCache } from "./cache";
import { GitHubService } from "~/features/github/lib/github.service";
import { LastFM } from "~/features/music/lib/lastfm.service";
import { Tokscale } from "~/features/ai/lib/tokscale.service";

const infra = Layer.merge(
  FetchHttpClient.layer,
  KvCache.layerFrom(env.CACHE as KVNamespace | undefined),
);

const AppLayer = Layer.orDie(
  Layer.mergeAll(
    GitHubService.layer.pipe(Layer.provideMerge(infra)),
    LastFM.layer.pipe(Layer.provideMerge(infra)),
    Tokscale.layer.pipe(Layer.provideMerge(infra)),
  ),
);

export const runtime = ManagedRuntime.make(AppLayer);
