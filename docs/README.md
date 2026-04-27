## elianiva.com TanStack Start Migration Plans

Migration from Astro 6 + Svelte 5 to TanStack Start + React 19.

### Plans

| #   | File                        | Module                                                   | Status  |
| --- | --------------------------- | -------------------------------------------------------- | ------- |
| 01  | 01-package-install.md       | Dependencies, Vite config, content-collections setup     | Planned |
| 02  | 02-global-styles.md         | Tailwind theme, pink palette, shadcn overrides           | Planned |
| 03  | 03-content-layer.md         | content-collections for posts/projects/MDX               | Planned |
| 04  | 04-root-layout.md           | SEO, Frame, CanvasBackground, Footer, fonts              | Planned |
| 05  | 05-home-page.md             | Hero, Blog, Project, Work, Education, OSS sections       | Planned |
| 06  | 06-card-components.md       | PostCard, ProjectCard, WorkExperienceCard, EducationCard | Planned |
| 07  | 07-posts-list-page.md       | /posts route, PostList search/filter                     | Planned |
| 08  | 08-post-detail-page.md      | /posts/$slug route, MDX rendering, CodeCopy              | Planned |
| 09  | 09-projects-pages.md        | /projects, /projects/$slug routes                        | Planned |
| 10  | 10-notes-system.md          | Notes vault, graph, search, tabs, cards                  | Planned |
| 11  | 11-open-source-github.md    | GitHub PR fetching, PRDropdown                           | Planned |
| 12  | 12-custom-mdx-components.md | Quiz, RegexHighlighter, TermPopover, Update, Greentext   | Planned |
| 13  | 13-api-routes.md            | OG image generation, notes graph API                     | Planned |
| 14  | 14-public-assets.md         | Fonts, logos, images, favicons, static files             | Planned |
| 15  | 15-build-deploy.md          | Prerender config, Cloudflare deploy, build scripts       | Planned |
| 16  | 16-types-utilities.md       | Type definitions, utility functions                      | Planned |
| 17  | 17-view-transitions.md      | View Transitions API, card-to-detail animations          | Planned |

### Key Architecture Decisions

1. **Content Layer**: @content-collections/core + @content-collections/vite + @content-collections/mdx
   - Build-time processing of all MDX content
   - Type-safe imports via generated module
   - MDX compilation with custom remark plugins

2. **Prerendering**: TanStack Start built-in prerender
   - Static routes auto-discovered
   - crawlLinks prerenders linked dynamic routes
   - All posts/projects pages prerendered (content is build-time)
   - Notes pages SSR (dynamic content)

3. **View Transitions**: TanStack Router defaultViewTransition
   - Global cross-fade by default
   - Per-link control via Link viewTransition prop
   - CSS view-transition-name preserved from original

4. **Styling**: Tailwind v4 with original pink palette
   - Override shadcn CSS variables
   - Keep all original custom utilities
   - Same font stack

### Source vs Target Mapping

| Source (Astro)              | Target (TanStack Start)                           |
| --------------------------- | ------------------------------------------------- |
| src/content.config.ts       | content-collections.ts                            |
| src/content/loaders/\*.ts   | content-collections transform functions           |
| getCollection("posts")      | import { allPosts } from "content-collections"    |
| getCollection("projects")   | import { allProjects } from "content-collections" |
| render()                    | <MDXContent code={post.mdx} />                    |
| Astro layouts               | React components + \_\_root.tsx                   |
| .astro pages                | .tsx routes                                       |
| [slug].astro                | $slug.tsx                                         |
| client:\* directives        | Client components render naturally                |
| Astro.url.pathname          | useLocation()                                     |
| prerender = true            | tanstackStart({ prerender: { enabled: true } })   |
| View transitions (built-in) | defaultViewTransition router config               |

### Content Inventory

- **Posts**: 48 MDX files in src/content/posts/
- **Projects**: 33 MDX files in src/content/projects/
- **Notes**: Loaded dynamically from GitHub/local FS
- **GitHub PRs**: Fetched via GraphQL API
- **Public assets**: Fonts, logos, project covers, post images
