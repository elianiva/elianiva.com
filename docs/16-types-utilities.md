## 16 - Type Definitions & Utilities

### Goal
Move all shared types and utility functions from the source project.

### Files to Create

**./src/types/github-pr.ts** — Copy from source:
- GitHubPullRequest type
- GroupedPRs type
- GitHubLoaderOptions type
- GraphQLPullRequest type
- GraphQLResponse type

**./src/types/education.ts** — Copy from source:
- Education type

**./src/types/experience.ts** — Copy from source:
- Experience type

**./src/types/technology.ts** — Copy from source:
- Technology union type

**./src/models/work-experience.ts** — Copy from source:
- WorkExperience type

**./src/models/resource.ts** — Can be removed (Astro-specific MDXInstance usage)

**./src/lib/utils.ts** — Already exists in target, merge with source:
- Keep existing cn() utility from shadcn
- Add slugify() from source

### Files to Remove (Astro-specific)
- ./src/models/post.ts (replaced by content.ts types)
- ./src/models/project.ts (replaced by content.ts types)
- ./src/models/resource.ts (Astro-specific)

### Verification
- All types compile without errors
- No Astro-specific imports remain
- TypeScript strict mode passes
