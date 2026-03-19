/* ============================================================
   main.js — Scroll reveal + service card stagger + Formspree forms
   ============================================================

   SETUP — two things to fill in before deploying:
   ─────────────────────────────────────────────────────────
   1. Sign up at https://formspree.io (free)
   2. Create two forms, set recipient to admin@digillect.ca
   3. Paste the endpoint URLs below

   FORMSPREE_CONTACT  → your contact form endpoint
   FORMSPREE_TESTI    → your testimonial form endpoint

   Each endpoint looks like: https://formspree.io/f/xxxxxxxx

   SECURITY:
   ─────────────────────────────────────────────────────────
   ✅ No API keys or secrets in this file
   ✅ Formspree dashboard → Forms → Settings → Allowed Domains
      Add: digillect.ca  (blocks submissions from other domains)
   ✅ Rate limiting handled below (1 submit / 60s per form)
   ============================================================ */

/* global helper called from inline onclick in mobile drawer */
function closeDrawer() {
  const btn    = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-mobile-drawer');
  if (drawer) drawer.classList.remove('open');
  if (btn)    btn.classList.remove('open');
  document.body.style.overflow = '';
}

const FORMSPREE_CONTACT = 'https://formspree.io/f/mzdjkkgq';
const FORMSPREE_TESTI   = 'https://formspree.io/f/mqeyggdy';


/* ── Testimonials data ───────────────────────────────────────
   To add approved testimonials: push objects into this array.
   Leave it empty [] to show the witty empty state.

   Each entry:
   {
     text:     "The quote text",
     name:     "Full Name",
     role:     "Title @ Company",
     logo:     "assets/logos/company.png", // optional image path
     initials: "AB",                        // fallback if no logo
   }
   ──────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  // Example — uncomment and edit to activate:
  // {
  //   text:     "Digillect transformed our on-call nightmare into a structured, sane process. Response times dropped 60% in the first month.",
  //   name:     "Alex Chen",
  //   role:     "VP Engineering @ Acme Corp",
  //   initials: "AC",
  // },
];

/* ── Rate limits ── */
const RATE_LIMIT_MS   = 60 * 1000;
let lastContactSubmit = 0;
let lastTestiSubmit   = 0;

/* ── Helpers ── */
function sanitize(str) {
  return str.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/&/g,'&amp;').trim();
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function showStatus(el, type, message) {
  el.textContent = message;
  el.className   = 'form-status ' + type;
  el.hidden      = false;
  if (type === 'success') setTimeout(() => { el.hidden = true; }, 6000);
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Scroll reveal ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Staggered service card reveal ── */
  const cards = document.querySelectorAll('.svc-card');
  cards.forEach(card => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, background 0.3s';
  });
  const grid = document.getElementById('svc-grid');
  if (grid) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        cards.forEach((card, i) => {
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'none'; }, i * 70);
        });
      }
    }, { threshold: 0.05 }).observe(grid);
  }

  /* ── Hamburger menu ── */
  initHamburger();

  /* ── Init sections ── */
  initTestimonials();
  initContactForm();
  initTestiForm();

});

/* ============================================================
   TESTIMONIALS CAROUSEL
   ============================================================ */
