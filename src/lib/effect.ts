import { FetchHttpClient } from "effect/unstable/http"
import { Layer, ManagedRuntime } from "effect"
import { KvCache } from "./cache"
import { GitHub } from "~/features/github/lib/github"
import { LastFM } from "~/features/music/lib/lastfm"
import { Tokscale } from "~/features/ai/lib/tokscale"
import { Notes } from "~/features/notes/lib/notes"

const AppLayer = Layer.mergeAll(
  FetchHttpClient.layer,
  KvCache.layer,
  GitHub.layer,
  LastFM.layer,
  Tokscale.layer,
  Notes.layer,
)

export const AppRuntime = ManagedRuntime.make(AppLayer)
