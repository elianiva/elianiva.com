import { expect, it } from "vite-plus/test";
import { Duration, Effect } from "effect";
import { KvCache } from "./cache";
import type { KVNamespace } from "@cloudflare/workers-types";

function fakeKv() {
  const store = new Map<string, string>();
  const puts: { key: string; expirationTtl?: number | undefined }[] = [];
  return {
    ns: {
      get: async (k: string) => store.get(k) ?? null,
      put: async (k: string, v: string, options?: { expirationTtl?: number }) => {
        store.set(k, v);
        puts.push({ key: k, expirationTtl: options?.expirationTtl });
      },
      delete: async (k: string) => void store.delete(k),
    } as unknown as KVNamespace,
    store,
    puts,
  };
}

function provideCache(ns: KVNamespace | undefined, schedule?: (promise: Promise<unknown>) => void) {
  return Effect.provide(KvCache.layerFrom(ns, schedule));
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
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

it("hit → returns cached value without calling load or scheduling", async () => {
  const { ns, store } = fakeKv();
  store.set("cache:test-hit", JSON.stringify({ value: "cached", at: Date.now() }));
  const scheduled: Promise<unknown>[] = [];

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
    }).pipe(provideCache(ns, (promise) => scheduled.push(promise))),
  );
  expect(loaded).toBe(false);
  expect(val).toBe("cached");
  expect(scheduled).toHaveLength(0);
});

it("stale entry → reloads and replaces the cached value", async () => {
  const { ns, store, puts } = fakeKv();
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
  expect(JSON.parse(store.get("cache:test-stale")!).value).toBe("fresh");
  // A stale entry must outlive its freshness window, otherwise an upstream
  // outage wipes the last good copy before it can be served.
  expect(puts.at(-1)?.expirationTtl).toBeGreaterThan(5 * 60);
});

it("stale entry → serves stale now and refreshes in the background", async () => {
  const { ns, store } = fakeKv();
  store.set("cache:test-swr", JSON.stringify({ value: "stale", at: 0 }));
  const gate = deferred<string>();
  const scheduled: Promise<unknown>[] = [];
  let loads = 0;

  const value = await Effect.runPromise(
    Effect.gen(function* () {
      const cache = yield* KvCache;
      return yield* cache.getOrElse({
        key: "test-swr",
        ttl: Duration.minutes(5),
        fallback: "fallback",
        load: Effect.promise(() => {
          loads++;
          return gate.promise;
        }),
      });
    }).pipe(provideCache(ns, (promise) => scheduled.push(promise))),
  );

  expect(value).toBe("stale");
  expect(loads).toBe(1);
  expect(scheduled).toHaveLength(1);
  // The load is still blocked, so the response did not wait for it.
  expect(JSON.parse(store.get("cache:test-swr")!).value).toBe("stale");

  gate.resolve("fresh");
  await scheduled[0];
  expect(JSON.parse(store.get("cache:test-swr")!).value).toBe("fresh");
});

it("failed background refresh → keeps the stale value", async () => {
  const { ns, store } = fakeKv();
  const stale = JSON.stringify({ value: "last-good", at: 0 });
  store.set("cache:test-swr-err", stale);
  const scheduled: Promise<unknown>[] = [];

  const value = await Effect.runPromise(
    Effect.gen(function* () {
      const cache = yield* KvCache;
      return yield* cache.getOrElse({
        key: "test-swr-err",
        ttl: Duration.minutes(5),
        fallback: "fallback",
        load: Effect.fail(new Error("boom")),
      });
    }).pipe(provideCache(ns, (promise) => scheduled.push(promise))),
  );

  expect(value).toBe("last-good");
  expect(scheduled).toHaveLength(1);
  await scheduled[0];
  expect(store.get("cache:test-swr-err")).toBe(stale);
});

it("failed refresh → serves the stale value and keeps it", async () => {
  const { ns, store } = fakeKv();
  const stale = JSON.stringify({ value: "last-good", at: 0 });
  store.set("cache:test-stale-err", stale);
  let loads = 0;

  const run = () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const cache = yield* KvCache;
        return yield* cache.getOrElse({
          key: "test-stale-err",
          ttl: Duration.minutes(5),
          fallback: "fallback",
          load: Effect.sync(() => {
            loads++;
          }).pipe(Effect.flatMap(() => Effect.fail(new Error("boom")))),
        });
      }).pipe(provideCache(ns)),
    );

  expect(await run()).toBe("last-good");
  expect(loads).toBe(1);
  // The old copy stays for the next visit to try again.
  expect(store.get("cache:test-stale-err")).toBe(stale);
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

it("load throws synchronously → returns fallback and does not cache", async () => {
  const { ns, store } = fakeKv();
  let loads = 0;

  const run = () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const cache = yield* KvCache;
        return yield* cache.getOrElse({
          key: "test-defect",
          ttl: Duration.minutes(5),
          fallback: "fallback",
          // A sync throw inside `load` is an Effect defect (not a failure) —
          // e.g. reading a field off a malformed API response. It must still
          // degrade to the fallback instead of escaping the server function.
          load: Effect.sync(() => {
            loads++;
            throw new TypeError("Cannot read properties of undefined");
          }),
        });
      }).pipe(provideCache(ns)),
    );

  expect(await run()).toBe("fallback");
  expect(loads).toBe(1);
  // Subsequent call retries — fallback is NOT cached
  expect(await run()).toBe("fallback");
  expect(loads).toBe(2);
  expect(store.has("cache:test-defect")).toBe(false);
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
