## 17 - View Transitions

### Goal
Implement the View Transitions API for smooth page transitions, preserving the original view-transition-name behavior from the source site.

### Research Findings
- TanStack Router has built-in View Transitions API support
- Set defaultViewTransition: true in router config for global fade
- Can use defaultViewTransition.types function for directional transitions
- Router tracks route indices via __TSR_index for direction detection
- Link component has viewTransition prop for per-link control
- CSS view-transition-name identifies animatable elements
- Browser support: Chrome 126+, behind flag in some versions

### Router Configuration

**./src/router.tsx:**
```ts
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultViewTransition: {
      types: ({ fromLocation, toLocation }) => {
        // Default cross-fade for most transitions
        return ['fade']
      },
    },
  })
  return router
}
```

### Preserving Original view-transition-name
The original site uses CSS view-transition-name for card-to-detail transitions:
- Post cards: view-transition-name: post-card-{slug}
- Project cards: view-transition-name: project-card-{slug}
- Note cards: view-transition-name: note-card-{id}

In React, apply these as inline styles:
```tsx
<article style={{ viewTransitionName: `post-card-${slug}` }}>
```

### CSS for View Transitions
Add to styles.css:
```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 300ms;
}

::view-transition-old(post-card-*),
::view-transition-new(post-card-*) {
  animation-duration: 400ms;
}
```

### Per-Navigation Control
For the "View all" buttons and card links, use the Link component:
```tsx
import { Link } from '@tanstack/react-router'

<Link to="/posts/$slug" params={{ slug }} viewTransition>
  <PostCard ... />
</Link>
```

### Fallback for Unsupported Browsers
The View Transitions API gracefully no-ops in unsupported browsers. No polyfill needed.

### What This Replaces
- Astro's view transition support (built-in) -> TanStack Router's defaultViewTransition
- CSS view-transition-name styles -> Same CSS, applied via React style prop

### Verification
- Card-to-detail transitions animate smoothly
- Cross-fade works between pages
- view-transition-name elements morph correctly
- No jank or flash of unstyled content
- Graceful fallback in Firefox/Safari
