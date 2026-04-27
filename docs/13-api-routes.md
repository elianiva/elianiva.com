## 13 - API Routes & OG Images

### Goal

Create API routes for OG image generation and notes graph data.

### Routes

**./src/routes/api.og-image.ts** — OG Image API:

- React version of og-image.ts
- Uses @cf-wasm/satori + @cf-wasm/resvg (same as source)
- satori-html for HTML-to-SVG
- Generates 1200x630 social cards
- Accepts title, description as query params
- Returns PNG image
- Same styling: pink theme, blob avatar, decorative shapes

**./src/routes/api.graph.json.ts** — Notes graph API:

- React version of graph.json.ts
- Returns nodes + links for force-graph
- Nodes: id, title, category
- Links: source, target (from outgoing_links)

### TanStack Start API Routes

Use createAPIFileRoute or server functions:

```ts
import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/og-image")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get("title") || "elianiva";
    // Generate OG image...
    return new Response(pngBuffer, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  },
});
```

### OG Image Implementation

Same as source:

1. Build HTML string with satori-html
2. Convert to SVG with satori
3. Render SVG to PNG with Resvg
4. Return PNG buffer

Keep the same visual design:

- Pink background (#fff1f2)
- Blob avatar image
- Title + description text
- Decorative shapes (circles, triangles)
- Domain name watermark

### What This Replaces

- ./src/pages/api/og-image.ts -> ./src/routes/api.og-image.ts
- ./src/pages/api/graph.json.ts -> ./src/routes/api.graph.json.ts

### Verification

- OG image API returns valid PNG
- OG images display correctly when shared
- Graph API returns valid JSON
- Graph data matches notes structure
