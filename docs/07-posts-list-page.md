## 07 - Posts List Page & Search

### Goal

Build the posts listing page (/posts) with search and tag filtering.

### Route

- ./src/routes/posts.tsx — Posts list page

### Components to Create

**./src/components/PostList.tsx**

- React version of PostList.svelte
- Search input with combobox role
- Tag filtering with # prefix
- Fuse.js for fuzzy search
- Selected tag pills with remove button
- Filtered post grid
- Screen reader announcements (aria-live)
- Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)

**./src/components/BackButton.tsx**

- React version of BackButton.astro
- History.back() if same origin referrer, else /
- House icon + Back icon

### Data Flow

Posts page loader:

- loadPosts() -> filter non-draft -> sort by date desc
- Pass full posts array to PostList component

### Search Implementation

- useState for searchQuery, selectedTags, activeOptionIndex
- useMemo for filteredPosts (filter by query + tags)
- useMemo for availableTags (for autocomplete)
- Input handler: detect # prefix for tag search
- Tag selection adds to selectedTags array
- Removing tag filters it out

### What This Replaces

- ./src/pages/posts.astro -> ./src/routes/posts.tsx
- ./src/components/PostList.svelte -> ./src/components/PostList.tsx
- ./src/components/BackButton.astro -> ./src/components/BackButton.tsx

### Verification

- All posts display in grid
- Search filters by title/slug
- Tag autocomplete works with # prefix
- Selected tags show as removable pills
- Keyboard navigation works
- Screen reader announces results
