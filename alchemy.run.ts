import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";
import Api from "./src/api/worker";

/**
 * Two Workers.
 *
 * `Website` serves the prerendered site from static assets. TanStack Start's
 * `spa.enabled` + `prerender.crawlLinks` in `vite.config.ts` emit one HTML file
 * per route plus the `_shell.html` fallback and `sitemap.xml` into
 * `dist/client`; `emitStaticAssets` adds `robots.txt`, `rss.xml`, and the OG
 * images. Its only code is the `/api/*` forward to `Api`.
 *
 * `Api` (`src/api/worker.ts`) holds `GH_TOKEN` / `LASTFM_API_KEY` as secrets and
 * answers the GitHub and Last.fm reads from the `Cache` KV namespace. A visit
 * reads the last good copy immediately and revalidates stale entries in the
 * background, so an upstream outage never blocks the page.
 *
 * `pnpm build` needs no secrets; `alchemy deploy` reads them from the deploy
 * environment (see `deploy.yml`).
 */
class Website extends Cloudflare.Website.Vite<Website>()(
  "elianiva-com",
  Effect.gen(function* () {
    // The data API is its own Worker; this one forwards `/api/*` to it.
    const api = yield* Api;

    return {
      compatibility: { flags: ["nodejs_compat"] },
      assets: {
        runWorkerFirst: ["/api/*"],
        notFoundHandling: "single-page-application",
      },
      env: { API: api },
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
    };
  }),
) {}

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
