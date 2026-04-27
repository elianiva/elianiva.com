## 03 - Content Layer with content-collections

### Goal

Use @content-collections/core + @content-collections/vite + @content-collections/mdx as the content layer, replacing Astro's content collections.

### Research Findings

- content-collections is officially supported by TanStack Start (v1.121.0+)
- Uses @content-collections/vite adapter (NOT the vinxi adapter)
- Processes markdown/MDX at build time
- Provides type-safe access via generated imports
- Supports MDX compilation via @content-collections/mdx with compileMDX()
- Runtime rendering via MDXContent component from @content-collections/mdx/react
- Supports remarkPlugins and rehypePlugins in compileMDX options

### Dependencies

- @content-collections/core
- @content-collections/vite
- @content-collections/mdx
- zod (for schema validation)

### Configuration

**vite.config.ts:**

```ts
import contentCollections from "@content-collections/vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    contentCollections(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
```

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "paths": {
      "#/*": ["./src/*"],
      "content-collections": ["./.content-collections/generated"]
    }
  }
}
```

**content-collections.ts** (project root):

```ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "src/content/posts",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm, wikiLinkPlugin],
    });
    return {
      ...document,
      slug: document._meta.path,
      mdx,
    };
  },
});

const projects = defineCollection({
  name: "projects",
  directory: "src/content/projects",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    demo: z.string().nullable(),
    source: z.string(),
    type: z.enum(["personal", "work"]),
    featured: z.boolean(),
    stack: z.array(z.tuple([z.string(), z.string()])),
    hasImage: z.boolean().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    return {
      ...document,
      slug: document._meta.path,
      mdx,
    };
  },
});

export default defineConfig({
  collections: [posts, projects],
});
```

### Usage in Routes

```ts
import { allPosts, allProjects } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";

// In a route component:
const post = allPosts.find(p => p.slug === slug);
return <MDXContent code={post.mdx} components={{ Update, Greentext, Quiz }} />;
```

### Files to Move

- ../elianiva.com/src/content/posts/_.mdx -> ./src/content/posts/_.mdx (all 48 posts)
- ../elianiva.com/src/content/projects/_.mdx -> ./src/content/projects/_.mdx (all 33 projects)

### MDX Components

Pass custom components to MDXContent:

- Update -> ./src/components/Update.tsx
- Greentext -> ./src/components/Greentext.tsx
- Quiz -> ./src/components/Quiz.tsx
- RegexHighlighter -> ./src/components/RegexHighlighter.tsx
- TermPopover -> ./src/components/TermPopover.tsx

### What This Replaces

- Astro's getCollection("posts") -> import { allPosts } from "content-collections"
- Astro's getCollection("projects") -> import { allProjects } from "content-collections"
- Astro's render() -> MDXContent component with compileMDX output
- Astro's content.config.ts -> content-collections.ts

### Notes on MDX

- content-collections handles frontmatter parsing automatically
- compileMDX compiles MDX to a renderable string
- MDXContent renders with custom component mapping
- remark-gfm and @flowershow/remark-wiki-link passed as remarkPlugins

### Verification

- All 48 posts load via allPosts import
- All 33 projects load via allProjects import
- MDX content renders with custom components
- Tags, dates, descriptions are all parsed correctly
- Build generates .content-collections/generated/
