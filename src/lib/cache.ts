import { Context, Duration, Effect, Layer } from "effect";
import type { KVNamespace } from "@cloudflare/workers-types";

type Entry = { value: unknown; at: number };

/**
 * Read-through cache over Cloudflare KV.
 *
 * The site-wide policy for external data lives here: on any load or storage
 * failure, degrade to the caller's fallback (an empty section), never fail.
 * `getOrElse` therefore has an empty error channel. The KV namespace is
 * injected via `layerFrom` so this module stays testable outside workerd.
 */
export class KvCache extends Context.Service<
  KvCache,
  {
    readonly getOrElse: <A, E, R>(options: {
      readonly key: string;
      readonly ttl: Duration.Input;
      readonly fallback: A;
      readonly load: Effect.Effect<A, E, R>;
    }) => Effect.Effect<A, never, R>;
  }
>()("KvCache") {
  static layerFrom(ns: KVNamespace | undefined) {
    const kvKey = (key: string) => `cache:${key}`;
    const warn = (message: string) => Effect.sync(() => console.warn(`[KvCache] ${message}`));

    return Layer.succeed(KvCache, {
      getOrElse: Effect.fn("KvCache.getOrElse")(function* <A, E, R>(options: {
        key: string;
        ttl: Duration.Input;
        fallback: A;
        load: Effect.Effect<A, E, R>;
      }) {
        const { key, ttl, fallback, load } = options;

        if (ns) {
          const raw = yield* Effect.tryPromise(() => ns.get(kvKey(key))).pipe(
            Effect.orElseSucceed(() => null),
          );
          // A corrupted entry is treated as a miss, not a crash.
          const entry =
            raw === null
              ? null
              : yield* Effect.try(() => JSON.parse(raw) as Entry).pipe(
                  Effect.orElseSucceed(() => null),
                );
          if (entry && Date.now() - entry.at < Duration.toMillis(ttl)) {
            return entry.value as A;
          }
          if (raw !== null) {
            yield* Effect.tryPromise(() => ns.delete(kvKey(key))).pipe(
              Effect.catchCause(() => warn(`failed to delete key: ${key}`)),
            );
          }
        }

        type LoadResult =
          | { readonly tag: "ok"; readonly value: A }
          | { readonly tag: "err"; readonly error: unknown };
        const result: LoadResult = yield* load.pipe(
          Effect.match({
            onSuccess: (value) => ({ tag: "ok" as const, value }),
            onFailure: (error) => ({ tag: "err" as const, error }),
          }),
        );
        if (result.tag === "err") {
          yield* warn(`${key}: load failed, using fallback — ${String(result.error)}`);
          return fallback;
        }
        const value = result.value;

        // Only successful loads are cached; a fallback must not poison the cache.
        if (ns) {
          const ttlSec = Math.max(Math.ceil(Duration.toMillis(ttl) / 1000), 60);
          yield* Effect.tryPromise(() =>
            ns.put(kvKey(key), JSON.stringify({ value, at: Date.now() } satisfies Entry), {
              expirationTtl: Math.min(ttlSec, 604_800),
            }),
          ).pipe(Effect.catchCause(() => warn(`failed to put key: ${key}`)));
        }

        return value;
      }),
    });
  }
}
