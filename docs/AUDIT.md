# MIGRATION AUDIT: Original Astro (162b936) vs Current TanStack

## FILES PRESENT IN ORIGINAL BUT MISSING/MODIFIED IN CURRENT

### 1. PUBLIC ASSETS - MAJOR GAPS

Original has 112 public files. Current has only favicon.png, favicon.svg, robots.txt, and partial assets.
MISSING from current public/:

- ALL /assets/fonts/ (Chonburi.ttf, Lora-Bold.ttf, Lora-Regular.ttf)
- ALL /assets/logo/\*.png (50+ tech stack logos)
- ALL /assets/posts/\*/ images (post content images)
- ALL /assets/projects/\*/cover.webp (project cover images)
- /assets/cv_dicha.pdf
- /wri/ folder contents

### 2. LAYOUT SYSTEM - REARCHITECTED

Original: 3 Astro layouts (MainLayout, PostLayout, ProjectLayout)
Current: Single \_\_root.tsx with inline layout

- MainLayout: ✅ Converted to \_\_root.tsx + components
- PostLayout: ❌ NOT IMPLEMENTED - post detail page lacks the full PostLayout wrapper
  - Missing: OG image params construction, centered title, "Suggest An Edit" link, giscus comments
  - Missing: Word count, reading time calculation
  - Missing: PublishedAt meta for SEO
- ProjectLayout: ✅ Merged into projects.$slug.tsx route

### 3. POST DETAIL PAGE (posts/[slug].astro vs posts.$slug.tsx)

Original features MISSING in current:

- ❌ Word count and reading time calculation
- ❌ Centered title layout (text-center font-heading text-3xl uppercase)
- ❌ "Suggest An Edit" link to GitHub
- ❌ Giscus comments integration
- ❌ OG image URL construction with title/date/tags/description params
- ❌ PublishedAt SEO meta
- ❌ PostLayout wrapper with isPost=true
- ❌ transition:name for post-card and post-content view transitions
- ✅ BackButton, CodeCopy, tags, prev/next nav are present

### 4. NOTES SYSTEM - SIGNIFICANT DIFFERENCES

#### Notes Loader (content/loaders/notes.ts vs lib/notes.ts)

Original:

- Loads from local FS at ~/Development/personal/notes
- Loads from GitHub API in production
- Uses astro:content loader with renderMarkdown
- Proper category mapping (Articles→article, People→person, Music→music, default→vault)
- Extracts description from first non-heading paragraph
- Parses wiki links, builds backlinks and outgoing_links
- Has frontmatter schema with id, aliases, url, author, links, artist, album, year
- Returns rendered markdown

Current:

- Uses createServerFn
- Simpler category handling (parsed.data.category || "vault")
- Missing: description extraction, proper category mapping from path
- Missing: url, author, links fields for articles/people
- Missing: year as array
- Missing: rendered markdown (uses ReactMarkdown instead)
- NoteCategory type uses "articles" (plural) vs original "article" (singular)

#### Notes Index Page

Original:

- Title: "Personal Notes Vault"
- Has graph modal with inline script for toggle/close/escape handling
- Search component receives notesData and emits filteredIds
- NotesTabs receives notes + filteredIds
- Has backlink_count enrichment
- GraphView is client:visible

Current:

- Title: "Notes Vault" (slightly different)
- GraphModal is a separate React component
- Search emits query+results, NotesTabs filters internally
- Missing: backlink_count display in cards
- GraphView loads immediately

#### Notes Cards - STYLING DIFFERENCES

Original ArticleCard:

- Has bocchi hairtie decoration (sky-300 bars on left)
- Shows domain badge for external articles
- Shows author
- Uses view-transition-name
- Rounded-xl borders

Current ArticleCard:

- Has simplified bocchi hairtie (just a pink dot)
- Missing: author field
- Missing: view-transition-name
- No rounded corners

Original VaultCard:

- Has folded corner decoration (clip-path polygon + border triangle)
- Uses sky-200 border color
- Shows tag overflow (+N)

Current VaultCard:

- Simplified folded corner (gradient only)
- Uses pink-200 border
- Missing: tag overflow indicator

Original MusicCard:

- Has album art placeholder with music icon
- Shows artist, album, year
- Uses purple theme

Current MusicCard:

- Similar but simplified styling

Original PeopleCard:

- Shows backlink_count with ← arrow
- Has initial avatar with pink gradient

Current PeopleCard:

- Shows backlink count with link icon
- Has rounded-full avatar

#### Notes Detail Page

Original:

- Uses Astro.render() for markdown
- Has breadcrumb nav (Notes / Category)
- Shows category badge
- Shows created/modified dates
- Has backlinks section with Backlinks.astro component
- Uses prose for content

Current:

- Uses ReactMarkdown with remark-gfm + wiki-link plugins
- Missing: breadcrumb
- Missing: category badge
- Missing: modified date
- Has backlinks but different styling
- Custom anchor component for wiki links

### 5. OG IMAGE API

Original:

- Uses Chonburi font loaded from /assets/fonts/Chonburi.ttf
- Has date, tags params
- Complex peachy-pink design with tags footer
- Uses satori-html for markup

Current:

- No font loading
- Only title/description params
- Simpler design without tags
- Uses template literal html

