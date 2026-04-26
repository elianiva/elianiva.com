## 15 - Build, Prerender & Deploy

### Goal
Configure prerendering for static pages, build for Cloudflare deployment, and ensure everything works.

### Research Findings
- TanStack Start supports static prerendering via tanstackStart plugin config
- Cloudflare officially supports TanStack Start prerendering (Dec 2025)
- Requires @tanstack/react-start v1.138.0+
- autoStaticPathsDiscovery: true discovers all static routes automatically
- crawlLinks: true extracts links and prerenders linked pages
- Dynamic routes can be prerendered if linked from other pages
- Prerender config goes in vite.config.ts tanstackStart() plugin

### Prerender Configuration

**vite.config.ts:**
```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import contentCollections from "@content-collections/vite";
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig({
  plugins: [
    contentCollections(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        concurrency: 14,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    viteReact(),
  ],
})
```

### Prerender Strategy by Route

| Route | Strategy | Reason |
|-------|----------|--------|
| / | Prerender | Static home page |
| /posts | Prerender | Static list (content-collections data is build-time) |
| /posts/$slug | Prerender via crawlLinks | Linked from /posts, content-collections provides data at build time |
| /projects | Prerender | Static list |
| /projects/$slug | Prerender via crawlLinks | Linked from /projects |
| /notes | SSR | Dynamic (fetched from GitHub/local FS) |
| /notes/$slug | SSR | Dynamic |
| /api/* | API routes | Never prerendered |

Since content-collections processes posts/projects at build time, all post and project detail pages CAN be prerendered. The content is baked into the bundle.

### Build-Time Data Fetching
For notes (dynamic content), we have two options:
1. **Build-time**: Fetch all notes during build and include in bundle (requires rebuild for updates)
2. **Runtime**: Fetch from GitHub API at request time (always fresh)

Given the user's preference ("build time and bundled"), we should:
- Add a prebuild script that fetches notes and generates src/generated/notes.json
- Import this in the notes route
- Run script before build

```ts
// scripts/build-notes.ts
import { loadNotesFromGithub } from '../src/lib/notes'
import { writeFileSync } from 'fs'

const notes = await loadNotesFromGithub(process.env.GH_TOKEN!)
writeFileSync('./src/generated/notes.json', JSON.stringify(notes, null, 2))
```

### wrangler.jsonc Updates
```json
{
  "name": "elianiva-com",
  "compatibility_date": "2025-04-01",
  "assets": {
    "directory": "./dist"
  }
}
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "vite dev --port 3000",
    "prebuild": "tsx scripts/build-notes.ts",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "pnpm run build && wrangler deploy"
  }
}
```

### Performance Checks
- Canvas background capped at 30fps (already done)
- Images lazy loaded
- force-graph dynamically imported
- Fuse.js only on notes page
- Content-collections data is tree-shakeable

### What This Replaces
- Astro build pipeline -> Vite + content-collections + TanStack Start prerender
- Astro Cloudflare adapter -> @cloudflare/vite-plugin
- Astro prerender -> TanStack Start prerender config

### Verification
- [ ] Home page prerendered to static HTML
- [ ] /posts prerendered
- [ ] All post detail pages prerendered via crawlLinks
- [ ] /projects prerendered
- [ ] All project detail pages prerendered
- [ ] /notes SSR works
- [ ] Build succeeds
- [ ] Deploy to Cloudflare Pages succeeds
