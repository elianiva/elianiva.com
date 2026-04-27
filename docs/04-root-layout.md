## 04 - Root Layout & SEO Component

### Goal

Create the root layout that wraps all pages, including SEO meta tags, canvas background, frame decoration, and fonts.

### Files to Create

**./src/components/SEO.tsx** — React version of SEO.astro:

- Props: title, description, keywords, thumbnail, isPost, publishedAt
- Generates all meta tags: Open Graph, Twitter Cards, canonical, favicon
- Uses sites data from ./src/data/sites.ts
- Use TanStack Router's useRouterState or useLocation for current URL

**./src/components/Frame.tsx** — React version of Frame.svelte:

- Fixed decorative borders (pink-200)
- Top-left sky-200 bar
- Top-left yellow-300 "notes" hover link
- Pure CSS, no state needed

**./src/components/CanvasBackground.tsx** — React version of CanvasBackground.svelte:

- WebGL2 shader background with the exact same frag/vert shaders
- Uses useRef for canvas, useEffect for WebGL setup
- Same animation logic: 30fps cap, reduced motion support, intersection observer
- Import shaders with ?raw via vite glsl plugin

**./src/components/Footer.tsx** — React version of Footer.astro:

- Build date display
- Commit hash from env
- Same styling and text

**./src/routes/\_\_root.tsx** — Update existing root route:

- Import fonts: @fontsource/chonburi, @fontsource/varela-round, @fontsource/ibm-plex-mono
- Import Hepta Slab from Google Fonts via link tag
- Wrap children with Frame + CanvasBackground + Footer
- Add SEO component with default values
- Keep TanStack devtools (development only)

### Key Differences from Source

- Astro's <slot /> -> React's {children}
- Astro's head injection -> React Helmet Async or manual meta tags in \_\_root.tsx head()
- Client directives (client:load, client:idle) -> React components render on client by default in TanStack Start
- Astro.url.pathname -> useLocation() from @tanstack/react-router

### What This Replaces

- ./src/layouts/MainLayout.astro -> \_\_root.tsx + individual layout components
- ./src/components/SEO.astro -> ./src/components/SEO.tsx
- ./src/components/Frame.svelte -> ./src/components/Frame.tsx
- ./src/components/CanvasBackground.svelte -> ./src/components/CanvasBackground.tsx
- ./src/components/Footer.astro -> ./src/components/Footer.tsx

### Verification

- Every page has correct meta tags
- Canvas background renders on all pages
- Frame decoration visible on all pages
- Footer shows at bottom
- Fonts load correctly
