## 11 - Open Source & GitHub Integration

### Goal

Build the GitHub PR fetching system and PR dropdown component.

### Components to Create

**./src/components/opensource/PRDropdown.tsx**

- React version of PRDropdown.svelte
- Collapsible repository section
- animejs for height animation
- Repository link with star count
- PR list with additions/deletions
- Merged count badge
- Total changes count
- Respects prefers-reduced-motion

**./src/lib/github.ts** — GitHub loader (adapted from github.ts):

- GraphQL query to fetch merged PRs
- Pagination (100 per page)
- Filter by minStars and archived status
- Cache to .cache/github-prs.json in dev
- Return GitHubPullRequest[]

### Data Flow

OpenSourceSection:

- Calls server function or uses loader data
- Groups PRs by repository name
- Sorts by mergedCount desc
- Passes to PRDropdown components

### Server Function

Create a TanStack Start server function:

```ts
export const getGitHubPRs = createServerFn({ method: "GET" }).handler(async () => {
  // Load from cache or fetch from GitHub API
  // Return grouped and sorted PRs
});
```

### What This Replaces

- ./src/content/loaders/github.ts -> ./src/lib/github.ts
- ./src/components/opensource/PRDropdown.svelte -> ./src/components/opensource/PRDropdown.tsx

### Verification

- GitHub PRs load correctly
- Cache works in dev mode
- Dropdowns expand/collapse with animation
- Star counts abbreviate correctly (1k, 1M)
- Changes count displays
