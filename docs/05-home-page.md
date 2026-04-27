## 05 - Home Page & Section Components

### Goal

Build the home page (/) with all its sections, converting Astro+Svelte components to React.

### Route

- ./src/routes/index.tsx — Home page route

### Components to Create (React versions)

**./src/components/section/HeroSection.tsx**

- Copy exact markup from HeroSection.astro
- Convert social links map to React JSX
- Avatar with blob-shape clip-path
- Keep data-hero-reveal attributes for animation

**./src/components/section/BlogSection.tsx**

- Props: posts: Post[]
- Grid of PostCard components
- "View all posts" button
- data-anime attributes for scroll reveal

**./src/components/section/ProjectSection.tsx**

- Props: projects: Project[], title, description, seeMoreUrl?
- Grid of ProjectCard components
- data-anime attributes

**./src/components/section/WorkExperienceSection.tsx**

- Props: workExperiences: WorkExperience[]
- List of WorkExperienceCard components
- data-anime attributes

**./src/components/section/EducationSection.tsx**

- Static education data (same as source)
- EducationCard components

**./src/components/section/OpenSourceSection.tsx**

- Fetches GitHub PRs via server function or API route
- Groups PRs by repository
- PRDropdown components

**./src/components/animation/HeroReveal.tsx**

- React version of HeroReveal.svelte
- Uses animejs with useEffect
- Targets elements with data-hero-reveal attribute
- Same animation: opacity + translateY with staggered delays
- Respects prefers-reduced-motion

**./src/components/animation/ScrollReveal.tsx**

- React version of ScrollReveal.svelte
- Uses IntersectionObserver in useEffect
- Targets elements with data-anime attribute
- Same animation: opacity + translateY with stagger
- Respects prefers-reduced-motion

**./src/components/ViewAllButton.tsx**

- Simple link with arrow icon
- Hover animation (max-width expand)

### Data Flow

Home page loader (server function):

1. loadPosts() -> filter non-draft -> sort by date -> take(6)
2. loadProjects() -> filter featured personal -> sort by date
3. loadProjects() -> filter featured work -> sort by date
4. workExperiences from static data
5. GitHub PRs from API/cache

### What This Replaces

- ./src/pages/index.astro -> ./src/routes/index.tsx
- ./src/components/section/_.astro -> ./src/components/section/_.tsx
- ./src/components/animation/_.svelte -> ./src/components/animation/_.tsx
- ./src/components/ViewAllButton.astro -> ./src/components/ViewAllButton.tsx

### Verification

- Home page loads all sections
- Hero animation plays on mount
- Scroll reveal works for each section
- All data displays correctly
- Links work
