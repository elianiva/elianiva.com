## 08 - Post Detail Page

### Goal
Build individual post pages (/posts/$slug) with full markdown rendering.

### Route
- ./src/routes/posts.$slug.tsx — Post detail page with slug param

### Components to Create

**./src/components/CodeCopy.tsx**
- React version of CodeCopy.svelte
- useEffect that runs after render
- Finds all <pre> elements
- Wraps in relative div, adds copy button
- Clipboard API with success feedback
- Cleanup on unmount (remove buttons)

**./src/layouts/PostLayout.tsx** (or inline in route)
- BackButton at top
- Post title, date, tags header
- Markdown content rendered with react-markdown
- CodeCopy component
- Update component for update callouts
- Greentext component for greentext blocks
- Prev/Next post navigation
- SEO with post-specific meta

### MDX Components Map
When rendering markdown, map custom components:
- <Update date="..."> -> Update component
- <Greentext items={[...]}> -> Greentext component
- <Quiz ...> -> Quiz component
- <RegexHighlighter ...> -> RegexHighlighter component
- <TermPopover ...> -> TermPopover component

These are custom MDX components used in posts.

### Data Flow
Loader:
- Get slug from route params
- getPostBySlug(slug) -> returns Post with html content
- Get prev/next posts for navigation

### What This Replaces
- ./src/pages/posts/[slug].astro -> ./src/routes/posts.$slug.tsx
- ./src/layouts/PostLayout.astro -> layout within route + components
- ./src/components/CodeCopy.svelte -> ./src/components/CodeCopy.tsx

### Verification
- All posts render correctly
- Markdown converts to HTML properly
- Code blocks have copy buttons
- Custom MDX components render
- Prev/next navigation works
- SEO meta tags are post-specific
