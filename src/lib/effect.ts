import { FetchHttpClient } from "effect/unstable/http"
import { Layer, ManagedRuntime } from "effect"

const AppLayer = Layer.mergeAll(
  FetchHttpClient.layer,
)

export const AppRuntime = ManagedRuntime.make(AppLayer)
