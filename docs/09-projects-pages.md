## 09 - Projects Pages

### Goal
Build the projects listing page and individual project detail pages.

### Routes
- ./src/routes/projects.tsx — Projects list page
- ./src/routes/projects.$slug.tsx — Project detail page

### Components to Create

**./src/routes/projects.tsx**
- BackButton
- Two sections: Personal Projects + Work Projects
- Each uses ProjectSection component
- loadProjects() filtered by type

**./src/routes/projects.$slug.tsx**
- ProjectLayout inline or as component
- Large cover image
- Title + source/visit buttons
- Tech stack sidebar with logos
- Markdown content (react-markdown)
- SEO with project-specific meta

**./src/layouts/ProjectLayout.tsx**
- Similar to PostLayout but for projects
- Tech stack sidebar
- Source / Visit buttons
- Cover image handling

### Data Flow
Projects list loader:
- loadProjects() -> filter by type === "personal" -> sort
- loadProjects() -> filter by type === "work" -> sort

Project detail loader:
- Get slug from params
- getProjectBySlug(slug)
- Get prev/next projects for navigation

### What This Replaces
- ./src/pages/projects.astro -> ./src/routes/projects.tsx
- ./src/pages/projects/[slug].astro -> ./src/routes/projects.$slug.tsx
- ./src/layouts/ProjectLayout.astro -> ./src/layouts/ProjectLayout.tsx

### Verification
- Projects list shows personal + work sections
- Project cards display correctly with images
- Detail page shows cover, stack, description
- Source/Visit buttons link correctly
- Tech stack logos display
