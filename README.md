# Shaik Mujeeb — Portfolio

Personal portfolio website. Fully responsive — automatically switches between desktop and mobile layout based on screen width. **One file, one URL, works everywhere.**

---

## Project Structure

```
mujeeb-portfolio/
├── index.html          # Single entry point — works on all screen sizes
├── vercel.json         # Vercel deployment config + security headers + caching
├── .gitignore
├── README.md
└── assets/
    ├── css/
    │   ├── base.css    # Design tokens, resets, all shared components
    │   └── layout.css  # Responsive layout via CSS media queries
    │                     > 768px  →  Desktop 2:1 grid
    │                     ≤ 768px  →  Mobile hero + drawer
    └── js/
        └── app.js      # Unified JS: section switching, hamburger, form
```

---

## How Responsiveness Works

No JavaScript is involved in layout switching. Pure CSS `@media` queries handle everything:

| Breakpoint     | Layout                                   |
| -------------- | ---------------------------------------- |
| `> 768px`      | 2:1 CSS grid — intro left, content right |
| `769px–1024px` | Same grid, tighter padding (tablet)      |
| `≤ 768px`      | Fixed topbar + hamburger drawer + hero   |

Elements exclusive to one layout are hidden with `display: none !important` on the other:

- `.topbar`, `.mobile-drawer`, `.mobile-hero` → hidden on desktop
- `.left-panel`, `.desktop-nav` → hidden on mobile

---

## Local Development

No build tools needed. Open directly:

```bash
# Python
python3 -m http.server 3000

# Node
npx http-server . -p 3000

# VS Code: right-click index.html → "Open with Live Server"
```

---

## Deploy to Vercel

```bash
# Push to GitHub first
git init
git add .
git commit -m "feat: initial portfolio"
git branch -M main
git remote add origin https://github.com/mujeebshk/portfolio.git
git push -u origin main
```

Then: **vercel.com → New Project → Import repo → Deploy**  
No framework, no build command — Vercel auto-detects static.

Or via CLI:

```bash
npm i -g vercel && vercel --prod
```

---

© 2026 Shaik Mujeeb. All rights reserved.
