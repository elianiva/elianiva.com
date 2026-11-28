import { Effect, Layer } from "effect";
import { browserLayer } from "../queries/browser";
import { JsonApi, type JsonApiError } from "../queries/JsonApi";

const inFlight = new Map<string, Effect.Effect<unknown, JsonApiError>>();

/**
 * Every island is a root with its own query cache, so two islands reading the
 * same URL (the status tile and the push tag both read GitHub) would fetch it
 * twice. This shares one request while it is in flight.
 */
export const sharedApi = Layer.effect(
  JsonApi,
  Effect.gen(function* () {
    const api = yield* JsonApi;
    return JsonApi.of({
      get: (url) => {
        let shared = inFlight.get(url);
        if (!shared) {
          shared = Effect.runSync(
            Effect.cached(
              api.get(url).pipe(Effect.ensuring(Effect.sync(() => inFlight.delete(url)))),
            ),
          );
          inFlight.set(url, shared);
        }
        return shared;
      },
    });
  }),
).pipe(Layer.provide(browserLayer));
