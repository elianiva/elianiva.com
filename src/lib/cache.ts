import { Context, Duration, Effect, Fiber, Layer } from "effect";
import type { KVNamespace } from "@cloudflare/workers-types";

type Entry = { value: unknown; at: number };

/** KV retention, independent of how long a value stays fresh. */
const RETENTION_SECONDS = 7 * 24 * 60 * 60;

/** Keeps background work alive after the response has been sent. */
export type CacheScheduler = (promise: Promise<unknown>) => void;

/**
 * Reads the `CACHE` KV binding and the request scheduler. Plain `vite dev`
 * runs on Node, where `cloudflare:workers` does not exist, so the import is
 * guarded.
 */
export async function getCacheBindings(): Promise<{
  namespace?: KVNamespace;
  waitUntil?: CacheScheduler;
}> {
  try {
    const { env, waitUntil } = await import("cloudflare:workers");
    return {
      namespace: (env as { CACHE?: KVNamespace }).CACHE,
      waitUntil: (promise) => waitUntil(promise),
    };
  } catch {
    return {};
  }
}

/**
 * Stale-while-revalidate cache over Cloudflare KV.
 *
 * A fresh entry is returned directly. A stale entry is returned immediately,
 * then refreshed in the background so the next visit sees the new value. When
 * no scheduler is available, the refresh happens inline instead. On any load
 * failure the last good value is kept, and the caller's fallback is used only
 * when nothing is cached. `getOrElse` therefore has an empty error channel.
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
  static layerFrom(ns: KVNamespace | undefined, schedule?: CacheScheduler) {
    const kvKey = (key: string) => `cache:${key}`;
    const warn = (message: string) => Effect.sync(() => console.warn(`[KvCache] ${message}`));
    // Outbound URLs can carry credentials, and these warnings are persisted.
    const redact = (text: string) => text.replace(/([?&]api_key=)[^&\s]+/gi, "$1[redacted]");

    return Layer.succeed(KvCache, {
      getOrElse: Effect.fn("KvCache.getOrElse")(function* <A, E, R>(options: {
        key: string;
        ttl: Duration.Input;
        fallback: A;
        load: Effect.Effect<A, E, R>;
      }) {
        const { key, ttl, fallback, load } = options;
        let stale: { value: A } | null = null;

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
          // Keep the stale value: if the refresh fails, old data is better
          // than an empty section.
          if (entry) stale = { value: entry.value as A };
        }

        type LoadResult =
          | { readonly tag: "ok"; readonly value: A }
          | { readonly tag: "err"; readonly error: unknown };
        // A synchronous throw inside `load` (e.g. reading a field off a
        // malformed API response) is an Effect defect, not a failure, and
        // `match` only handles failures — the defect would skip the fallback,
        // escape the server function, and surface in the browser as
        // `<queryKey> data is undefined`. Convert defects into failures so
        // they degrade to the fallback too; interruptions still propagate.
        const runLoad = () =>
          load.pipe(
            Effect.catchDefect((defect) => Effect.fail(defect)),
            Effect.match({
              onSuccess: (value) => ({ tag: "ok" as const, value }),
              onFailure: (error) => ({ tag: "err" as const, error }),
            }),
          );

        // Only successful loads are cached; a fallback must not poison the cache.
        // The entry outlives its freshness TTL so a failing upstream can still
        // serve the last good copy.
        const write = (value: A) =>
          Effect.gen(function* () {
            if (!ns) return;
            const ttlSec = Math.ceil(Duration.toMillis(ttl) / 1000);
            const retentionSec = Math.max(ttlSec, RETENTION_SECONDS);
            yield* Effect.tryPromise(() =>
              ns.put(kvKey(key), JSON.stringify({ value, at: Date.now() } satisfies Entry), {
                expirationTtl: retentionSec,
              }),
            ).pipe(Effect.catchCause(() => warn(`failed to put key: ${key}`)));
          });

        // Serve the last good copy now and refresh after the response. This
        // keeps cached reads independent of the upstream latency.
        if (stale && schedule) {
          const refresh = Effect.gen(function* () {
            const result = yield* runLoad();
            if (result.tag === "err") {
              yield* warn(
                `${key}: background refresh failed, keeping stale cache — ${redact(String(result.error))}`,
              );
              return;
            }
            yield* write(result.value);
          });
          const fiber = yield* Effect.forkDetach(refresh, { startImmediately: true });
          schedule(Effect.runPromise(Fiber.await(fiber).pipe(Effect.ignore)));
          return stale.value;
        }

        const result: LoadResult = yield* runLoad();
        if (result.tag === "err") {
          yield* warn(
            `${key}: load failed, using ${stale ? "stale cache" : "fallback"} — ${redact(String(result.error))}`,
          );
          return stale ? stale.value : fallback;
        }
        yield* write(result.value);

        return result.value;
      }),
    });
  }
}
