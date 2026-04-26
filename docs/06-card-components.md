## 06 - Card Components

### Goal
Convert all card components from Svelte/Astro to React with identical styling and behavior.

### Components to Create

**./src/components/card/PostCard.tsx**
- Props: title, description, href, date, tags
- Same grid layout: grid-rows-[auto_2rem_auto_2rem]
- Calendar icon + formatted date
- Tag pills
- Hover: bg-white transition
- view-transition-name style (can use CSS view-transition or skip for now)

**./src/components/card/ProjectCard.tsx**
- Props: slug, title, description, href, stack, hasImage
- Image with /assets/projects/{slug}/cover.webp
- Grayscale -> color on hover
- Error fallback (onerror handler)
- Stack tags with links
- transition-name style

**./src/components/card/WorkExperienceCard.tsx**
- Props: company, location, time, position, period, details, technologies, defaultOpen
- Collapsible details with animejs animation
- Mobile + desktop layouts
- Chevron rotation on toggle
- Respects prefers-reduced-motion

**./src/components/card/EducationCard.tsx**
- Props: institution, degree, fieldOfStudy, gpa, time
- Simple display card

### Animation Libraries
- WorkExperienceCard uses animejs (same as source)
- Keep exact animation timing: 350ms easeOutCubic open, 250ms close

### What This Replaces
- ./src/components/card/PostCard.svelte -> ./src/components/card/PostCard.tsx
- ./src/components/card/ProjectCard.astro -> ./src/components/card/ProjectCard.tsx
- ./src/components/card/WorkExperienceCard.svelte -> ./src/components/card/WorkExperienceCard.tsx
- ./src/components/card/EducationCard.astro -> ./src/components/card/EducationCard.tsx

### Verification
- All cards render with correct styling
- Project images load with grayscale effect
- Work experience cards expand/collapse smoothly
- Post cards show correct dates and tags