function initTestimonials() {
  const empty    = document.getElementById('testi-empty');
  const slides   = document.getElementById('testi-slides');
  const controls = document.getElementById('testi-controls');
  const dotsEl   = document.getElementById('testi-dots');
  const prevBtn  = document.getElementById('testi-prev');
  const nextBtn  = document.getElementById('testi-next');

  if (!slides) return;

  /* No testimonials yet — witty empty state stays visible */
  if (!TESTIMONIALS.length) return;

  /* Hide empty state, reveal slides + controls */
  if (empty)      empty.hidden    = true;
  slides.hidden   = false;
  controls.hidden = false;

  let current   = 0;
  let autoTimer = null;

  TESTIMONIALS.forEach((t, i) => {
    const slide = document.createElement('div');
    slide.className = 'testi-slide' + (i === 0 ? ' active' : '');
    slide.innerHTML = `
      <span class="testi-quote-mark">"</span>
      <p class="testi-text">${t.text}</p>
      <div class="testi-author">
        <div class="testi-logo">
          ${t.logo
            ? `<img src="${t.logo}" alt="${t.name} logo" />`
            : `<span>${t.initials || t.name.slice(0,2).toUpperCase()}</span>`
          }
        </div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-role">${t.role}</div>
        </div>
      </div>`;
    slides.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsEl.appendChild(dot);
  });

  function goTo(n) {
    const allSlides = slides.querySelectorAll('.testi-slide');
    const allDots   = dotsEl.querySelectorAll('.testi-dot');
    allSlides[current].classList.remove('active');
    allDots[current].classList.remove('active');
    current = (n + TESTIMONIALS.length) % TESTIMONIALS.length;
    allSlides[current].classList.add('active');
    allDots[current].classList.add('active');
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 6000); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }
  if (TESTIMONIALS.length > 1) startAuto();
}

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
function initHamburger() {
  const btn    = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-mobile-drawer');
  if (!btn || !drawer) return;

  btn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on backdrop click
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

/* ============================================================
   CONTACT FORM — Formspree
   ============================================================ */
function initContactForm() {
  const form   = document.getElementById('contact-form');
  const btn    = document.getElementById('form-btn');
  const status = document.getElementById('form-status');
  if (!form || !btn || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (FORMSPREE_CONTACT.includes('YOUR_CONTACT_FORM_ID')) {
      showStatus(status, 'error', 'Form not configured — please email admin@digillect.ca directly.');
      return;
    }

    const now = Date.now();
    if (now - lastContactSubmit < RATE_LIMIT_MS) {
      const wait = Math.ceil((RATE_LIMIT_MS - (now - lastContactSubmit)) / 1000);
      showStatus(status, 'error', `Please wait ${wait}s before sending another message.`);
      return;
    }

    const fromName    = sanitize(form.querySelector('[name="name"]').value);
    const fromCompany = sanitize(form.querySelector('[name="company"]').value) || '—';
    const replyTo     = sanitize(form.querySelector('[name="email"]').value);
    const message     = sanitize(form.querySelector('[name="message"]').value);

    if (!fromName)             { showStatus(status, 'error', 'Please enter your name.'); return; }
    if (!isValidEmail(replyTo)){ showStatus(status, 'error', 'Please enter a valid email address.'); return; }
    if (message.length < 10)   { showStatus(status, 'error', 'Message is too short — give us a bit more detail.'); return; }
    if (message.length > 5000) { showStatus(status, 'error', 'Message is too long (max 5000 characters).'); return; }

    btn.disabled = true; btn.textContent = 'Sending…'; status.hidden = true;

    try {
      const res = await fetch(FORMSPREE_CONTACT, {
        method:  'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    fromName,
          company: fromCompany,
          email:   replyTo,
          message: message,
        }),
      });

      if (!res.ok) throw new Error('Formspree error');

      lastContactSubmit = Date.now();
      showStatus(status, 'success', "Message sent — we'll be in touch shortly.");
      form.reset();

    } catch (err) {
      console.error('Formspree contact error:', err);
      showStatus(status, 'error', 'Something went wrong. Please email admin@digillect.ca directly.');
    } finally {
      btn.disabled = false; btn.textContent = 'Send Message →';
    }
  });
}

/* ============================================================
   TESTIMONIAL SUBMIT FORM — Formspree
   ============================================================ */
function initTestiForm() {
  const form   = document.getElementById('testi-form');
  const btn    = document.getElementById('testi-btn');
  const status = document.getElementById('testi-status');
  if (!form || !btn || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (FORMSPREE_TESTI.includes('YOUR_TESTI_FORM_ID')) {
      showStatus(status, 'error', 'Form not configured yet.');
      return;
    }

    const now = Date.now();
    if (now - lastTestiSubmit < RATE_LIMIT_MS) {
      const wait = Math.ceil((RATE_LIMIT_MS - (now - lastTestiSubmit)) / 1000);
      showStatus(status, 'error', `Please wait ${wait}s before submitting again.`);
      return;
    }

    const testiName    = sanitize(form.querySelector('[name="testi_name"]').value);
    const testiRole    = sanitize(form.querySelector('[name="testi_role"]').value);
    const testiMessage = sanitize(form.querySelector('[name="testi_message"]').value);

    if (!testiName)                  { showStatus(status, 'error', 'Please enter your name.'); return; }
    if (!testiRole)                  { showStatus(status, 'error', 'Please enter your role and company.'); return; }
    if (testiMessage.length < 20)    { showStatus(status, 'error', 'Testimonial is too short — give us a bit more!'); return; }
    if (testiMessage.length > 1000)  { showStatus(status, 'error', 'Testimonial is too long (max 1000 characters).'); return; }

    btn.disabled = true; btn.textContent = 'Submitting…'; status.hidden = true;

    try {
      const res = await fetch(FORMSPREE_TESTI, {
        method:  'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    testiName,
          role:    testiRole,
          message: testiMessage,
        }),
      });

      if (!res.ok) throw new Error('Formspree error');

      lastTestiSubmit = Date.now();
      showStatus(status, 'success', 'Thanks! Your testimonial has been submitted for review.');
      form.reset();

    } catch (err) {
      console.error('Formspree testi error:', err);
      showStatus(status, 'error', 'Something went wrong. Please try again later.');
    } finally {
      btn.disabled = false; btn.textContent = 'Submit Testimonial →';
    }
  });
}
