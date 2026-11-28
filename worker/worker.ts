import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { HttpRouter } from "effect/http";
import { apiRoutes } from "./app";

/**
 * The site's data API: GitHub and Last.fm reads behind a stale-while-revalidate
 * KV cache. The secrets are bound here and nowhere else, so the browser and the
 * static site Worker never see them.
 */
export default class Api extends Cloudflare.Worker<Api>()(
  "elianiva-com-api",
  { main: import.meta.url },
  Effect.gen(function* () {
    const cache = yield* Cloudflare.KV.Namespace("Cache", { title: "elianiva-com-cache" });
    const kv = yield* Cloudflare.KV.ReadWriteNamespace(cache);
    // Config is resolved in Construction so Alchemy binds it as `secret_text`.
    const githubToken = yield* Config.Redacted("GH_TOKEN");
    const lastfmKey = yield* Config.Redacted("LASTFM_API_KEY");

    const runtime = Effect.gen(function* () {
      const namespace = yield* kv.raw;
      // The context belongs to the request, so it is read here and not in Construction, which
      // runs once per isolate: its `waitUntil` throws outside the request that created it.
      const execution = yield* Cloudflare.WorkerExecutionContext;
      return {
        githubToken: Redacted.value(githubToken),
        lastfmKey: Redacted.value(lastfmKey),
        kv: namespace,
        schedule: (promise: Promise<unknown>) => execution.raw.waitUntil(promise),
      };
    });

    return { fetch: yield* HttpRouter.toHttpEffect(apiRoutes(runtime)) };
  }).pipe(Effect.provide(Cloudflare.KV.ReadWriteNamespaceBinding)),
) {}
