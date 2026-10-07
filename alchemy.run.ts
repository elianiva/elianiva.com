import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Config } from "effect";

/**
 * Static SPA shell + server functions for the secret-backed data.
 *
 * TanStack Start's `spa.enabled` + `prerender.crawlLinks` in
 * `vite.config.ts` emits one static HTML file per route (dynamic slugs
 * included) plus the `_shell.html` fallback and `sitemap.xml` into
 * `dist/client`. `robots.txt`, `rss.xml`, and the OG images are emitted
 * alongside by `scripts/build-static-assets.ts` (`pnpm build` runs it after
 * `vp build`).
 *
 * Posts/projects/uses/neighbours stay fully static. Home GitHub + `/music`
 * prerender as shells — their queries run in the browser after hydration and
 * call server functions (`/_serverFn/*`, allow-listed below so they reach the
 * Worker instead of the static assets) that hold `GH_TOKEN` /
 * `LASTFM_API_KEY` as secrets. The browser never sees the tokens.
 *
 * `pnpm build` needs no secrets; `alchemy deploy` reads `GH_TOKEN` /
 * `LASTFM_API_KEY` from the deploy environment (see `deploy.yml`) and binds
 * them as `secret_text` on the Worker.
 */
class Website extends Cloudflare.Website.Vite<Website>()("elianiva-com", {
  compatibility: {
    flags: ["nodejs_compat"],
  },
  assets: {
    runWorkerFirst: ["/_serverFn/*"],
    notFoundHandling: "single-page-application",
  },
  env: {
    GH_TOKEN: Config.Redacted("GH_TOKEN"),
    LASTFM_API_KEY: Config.Redacted("LASTFM_API_KEY"),
  },
  dev: {
    port: 3000,
    strictPort: true,
  },
  domain: "elianiva.com",
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
    const website = yield* Website;

    return {
      url: website.url,
    };
  }),
);
