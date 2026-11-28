import { Context, Data, Effect, Layer, Schema } from "effect";
import { HttpClient } from "effect/http";

/** A read that failed: the network, a status that is not 2xx, or a body that is not JSON. */
export class JsonApiError extends Data.TaggedError("JsonApiError")<{
  readonly url: string;
  readonly reason: string;
}> {}

/**
 * All of the queries' I/O goes through this service, so the queries never
 * name where `/api/*` is answered. The browser reads it over HTTP
 * (`JsonApi.layerHttp`). The prerender runs the Api Worker's routes
 * in-process (`app/queries/server.ts`).
 */
export class JsonApi extends Context.Service<
  JsonApi,
  { readonly get: (url: string) => Effect.Effect<unknown, JsonApiError> }
>()("app/JsonApi") {
  /** `fetch` over the platform's `HttpClient`. Relative URLs resolve against the page. */
  static readonly layerHttp = Layer.effect(
    JsonApi,
    Effect.gen(function* () {
      const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk);
      return JsonApi.of({
        get: (url) =>
          client.get(url).pipe(
            Effect.flatMap((response) => response.json),
            Effect.mapError((cause) => new JsonApiError({ url, reason: String(cause) })),
          ),
      });
    }),
  );
}

/**
 * Reads `url` and decodes the body with `schema`. Anything that goes wrong,
 * from the network to an unexpected shape, gives `fallback`: the Worker's own
 * routes degrade to empty data, and so do these reads.
 */
export const readOr = <S extends Schema.Top & { readonly DecodingServices: never }>(
  api: JsonApi["Service"],
  url: string,
  schema: S,
  fallback: S["Type"],
): Effect.Effect<S["Type"]> =>
  api.get(url).pipe(
    Effect.flatMap((body) => Schema.decodeUnknownEffect(schema)(body)),
    Effect.orElseSucceed(() => fallback),
  );
