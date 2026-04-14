/**
 * app.js — Unified portfolio JavaScript
 *
 * Handles both desktop and mobile in one file.
 * Layout detection is done via matchMedia — same breakpoint as CSS (768px).
 * No separate files, no duplication.
 *
 * Features:
 *  - Section switching (desktop nav + mobile drawer)
 *  - Hamburger menu toggle (mobile only)
 *  - Outside-click and Escape-key to close drawer
 *  - Keyboard arrow-key navigation (desktop nav)
 *  - Hash-based deep linking (#experience, #projects, etc.)
 *  - Contact form validation with status feedback
 *  - Smooth scroll-to-content on mobile section switch
 */

'use strict';

/* ══════════════════════════════════
   BREAKPOINT
══════════════════════════════════ */
const MOBILE_MQ = window.matchMedia('(max-width: 768px)');

const isMobile = () => MOBILE_MQ.matches;

/* ══════════════════════════════════
   DOM REFERENCES
══════════════════════════════════ */
// Shared
const sections    = document.querySelectorAll('.section');
const allNavBtns  = document.querySelectorAll('[data-section]'); // all nav buttons across both layouts

// Desktop
const rightPanel      = document.getElementById('rightPanel');
const desktopNavBtns  = document.querySelectorAll('.desktop-nav-list [data-section]');

// Mobile
const menuBtn         = document.getElementById('menuBtn');
const mobileDrawer    = document.getElementById('mobileDrawer');
const mobileNavBtns   = document.querySelectorAll('.mobile-nav-list [data-section]');
const mobileHero      = document.querySelector('.mobile-hero');

// Contact
const contactForm  = document.getElementById('contactForm');
const formStatus   = document.getElementById('formStatus');

/* ══════════════════════════════════
   SECTION SWITCHING
══════════════════════════════════ */

/**
 * Activate a section by ID.
 * Works for both desktop and mobile — picks the right scroll target automatically.
 * @param {string} sectionId
 */
function activateSection(sectionId) {
  // Hide all sections
  sections.forEach((sec) => {
    sec.classList.remove('active');
    sec.setAttribute('aria-hidden', 'true');
  });

  // Deactivate all nav buttons across both navs
  allNavBtns.forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  // Show target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
    target.removeAttribute('aria-hidden');
  }

  // Activate matching nav buttons in both navs
  allNavBtns.forEach((btn) => {
    if (btn.dataset.section === sectionId) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }
  });

  // Scroll behaviour
  if (isMobile()) {
    // On mobile: scroll past the hero to show the section
    closeMobileDrawer();
    if (mobileHero) {
      const scrollTarget = mobileHero.offsetTop + mobileHero.offsetHeight;
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  } else {
    // On desktop: scroll only the right panel back to top
    if (rightPanel) rightPanel.scrollTop = 0;
  }

  // Update URL hash (no page jump)
  history.replaceState(null, '', `#${sectionId}`);
}

// Wire up ALL nav buttons (desktop + mobile) with one loop
allNavBtns.forEach((btn) => {
  btn.addEventListener('click', () => activateSection(btn.dataset.section));
});

/* ── Keyboard navigation on desktop nav ── */
desktopNavBtns.forEach((btn, idx, arr) => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && idx < arr.length - 1) {
      e.preventDefault();
      arr[idx + 1].focus();
    }
    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      arr[idx - 1].focus();
    }
  });
});

/* ══════════════════════════════════
   MOBILE HAMBURGER MENU
══════════════════════════════════ */
function openMobileDrawer() {
  mobileDrawer.classList.add('open');
  mobileDrawer.removeAttribute('aria-hidden');
  menuBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden'; // prevent background scroll while drawer open
}

function closeMobileDrawer() {
  mobileDrawer.classList.remove('open');
  mobileDrawer.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function toggleMobileDrawer() {
  mobileDrawer.classList.contains('open') ? closeMobileDrawer() : openMobileDrawer();
}

if (menuBtn) {
  menuBtn.addEventListener('click', toggleMobileDrawer);
}

// Close on outside click
document.addEventListener('click', (e) => {
  if (
    mobileDrawer &&
    mobileDrawer.classList.contains('open') &&
    !mobileDrawer.contains(e.target) &&
    !menuBtn.contains(e.target)
  ) {
    closeMobileDrawer();
  }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
    closeMobileDrawer();
    menuBtn.focus();
  }
});

// When resizing from mobile to desktop, close the drawer and reset body overflow
MOBILE_MQ.addEventListener('change', (e) => {
  if (!e.matches) {
    // Switched to desktop
    closeMobileDrawer();
  }
});

/* ══════════════════════════════════
   CONTACT FORM
══════════════════════════════════ */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setFormStatus(msg, type) {
  if (!formStatus) return;
  formStatus.textContent = msg;
  formStatus.className   = `form-status${type ? ' ' + type : ''}`;
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    setFormStatus('', '');

    const name    = contactForm.elements['name'].value.trim();
    const email   = contactForm.elements['email'].value.trim();
    const message = contactForm.elements['message'].value.trim();

    if (!name || !email || !message) {
      setFormStatus('Please fill in all fields.', 'error');
      return;
    }
    if (!validateEmail(email)) {
      setFormStatus('Please enter a valid email address.', 'error');
      return;
    }

    /*
     * ── CONNECT YOUR FORM HANDLER HERE ──────────────────────────────
     *
     * Option A — Formspree (free, zero backend):
     *   1. Sign up at formspree.io and create a form.
     *   2. Replace 'YOUR_FORM_ID' below with your actual ID.
     *   3. Remove the demo block at the bottom of this comment.
     *
     *   fetch('https://formspree.io/f/YOUR_FORM_ID', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ name, email, message }),
     *   })
     *   .then((res) => {
     *     if (!res.ok) throw new Error();
     *     setFormStatus('Message sent! I will be in touch soon.', 'success');
     *     contactForm.reset();
     *   })
     *   .catch(() => setFormStatus('Something went wrong. Try again.', 'error'));
     *
     * Option B — EmailJS (no backend, direct to your inbox):
     *   emailjs.send('SERVICE_ID', 'TEMPLATE_ID', { name, email, message })
     *     .then(() => { setFormStatus('Message sent!', 'success'); contactForm.reset(); })
     *     .catch(() => setFormStatus('Something went wrong.', 'error'));
     *
     * ────────────────────────────────────────────────────────────────
     */

    // Demo feedback — remove once a real handler is wired up
    setFormStatus('Message sent! I will get back to you soon.', 'success');
    contactForm.reset();
  });
}

/* ══════════════════════════════════
   HASH-BASED DEEP LINKING
══════════════════════════════════ */
function loadSectionFromHash() {
  const hash  = window.location.hash.replace('#', '');
  const valid = Array.from(sections).map((s) => s.id);
  if (hash && valid.includes(hash)) {
    activateSection(hash);
  }
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadSectionFromHash();
});
