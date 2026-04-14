/**
 * mobile.js — Mobile portfolio JavaScript
 * Handles: hamburger menu toggle, section switching, contact form
 */

'use strict';

/* ── DOM references ── */
const menuBtn        = document.getElementById('menuBtn');
const drawer         = document.getElementById('drawer');
const drawerButtons  = document.querySelectorAll('.drawer-nav [data-section]');
const sections       = document.querySelectorAll('.section');
const hero           = document.querySelector('.hero');
const contactForm    = document.getElementById('contactFormMobile');
const formStatus     = document.getElementById('formStatusMobile');

/* ══════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════ */
function openMenu() {
  menuBtn.setAttribute('aria-expanded', 'true');
  drawer.classList.add('open');
  drawer.removeAttribute('aria-hidden');
}

function closeMenu() {
  menuBtn.setAttribute('aria-expanded', 'false');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}

function toggleMenu() {
  const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
}

menuBtn.addEventListener('click', toggleMenu);

/* Close drawer on outside tap */
document.addEventListener('click', (e) => {
  if (
    drawer.classList.contains('open') &&
    !drawer.contains(e.target) &&
    !menuBtn.contains(e.target)
  ) {
    closeMenu();
  }
});

/* Close on Escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && drawer.classList.contains('open')) closeMenu();
});

/* ══════════════════════════════════
   SECTION SWITCHING
══════════════════════════════════ */

/**
 * Activate a named section and update drawer nav state.
 * @param {string} sectionId
 * @param {HTMLButtonElement} [activeBtn]
 */
function showSection(sectionId, activeBtn) {
  sections.forEach((sec) => {
    sec.classList.remove('active');
    sec.setAttribute('aria-hidden', 'true');
  });

  drawerButtons.forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
    target.removeAttribute('aria-hidden');
  }

  const btn = activeBtn || document.querySelector(`.drawer-nav [data-section="${sectionId}"]`);
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }

  closeMenu();

  /* Scroll to just below the hero */
  if (hero) {
    const scrollTarget = hero.offsetHeight + 56;
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  }

  /* Update URL hash */
  history.replaceState(null, '', `#${sectionId}`);
}

/* Bind drawer button clicks */
drawerButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    showSection(btn.dataset.section, btn);
  });
});

/* Support direct hash navigation on load */
function loadFromHash() {
  const hash = window.location.hash.replace('#', '');
  const validSections = Array.from(sections).map((s) => s.id);
  if (hash && validSections.includes(hash)) {
    showSection(hash);
  }
}

/* ══════════════════════════════════
   CONTACT FORM
══════════════════════════════════ */
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formStatus.textContent = '';
    formStatus.className   = 'form-status';

    const name    = contactForm.name.value.trim();
    const email   = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'Please fill in all fields.';
      formStatus.classList.add('error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formStatus.textContent = 'Please enter a valid email address.';
      formStatus.classList.add('error');
      return;
    }

    /*
     * Replace with your real form submission handler.
     * See main.js for a Formspree example.
     */

    formStatus.textContent = 'Message sent! I will get back to you soon.';
    formStatus.classList.add('success');
    contactForm.reset();
  });
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadFromHash();
});
