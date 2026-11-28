import { Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { JsonApi } from "./JsonApi";

/** `JsonApi` for the browser: `fetch` against `/api/*` and GitHub. Provide it in `entry.client.ts`. */
export const browserLayer = JsonApi.layerHttp.pipe(Layer.provide(FetchHttpClient.layer));
