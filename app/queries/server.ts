import { Effect, Layer } from "effect";
import { JsonApi, JsonApiError } from "./JsonApi";

/**
 * `JsonApi` for the build's prerender: `/api/*` is answered by the Api
 * Worker's own routes, in this process (`worker/local.ts`), with `GH_TOKEN`
 * and `LASTFM_API_KEY` from `process.env`. A missing token gives the same
 * empty data the deployed Worker gives. Import this from `entry.server.ts`
 * only: it is the one place the Worker's code is reachable.
 */
export const serverLayer = Layer.succeed(
  JsonApi,
  JsonApi.of({
    get: (url) =>
      Effect.tryPromise({
        try: async () => {
          const { localApi } = await import("../../worker/local");
          const response = await localApi(new Request(`http://localhost${url}`));
          if (!response.ok) throw new Error(`${url} answered ${response.status}`);
          return (await response.json()) as unknown;
        },
        catch: (cause) => new JsonApiError({ url, reason: String(cause) }),
      }),
  }),
);
