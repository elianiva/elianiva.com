## 01 - Package Installation & Project Setup

### Goal

Install all dependencies needed for the migrated site and configure the project foundation.

### Dependencies to Add

**Content Layer (NEW - content-collections):**

- @content-collections/core — build-time content processing
- @content-collections/vite — Vite adapter for TanStack Start
- @content-collections/mdx — MDX compilation and React runtime

**Runtime / Framework:**

- animejs — for scroll/hero animations (same as source)
- force-graph — for notes graph visualization (same as source)
- fuse.js — for notes search (same as source)
- gray-matter — for parsing MDX frontmatter (same as source)
- octokit — for GitHub PR fetching (same as source)
- unified — for MDX rendering pipeline (same as source)
- remark-parse — for MDX parsing (same as source)
- remark-rehype — for MDX to HTML (same as source)
- remark-gfm — for GitHub-flavored markdown (same as source)
- rehype-raw — for raw HTML in MDX (same as source)
- rehype-stringify — for HTML output (same as source)
- @flowershow/remark-wiki-link — for wiki links in notes (same as source)
- react-markdown — for rendering MDX content in React (fallback)
- @fontsource/chonburi — heading font
- @fontsource/varela-round — body font
- @fontsource/ibm-plex-mono — mono font

**Dev Dependencies:**

- @types/glob — for glob types
- unplugin-icons — for icon components (with @iconify-json/ph)
- @vitejs/plugin-glsl — for shader imports (raw string)
- tsx — for running build scripts

### Configuration Changes

**vite.config.ts:**

```ts
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import contentCollections from "@content-collections/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    contentCollections(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    viteReact({
      babel: { plugins: ["babel-plugin-react-compiler"] },
    }),
  ],
});
```

**tsconfig.json:**

- Ensure path aliases work: #/_ -> ./src/_
- Add content-collections generated path: "content-collections": ["./.content-collections/generated"]
- Add types for unplugin-icons

**env.ts (t3-oss/env-core):**

- Add GH_TOKEN server env var for GitHub API
- Add NOTES_REPO, NOTES_OWNER, NOTES_BRANCH optional vars

**content-collections.ts** (project root):

- Define posts and projects collections
- Use compileMDX for MDX processing
- See plan 03 for full config

### Files to Move (unchanged)

- ../elianiva.com/src/shaders/bg.frag.glsl -> ./src/shaders/bg.frag.glsl
- ../elianiva.com/src/shaders/bg.vert.glsl -> ./src/shaders/bg.vert.glsl

### Files to Create

- ./src/lib/utils.ts — copy from source (slugify function), merge with existing cn()
- ./src/data/sites.ts — copy from source
- ./src/data/work-experience.ts — copy from source
- content-collections.ts — content layer config

### .gitignore Additions

```
.content-collections
```

### What This Replaces

- Astro's built-in MDX processing -> content-collections + compileMDX
- Astro's icon handling -> unplugin-icons with React
- Astro's env handling -> t3-oss/env-core
- Astro's content collections -> content-collections

### Verification

- pnpm dev starts without errors
- content-collections generates .content-collections/generated/
- All new imports resolve correctly
- Path aliases work
