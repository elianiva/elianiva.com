## 02 - Global Styles & Tailwind Theme

### Goal

Replace the target project's default sea-green theme with the original elianiva.com pink theme.

### Source of Truth

- ../elianiva.com/src/index.css — the complete original theme

### Changes to ./src/styles.css

Replace ALL current content with adapted original styles:

1. **Font imports**: Keep Hepta Slab + Varela Round (original), remove Fraunces/Manrope
2. **Theme configuration**: Replace all CSS variables with pink palette:
   - Background: warm off-white (#fff1f2 family)
   - Primary: pink-950, pink-600
   - Borders: pink-200
   - Accents: sky-200, yellow-300
3. **Typography plugin**: Keep @tailwindcss/typography
4. **Custom utilities** from original:
   - .with-box-underline — decorative underline with box
   - .with-box-upperline — decorative upperline with box
   - .blob-shape — blob clip-path for avatar
   - .stitch-border — dashed border style
   - .card-tilt-odd — nth-child rotation for cards
   - .prose overrides for markdown content

### Key Tailwind @theme values to set:

--font-sans: "Varela Round", sans-serif
--font-display: "Hepta Slab", serif
--font-heading: "Hepta Slab", serif
--font-body: "Varela Round", sans-serif
--font-mono: "IBM Plex Mono", monospace

### Color palette (CSS custom properties):

- Primary text: #431407 (pink-950 equivalent)
- Secondary text: rgba(67, 20, 7, 0.7)
- Border: #fbcfe8 (pink-200)
- Background: #fff1f2 (pink-50/rose-50)
- Accent bg: rgba(255, 255, 255, 0.6)
- Hover bg: white

### Body styles:

- background-color: #fff1f2
- No gradients (original is flat warm white)
- font-family: var(--font-body)

### Shadcn/ui Adaptation

Since we're using shadcn components but want original styling:

- Override shadcn CSS variables in :root to match pink palette
- Map --background -> #fff1f2
- Map --foreground -> #431407
- Map --border -> #fbcfe8
- Map --primary -> #db2777 (pink-600)
- Map --primary-foreground -> white
- Map --muted -> #fce7f3 (pink-100)
- Map --muted-foreground -> rgba(67, 20, 7, 0.6)
- Map --accent -> #fce7f3
- Map --accent-foreground -> #431407
- Map --ring -> #f472b6 (pink-400)
- Map --radius -> 0 (original uses sharp corners mostly)

### Files to Move

- Copy ../elianiva.com/src/index.css content as base, adapt for Tailwind v4 + shadcn

### Verification

- Home page renders with pink theme
- All text uses Varela Round / Hepta Slab
- Borders are pink-200
- Background is warm off-white
