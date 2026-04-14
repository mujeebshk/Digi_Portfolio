# Mujeeb Shaik — Portfolio

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

| Breakpoint      | Layout                                      |
|-----------------|---------------------------------------------|
| `> 768px`       | 2:1 CSS grid — intro left, content right    |
| `769px–1024px`  | Same grid, tighter padding (tablet)         |
| `≤ 768px`       | Fixed topbar + hamburger drawer + hero      |

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

## Wire Up the Contact Form

Replace the demo block in `assets/js/app.js` with your real handler.

**Formspree (recommended — free, no backend):**
1. Sign up at [formspree.io](https://formspree.io) → create a form → copy your form ID
2. In `app.js`, replace the demo block with:

```js
fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, message }),
})
.then((res) => {
  if (!res.ok) throw new Error();
  setFormStatus('Message sent! I will be in touch soon.', 'success');
  contactForm.reset();
})
.catch(() => setFormStatus('Something went wrong. Try again.', 'error'));
```

---

## Browser Support

| Browser | Min version |
|---------|-------------|
| Chrome  | 90+         |
| Firefox | 88+         |
| Safari  | 14+         |
| Edge    | 90+         |

---

© 2025 Mujeeb Shaik. All rights reserved.
