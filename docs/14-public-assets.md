## 14 - Public Assets & Static Files

### Goal
Move all static assets from the source project.

### Files to Move

**Fonts:**
- ../elianiva.com/public/assets/fonts/Chonburi.ttf -> ./public/assets/fonts/Chonburi.ttf
- ../elianiva.com/public/assets/fonts/Lora-Bold.ttf -> ./public/assets/fonts/Lora-Bold.ttf
- ../elianiva.com/public/assets/fonts/Lora-Regular.ttf -> ./public/assets/fonts/Lora-Regular.ttf

**Logos (all 40+ tech stack logos):**
- ../elianiva.com/public/assets/logo/*.png -> ./public/assets/logo/*.png

**Project covers:**
- ../elianiva.com/public/assets/projects/*/cover.webp -> ./public/assets/projects/*/cover.webp

**Post images:**
- ../elianiva.com/public/assets/posts/*/*.{png,webp} -> ./public/assets/posts/*/*.{png,webp}

**Favicons:**
- ../elianiva.com/public/favicon.png -> ./public/favicon.png
- ../elianiva.com/public/favicon.svg -> ./public/favicon.svg

**Other:**
- ../elianiva.com/public/robots.txt -> ./public/robots.txt
- ../elianiva.com/public/assets/cv_dicha.pdf -> ./public/assets/cv_dicha.pdf
- ../elianiva.com/public/wri/* -> ./public/wri/*

### What to Remove from Target
- ./public/favicon.ico (replace with source favicon)
- ./public/logo192.png
- ./public/logo512.png
- ./public/manifest.json (optional, can keep or replace)

### Verification
- All images load correctly
- Project covers display
- Tech stack logos show
- Favicon works
- CV download works
- Robots.txt accessible
