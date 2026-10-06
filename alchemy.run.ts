import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

/**
 * Fully static site via TanStack Start's own prerendering: `spa.enabled`
 * + `prerender.crawlLinks` in `vite.config.ts` emits one static HTML file
 * per route (dynamic slugs included) plus the `_shell.html` fallback and
 * `sitemap.xml` into `dist/client`. `robots.txt`, `rss.xml`, and the OG
 * images are emitted alongside by `scripts/build-static-assets.ts`
 * (`pnpm build` runs it after `vp build`).
 *
 * There is no SSR at request time: alchemy uploads `dist/client` as plain
 * static assets on a Worker with no entry. `notFoundHandling:
 * "single-page-application"` falls back to the prerendered root for
 * unknown paths (Cloudflare serves `/index.html`), where the client
 * router renders the 404 page — deep links to real pages resolve to
 * their prerendered files directly.
 *
 * GitHub / Last.fm data is fetched from the browser. The client bundle
 * carries no secrets: without `VITE_GH_TOKEN` / `VITE_LASTFM_API_KEY` the
 * sections render their empty states (see `src/lib/env.ts`).
 */
class Website extends Cloudflare.Website.Vite<Website>()("elianiva-com", {
  compatibility: {
    flags: ["nodejs_compat"],
  },
  assets: {
    runWorkerFirst: false,
    notFoundHandling: "single-page-application",
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
