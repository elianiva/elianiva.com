import { expect, it } from "vite-plus/test";
import { Duration, Effect } from "effect";
import { KvCache } from "./cache";
import type { KVNamespace } from "@cloudflare/workers-types";

function fakeKv() {
  const store = new Map<string, string>();
  return {
    ns: {
      get: async (k: string) => store.get(k) ?? null,
      put: async (k: string, v: string) => void store.set(k, v),
      delete: async (k: string) => void store.delete(k),
    } as unknown as KVNamespace,
    store,
  };
}

function provideCache(ns: KVNamespace | undefined) {
  return Effect.provide(KvCache.layerFrom(ns));
}

it("miss → loads and caches the value", async () => {
  const { ns, store } = fakeKv();
  let loaded = false;
  await Effect.runPromise(
    Effect.gen(function* () {
      const cache = yield* KvCache;
      const val = yield* cache.getOrElse({
        key: "test-miss",
        ttl: Duration.minutes(5),
        fallback: "fallback",
        load: Effect.sync(() => {
          loaded = true;
          return "hello";
        }),
      });
      expect(val).toBe("hello");
    }).pipe(provideCache(ns)),
  );
  expect(loaded).toBe(true);
  const raw = store.get("cache:test-miss");
  expect(raw).toBeDefined();
  const entry = JSON.parse(raw!);
  expect(entry.value).toBe("hello");
});

it("hit → returns cached value without calling load", async () => {
  const { ns, store } = fakeKv();
  store.set("cache:test-hit", JSON.stringify({ value: "cached", at: Date.now() }));

  let loaded = false;
  const val = await Effect.runPromise(
    Effect.gen(function* () {
      const cache = yield* KvCache;
      return yield* cache.getOrElse({
        key: "test-hit",
        ttl: Duration.minutes(5),
        fallback: "fallback",
        load: Effect.sync(() => {
          loaded = true;
          return "fresh";
        }),
      });
    }).pipe(provideCache(ns)),
  );
  expect(loaded).toBe(false);
  expect(val).toBe("cached");
});

it("stale entry → evicts and reloads", async () => {
  const { ns, store } = fakeKv();
  store.set("cache:test-stale", JSON.stringify({ value: "stale", at: 0 }));

  let loaded = false;
  const val = await Effect.runPromise(
    Effect.gen(function* () {
      const cache = yield* KvCache;
      return yield* cache.getOrElse({
        key: "test-stale",
        ttl: Duration.millis(1),
        fallback: "fallback",
        load: Effect.sync(() => {
          loaded = true;
          return "fresh";
        }),
      });
    }).pipe(provideCache(ns)),
  );
  expect(loaded).toBe(true);
  expect(val).toBe("fresh");
});

it("load errors → returns fallback and does not cache", async () => {
  const { ns, store } = fakeKv();
  let loads = 0;

  const run = () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const cache = yield* KvCache;
        return yield* cache.getOrElse({
          key: "test-err",
          ttl: Duration.minutes(5),
          fallback: { safe: true },
          load: Effect.sync(() => {
            loads++;
          }).pipe(Effect.flatMap(() => Effect.fail(new Error("boom")))),
        });
      }).pipe(provideCache(ns)),
    );

  expect(await run()).toEqual({ safe: true });
  expect(loads).toBe(1);
  // Subsequent call retries — fallback is NOT cached
  expect(await run()).toEqual({ safe: true });
  expect(loads).toBe(2);
  expect(store.has("cache:test-err")).toBe(false);
});

it("corrupted JSON → treated as miss and reloads", async () => {
  const { ns, store } = fakeKv();
  store.set("cache:test-corrupt", "{ not json }");

  let loaded = false;
  const val = await Effect.runPromise(
    Effect.gen(function* () {
      const cache = yield* KvCache;
      return yield* cache.getOrElse({
        key: "test-corrupt",
        ttl: Duration.minutes(5),
        fallback: "fallback",
        load: Effect.sync(() => {
          loaded = true;
          return "recovered";
        }),
      });
    }).pipe(provideCache(ns)),
  );
  expect(loaded).toBe(true);
  expect(val).toBe("recovered");
});

it("no KV namespace → loads every time, still returns fallback on error", async () => {
  let loads = 0;
  const val = await Effect.runPromise(
    Effect.gen(function* () {
      const cache = yield* KvCache;
      return yield* cache.getOrElse({
        key: "test-nokv",
        ttl: Duration.minutes(5),
        fallback: "fallback",
        load: Effect.sync(() => {
          loads++;
          return "ok";
        }),
      });
    }).pipe(provideCache(undefined)),
  );
  expect(val).toBe("ok");
  expect(loads).toBe(1);
});
