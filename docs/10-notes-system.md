## 10 - Notes System (Vault)

### Goal

Build the complete notes/vault system with sync, graph, search, and categorized views.

### Routes

- ./src/routes/notes.tsx — Notes index page
- ./src/routes/notes.$slug.tsx — Individual note page

### Components to Create

**./src/components/notes/Search.tsx**

- React version of Search.svelte
- Fuse.js search across notes
- Search input with clear button
- Results dropdown with categories
- onSearch callback for filtering

**./src/components/notes/NotesTabs.tsx**

- React version of NotesTabs.svelte
- Tabs: Articles, Vault, People, Music
- Hash-based routing (#articles, #vault, etc.)
- Category counts
- Animated tab indicator (CSS anchor or JS)
- Renders appropriate card components

**./src/components/notes/GraphView.tsx**

- React version of GraphView.svelte
- force-graph library (dynamic import for SSR safety)
- Nodes colored by category
- Click to navigate
- Resize observer

**./src/components/notes/GraphModal.tsx**

- React version of GraphModal.svelte
- Full-screen modal
- Contains GraphView
- Escape to close, backdrop click

**./src/components/notes/ArticleCard.tsx**

- Bocchi hairtie decoration
- Title, description, tags, date
- Domain badge for external links

**./src/components/notes/MusicCard.tsx**

- Album art placeholder
- Title, artist, album, year
- Purple accent theme

**./src/components/notes/PeopleCard.tsx**

- Initial avatar
- Title, tags, backlink count

**./src/components/notes/VaultCard.tsx**

- Folded corner decoration
- Title, description, tags
- Sky accent theme

**./src/components/notes/Backlinks.tsx**

- React version of Backlinks.astro
- Shows notes that link to current note

### Notes Data Loading

**./src/lib/notes.ts** — Notes loader (adapted from notes.ts):

- In dev: load from local filesystem (~/Development/personal/notes)
- In prod: load from GitHub API using GH_TOKEN
- Parse frontmatter with gray-matter
- Extract wiki links [[...]]
- Build backlink graph
- Filter by "public" tag
- Return Note[]

**Build-time approach**: Since notes change frequently in dev, use a server function that caches results. In production, fetch from GitHub at build time and include in bundle.

### What This Replaces

- ./src/pages/notes/index.astro -> ./src/routes/notes.tsx
- ./src/pages/notes/[slug].astro -> ./src/routes/notes.$slug.tsx
- ./src/components/notes/_.svelte -> ./src/components/notes/_.tsx
- ./src/content/loaders/notes.ts -> ./src/lib/notes.ts

### Verification

- Notes load from local FS in dev
- Notes load from GitHub in prod
- Search filters notes correctly
- Tabs switch between categories
- Graph renders with force-graph
- Backlinks resolve correctly
- Wiki links work