### 6. FRAME COMPONENT

Original (Frame.svelte):

- 4 border bars (top/right/bottom/left) all bg-pink-200
- Sky-200 accent bar (w-40 h-4)
- Yellow notes link with group hover visibility

Current (Frame.tsx):

- Only 3 bars (top, left, sky accent)
- Missing: bottom and right border bars
- Notes link is always visible (not hover-only)

### 7. FOOTER

Original:

- "made with actual care (and probably too much coffee)"
- "astro · svelte · tailwind"
- buildDate in en-GB format
- commitHash from CF_PAGES_COMMIT_SHA
- Has with-box-upperline

Current:

- "Built with TanStack Start • Source"
- commitHash from VITE_COMMIT_HASH
- buildDate in ISO format
- Different styling (no with-box-upperline)

### 8. SEO COMPONENT

Original:

- Uses Astro.url.pathname for canonical
- Has favicon.png
- Has theme-color meta
- Twitter card type based on thumbnail presence
- Has twitter:image:alt

Current:

- Uses useRouterState for URL
- Has favicon.svg + apple-touch-icon
- Missing: theme-color
- Always summary_large_image
- Missing: twitter:image:alt

### 9. CANVAS BACKGROUND

Original:

- Uses Svelte onMount
- Has IntersectionObserver to pause when not visible
- 30fps cap with FRAME_INTERVAL
- Proper cleanup (deleteProgram, deleteShader, etc.)
- Uses TRIANGLES (3 vertices)

Current:

- Uses React useEffect
- Missing: IntersectionObserver pause
- Missing: 30fps cap (runs at full speed)
- Cleanup present but simplified
- Uses TRIANGLE_STRIP (4 vertices)
- Different random generation (no grid-based placement)

### 10. HERO SECTION

Original:

- Description: "Software Engineer doing frontend things... Also I rebuilt this site like 5 times."

Current:

- Description: "4+ years doing frontend things..."
- Different text content

### 11. CONTENT COLLECTIONS VS ASTRO CONTENT

Original:

- Uses astro:content with defineCollection
- Has github loader with caching
- Has notes loader with local FS + GitHub fallback
- Posts schema: draft, title, date, description, tags
- Projects schema: title, hasImage, date, description, demo, source, type, stack, featured

Current:

- Uses @content-collections/core
- Posts: same fields
- Projects: same fields
- No github collection (fetched via API instead)
- No notes collection (fetched via server fn)

### 12. MISSING FILES IN CURRENT

Original files with no current equivalent:

- src/content.config.ts
- src/content/loaders/github.ts
- src/content/loaders/notes.ts
- src/env.d.ts
- src/index.css (replaced by styles.css)
- src/layouts/\*.astro (replaced by \_\_root.tsx)
- src/models/\*.ts (types moved to content-collections or types/)
- src/pages/_.astro (replaced by routes/_.tsx)

### 13. WORK EXPERIENCE CARD

Original:

- Uses Svelte with untrack
- Has anime.js animations for expand/collapse
- Desktop layout with -ml-8 for arrow alignment

Current:

- Uses React with useRef/useCallback
- Similar anime.js animations
- Similar layout

### 14. PR DROPDOWN

Original:

- Uses Svelte with anime.js
- Has star icon, git-pull-request icon
- ArrowUpRight icon for external links

Current:

- Uses React with anime.js
- Simplified icons (no star/git-pull-request)
- Similar functionality

### 15. POST LIST / SEARCH

Original (PostList.svelte):

- Has tag filtering with # prefix
- Has debounced search
- Shows tag chips

Current (PostList.tsx):

- Has tag filtering with # prefix
- Has Fuse.js search
- More accessible (aria-live, combobox, listbox)
- Similar functionality

### 16. EDUCATION SECTION

Original:

- Uses BaseSection.astro with grid-cols-[1fr_2fr]
- Has gradient overlay

Current:

- Uses inline section
- Different styling (text-slate-800 instead of pink-950)
- Missing: BaseSection component entirely

### 17. VIEW TRANSITIONS

Original:

- Uses Astro ClientRouter
- Has transition:name on post-card, post-content, project-card, project-content, note-card

Current:

- Uses defaultViewTransition: true in router
- Has style={{ viewTransitionName: ... }} on some elements
- May not work the same way as Astro's implementation

### 18. BUILD/DEPLOY

Original:

- Uses Astro build
- Cloudflare adapter with imageService: "passthrough"
- Prefetch enabled

Current:

- Uses Vite build
- Cloudflare vite plugin
- Prerender config with filter

## CRITICAL ISSUES TO FIX

1. **PUBLIC ASSETS**: Most assets are missing from current project
2. **POST LAYOUT**: Post detail page is missing the full PostLayout wrapper
3. **NOTES LOADER**: Category mapping, description extraction, field handling are different
4. **OG IMAGE**: Missing font, date/tags params, complex design
5. **FRAME**: Missing border bars
6. **FOOTER**: Different content and styling
7. **COMMENTS**: Giscus integration missing
8. **WORD COUNT/READING TIME**: Not implemented for posts

## MINOR STYLING DIFFERENCES

1. Notes cards have different decorations
2. Some rounded corners missing (current uses 0px radius from shadcn)
3. Different font loading approach
4. Some hover effects may differ
