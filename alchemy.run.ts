import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";
import Api from "./worker/worker";

/**
 * Two Workers.
 *
 * `Website` serves the prerendered site from static assets. Effect UI's
 * `HtmlServerVite` plugin writes one HTML file per page into `dist`, plus
 * `404.html`; `emitStaticAssets` adds `sitemap.xml`, `robots.txt`, `rss.xml`,
 * and the OG images. Its only code is the `/api/*` forward to `Api`.
 *
 * `Api` (`worker/worker.ts`) holds `GH_TOKEN` / `LASTFM_API_KEY` as secrets and
 * answers the GitHub and Last.fm reads from the `Cache` KV namespace. A visit
 * reads the last good copy immediately and revalidates stale entries in the
 * background, so an upstream outage never blocks the page.
 *
 * `pnpm build` needs no secrets; `alchemy deploy` reads them from the deploy
 * environment (see `deploy.yml`).
 */
class Website extends Cloudflare.Website.StaticSite<Website>()(
  "elianiva-com",
  Effect.gen(function* () {
    // The data API is its own Worker; this one forwards `/api/*` to it.
    const api = yield* Api;

    return {
      // `vp build` prerenders every page into `dist`; `main` only forwards `/api/*`.
      command: "pnpm exec vp build",
      outdir: "dist",
      main: "app/worker.ts",
      assets: {
        runWorkerFirst: ["/api/*"],
        notFoundHandling: "404-page",
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
