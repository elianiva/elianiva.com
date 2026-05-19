import { Context, Data, Duration, Effect, Layer } from "effect"
import { env } from "cloudflare:workers"

type Entry = { value: unknown; at: number }

export class KvCacheError extends Data.TaggedError("KvCacheError")<{
  readonly key: string
  readonly cause: string
}> {}

export class KvCache extends Context.Service<KvCache, {
  readonly getOrSet: <A>(
    key: string,
    ttl: Duration.DurationInput,
    load: Effect.Effect<A>,
  ) => Effect.Effect<A, KvCacheError>
  readonly invalidate: (key: string) => Effect.Effect<void, KvCacheError>
}>()("KvCache") {
  static readonly layer = Layer.effect(
    KvCache,
    Effect.sync(() => {
      const ns = env.CACHE as KVNamespace | undefined

      const kvKey = (key: string) => `cache:${key}`

      const getOrSet = <A>(key: string, ttl: Duration.DurationInput, load: Effect.Effect<A>): Effect.Effect<A, KvCacheError> =>
        Effect.gen(function*() {
          if (ns) {
            const raw = yield* Effect.tryPromise({
              try: () => ns.get(kvKey(key)),
              catch: (e) => new KvCacheError({ key, cause: String(e) }),
            })
            if (raw) {
              const entry = JSON.parse(raw) as Entry
              const elapsed = Date.now() - entry.at
              const ttlMs = Duration.toMillis(typeof ttl === "number" ? Duration.millis(ttl) : Duration.decode(ttl))
              if (elapsed < ttlMs) return entry.value as A
              Effect.fork(Effect.tryPromise(() => ns.delete(kvKey(key))))
            }
          }

          const value = yield* load
          if (ns) {
            const ttlMs = Duration.toMillis(typeof ttl === "number" ? Duration.millis(ttl) : Duration.decode(ttl))
            const ttlSec = Math.max(Math.ceil(ttlMs / 1000), 60)
            Effect.fork(Effect.tryPromise(() =>
              ns.put(kvKey(key), JSON.stringify({ value, at: Date.now() } satisfies Entry), {
                expirationTtl: Math.min(ttlSec, 604_800),
              }),
            ))
          }
          return value
        })

      const invalidate = (key: string): Effect.Effect<void, KvCacheError> =>
        Effect.gen(function*() {
          if (ns) {
            yield* Effect.tryPromise({
              try: () => ns.delete(kvKey(key)),
              catch: (e) => new KvCacheError({ key, cause: String(e) }),
            })
          }
        })

      return { getOrSet, invalidate }
    }),
  )
}
