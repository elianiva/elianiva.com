import { FetchHttpClient } from "effect/unstable/http";
import { Layer, ManagedRuntime } from "effect";
import { KvCache } from "./cache";
import { GitHubService } from "~/features/github/lib/github.service";
import { LastFM } from "~/features/music/lib/lastfm.service";
import { Tokscale } from "~/features/ai/lib/tokscale.service";
import { Notes } from "~/features/notes/lib/notes";

const infra = Layer.merge(FetchHttpClient.layer, KvCache.layer);

const AppLayer = Layer.orDie(
  Layer.mergeAll(
    GitHubService.layer.pipe(Layer.provideMerge(infra)),
    LastFM.layer.pipe(Layer.provideMerge(infra)),
    Tokscale.layer.pipe(Layer.provideMerge(infra)),
    Notes.layer,
  ),
);

export const runtime = ManagedRuntime.make(AppLayer);
