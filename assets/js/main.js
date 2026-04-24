/**
 * main.js — Desktop portfolio JavaScript
 * Handles: section switching, keyboard nav, contact form validation
 */

"use strict";

/* ── DOM references ── */
const rightPanel = document.getElementById("rightPanel");
const navButtons = document.querySelectorAll(".nav-list [data-section]");
const sections = document.querySelectorAll(".section");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

/* ══════════════════════════════════
   SECTION SWITCHING
══════════════════════════════════ */

/**
 * Activate a named section and update nav state.
 * @param {string} sectionId - id of the target <section>
 * @param {HTMLButtonElement} [activeBtn] - the nav button that triggered this
 */
function showSection(sectionId, activeBtn) {
  // Deactivate all sections
  sections.forEach((sec) => {
    sec.classList.remove("active");
    sec.setAttribute("aria-hidden", "true");
  });

  // Deactivate all nav buttons
  navButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });

  // Activate target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add("active");
    target.removeAttribute("aria-hidden");
  }

  // Activate nav button
  const btn =
    activeBtn || document.querySelector(`[data-section="${sectionId}"]`);
  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
  }

  // Scroll right panel to top
  if (rightPanel) rightPanel.scrollTop = 0;

  // Update URL hash without triggering scroll
  history.replaceState(null, "", `#${sectionId}`);
}

/* Bind nav button clicks */
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.section, btn);
  });
});

/* Support direct hash navigation on load */
function loadFromHash() {
  const hash = window.location.hash.replace("#", "");
  const validSections = Array.from(sections).map((s) => s.id);
  if (hash && validSections.includes(hash)) {
    showSection(hash);
  }
}

/* Keyboard navigation: Arrow keys cycle through nav items */
document.addEventListener("keydown", (e) => {
  if (e.target.closest(".nav-list")) {
    const btns = Array.from(navButtons);
    const idx = btns.indexOf(document.activeElement);
    if (e.key === "ArrowDown" && idx < btns.length - 1) {
      e.preventDefault();
      btns[idx + 1].focus();
    }
    if (e.key === "ArrowUp" && idx > 0) {
      e.preventDefault();
      btns[idx - 1].focus();
    }
  }
});

/* ══════════════════════════════════
   CONTACT FORM
══════════════════════════════════ */
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.textContent = "";
    formStatus.className = "form-status";

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Please fill in all fields.";
      formStatus.classList.add("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formStatus.textContent = "Please enter a valid email address.";
      formStatus.classList.add("error");
      return;
    }

    // Formspree Integration
    formStatus.textContent = "Sending...";

    fetch("https://formspree.io/f/mlgaazdv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `New Message from ${name} (Desktop View)`,
      }),
    })
      .then(() => {
        formStatus.textContent = "Message sent!";
        formStatus.classList.add("success");
        contactForm.reset();
      })
      .catch(() => {
        formStatus.textContent = "Something went wrong. Please try again.";
        formStatus.classList.add("error");
      });
  });
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  loadFromHash();
});
