import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { adopt } from "alchemy/AdoptPolicy";

const Cache = Cloudflare.KV.Namespace("CACHE", {
  title: "CACHE",
}).pipe(adopt(true));

const Photos = Cloudflare.R2.Bucket("Photography", {
  name: "elianiva-photography",
}).pipe(adopt(true));

class Website extends Cloudflare.Website.Vite<Website>()("elianiva-com", {
  compatibility: {
    flags: ["nodejs_compat"],
  },
  viteEnvironments: {
    entry: "ssr",
    children: ["rsc"],
  },
  env: {
    CACHE: Cache,
    PHOTOS: Photos,
    GH_TOKEN: Config.redacted("GH_TOKEN"),
    LASTFM_API_KEY: Config.redacted("LASTFM_API_KEY"),

  },
  assets: {
    runWorkerFirst: true,
  },
  dev: {
    port: 3000,
    strictPort: true,
  },
  domain: ["elianiva.com"],
  observability: {
    enabled: true,
    headSamplingRate: 0.1,
    logs: { enabled: true, headSamplingRate: 0.1, persist: true, invocationLogs: true },
    traces: { enabled: true, persist: true, headSamplingRate: 0.1 },
  },
}) {}

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>;

export default Alchemy.Stack(
  "elianiva-com",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const cache = yield* Cache;
    const photos = yield* Photos;
    const website = yield* Website;

    return {
      url: website.url,
      cacheNamespace: cache.namespaceId,
      photosBucket: photos.bucketName,
    };
  }),
);
