# elianiva.com

My site. [Effect UI](https://ui.effect.website) for the frontend, [Panda CSS](https://panda-css.com) for styling, and an [Effect](https://effect.website) Worker for the GitHub and Last.fm data, deployed to Cloudflare with [Alchemy](https://alchemy.run).

```bash
pnpm install
pnpm dev        # vp dev
pnpm build      # prerenders every page into dist/ (needs typst for the CV)
pnpm test
pnpm deploy     # alchemy deploy
```

## Layout

- `app/`: the site. `pages/` has one Effect UI component per route, `ui/` the shared views, `queries/` the data reads, `content/` the posts and projects as Markdown, `og/` the share cards.
- `worker/`: the Api Worker (`/api/*`) with its KV cache and the GitHub and Last.fm services.
- `panda.config.ts`, `panda/`: tokens, global CSS and the prose styles.
- `alchemy.run.ts`: the two Workers and the KV namespace.
- `scripts/`: build-time static files (sitemap, feed, `robots.txt`, `llms.txt`, OG images) and the CV data.
