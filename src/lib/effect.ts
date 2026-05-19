import { FetchHttpClient } from "effect/unstable/http"
import { Layer, ManagedRuntime } from "effect"
import { KvCache } from "./cache"
import { GitHub } from "~/features/github/lib/github.service"
import { LastFM } from "~/features/music/lib/lastfm.service"
import { Tokscale } from "~/features/ai/lib/tokscale.service"
import { Notes } from "~/features/notes/lib/notes"

// Infrastructure: provides HttpClient + KvCache
const infra = Layer.merge(FetchHttpClient.layer, KvCache.layer)

// Each service layer gets its requirements fed by infra
const AppLayer = Layer.orDie(Layer.mergeAll(
  GitHub.layer.pipe(Layer.provideMerge(infra)),
  LastFM.layer.pipe(Layer.provideMerge(infra)),
  Tokscale.layer.pipe(Layer.provideMerge(infra)),
  Notes.layer,
))

export const AppRuntime = ManagedRuntime.make(AppLayer)
