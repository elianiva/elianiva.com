# FIX PLAN: Align TanStack Project with Original Astro Behavior

Based on thorough comparison of original Astro project (git commit 162b936) vs current TanStack implementation.

## PRIORITY 1: CRITICAL FUNCTIONALITY GAPS

### Fix 1: Public Assets

**Status**: Most assets missing
**Impact**: Broken images, missing fonts, broken OG images
**Files needed**:

- ALL /public/assets/logo/\*.png (50+ files)
- ALL /public/assets/posts/\*/ images
- ALL /public/assets/projects/\*/cover.webp
- /public/assets/fonts/Chonburi.ttf (for OG image)
- /public/assets/cv_dicha.pdf
- /public/wri/\*
  **Action**: Copy from original project

### Fix 2: Post Detail Page Layout

**Status**: Missing PostLayout wrapper features
**Impact**: Different UX, missing comments, no edit link
**Files**: src/routes/posts.$slug.tsx
**Changes needed**:

- Add word count and reading time calculation
- Center title with uppercase styling
- Add "Suggest An Edit" GitHub link
- Add Giscus comments integration
- Construct OG image URL with params
- Add publishedAt to SEO

### Fix 3: Notes System Loader

**Status**: Simplified implementation
**Impact**: Missing fields, wrong categories
**Files**: src/lib/notes.ts, src/types/notes.ts
**Changes needed**:

- Fix category mapping (articles→article, etc.)
- Add description extraction from content
- Add url, author, links fields
- Support year as array
- Fix NoteCategory to match original singular form

### Fix 4: OG Image API

**Status**: Simplified design, missing font
**Impact**: Different social preview cards
**Files**: src/routes/api.og-image.tsx
**Changes needed**:

- Load Chonburi font from /assets/fonts/Chonburi.ttf
- Accept date, tags params
- Implement original peachy-pink design with tags footer

### Fix 5: Frame Component

**Status**: Missing border bars
**Impact**: Visual frame incomplete
**Files**: src/components/Frame.tsx
**Changes needed**:

- Add bottom and right border bars
- Make notes link hover-only (invisible by default)

### Fix 6: Footer

**Status**: Different content
**Impact**: Different branding
**Files**: src/components/Footer.tsx
**Changes needed**:

- Restore original text
- Use en-GB date format
- Add with-box-upperline

## PRIORITY 2: STYLING DIFFERENCES

### Fix 7: Notes Cards Styling

**Files**: src/components/notes/\*.tsx
**Changes**:

- ArticleCard: Restore bocchi hairtie, add author/domain
- VaultCard: Restore folded corner, tag overflow
- MusicCard: Minor tweaks
- PeopleCard: Match original styling

### Fix 8: Notes Detail Page

**Files**: src/routes/notes.$slug.tsx
**Changes**:

- Add breadcrumb nav
- Add category badge
- Show modified date
- Match original prose styling

### Fix 9: SEO Component

**Files**: src/components/SEO.tsx
**Changes**:

- Add theme-color meta
- Add twitter:image:alt
- Dynamic twitter card type

### Fix 10: Canvas Background

**Files**: src/components/CanvasBackground.tsx
**Changes**:

- Add IntersectionObserver pause
- Add 30fps cap
- Use TRIANGLES instead of TRIANGLE_STRIP

## PRIORITY 3: NICE TO HAVE

### Fix 11: View Transitions

**Files**: Various
**Changes**:

- Ensure viewTransitionName works correctly
- Add missing transition names

### Fix 12: Hero Section Text

**Files**: src/components/section/HeroSection.tsx
**Changes**:

- Match original description text

### Fix 13: Education Section

**Files**: src/components/section/EducationSection.tsx
**Changes**:

- Match original styling (pink colors, not slate)

## QUESTIONS FOR USER

1. Should we copy ALL public assets from the original project, or are some intentionally omitted?
2. The notes system category type uses "articles" (plural) in current but "article" (singular) in original - which is preferred?
3. The OG image design is quite different - should we match the original exactly or keep the current simpler design?
4. Should Giscus comments be added to post detail pages (requires giscus.app setup)?
5. The footer text currently says "TanStack Start" - should it say "astro · svelte · tailwind" or "tanstack start · react · tailwind"?
