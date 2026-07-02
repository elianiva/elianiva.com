import { Context, Data, Duration, Effect, Layer } from "effect";
import { env } from "cloudflare:workers";

type Entry = { value: unknown; at: number };

export class KvCacheError extends Data.TaggedError("KvCacheError")<{
  readonly key: string;
  readonly cause: string;
}> {}

export class KvCache extends Context.Service<
  KvCache,
  {
    readonly getOrSet: <A, E, R>(
      key: string,
      ttl: Duration.Input,
      load: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E | KvCacheError, R>;
    readonly invalidate: (key: string) => Effect.Effect<void, KvCacheError>;
  }
>()("KvCache") {
  static readonly layer = Layer.effect(
    KvCache,
    Effect.sync(() => {
      const ns = env.CACHE as KVNamespace | undefined;

      const kvKey = (key: string) => `cache:${key}`;

      const getOrSet = <A, E, R>(
        key: string,
        ttl: Duration.Input,
        load: Effect.Effect<A, E, R>,
      ): Effect.Effect<A, E | KvCacheError, R> =>
        Effect.gen(function* () {
          if (ns) {
            const raw = yield* Effect.tryPromise({
              try: () => ns.get(kvKey(key)),
              catch: (e) => new KvCacheError({ key, cause: String(e) }),
            });
            if (raw) {
              const entry = JSON.parse(raw) as Entry;
              const elapsed = Date.now() - entry.at;
              if (elapsed < Duration.toMillis(ttl)) return entry.value as A;
              yield* Effect.tryPromise(() => ns.delete(kvKey(key))).pipe(
              Effect.catchAll(() => Effect.sync(() => console.error(`[KvCache] failed to delete key: ${key}`))),
              );
            }
          }

          const value = yield* load;
          if (ns) {
            const ttlSec = Math.max(Math.ceil(Duration.toMillis(ttl) / 1000), 60);
            yield* Effect.tryPromise(() =>
              ns.put(kvKey(key), JSON.stringify({ value, at: Date.now() } satisfies Entry), {
                expirationTtl: Math.min(ttlSec, 604_800),
              }),
            ).pipe(
              Effect.catchAll(() => Effect.sync(() => console.error(`[KvCache] failed to put key: ${key}`))),
            );
          }
          return value;
        });

      const invalidate = (key: string): Effect.Effect<void, KvCacheError> =>
        Effect.gen(function* () {
          if (ns) {
            yield* Effect.tryPromise({
              try: () => ns.delete(kvKey(key)),
              catch: (e) => new KvCacheError({ key, cause: String(e) }),
            });
          }
        });

      return { getOrSet, invalidate };
    }),
  );
}
