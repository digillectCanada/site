/* ============================================================
   blog.js — Posts data + grid rendering
   ============================================================

   TO ADD A NEW POST: push an object into the POSTS array.

   Fields:
   {
     title:    "Post title",
     excerpt:  "One or two sentence description",
     date:     "Apr 2023",
     readTime: "6 min read",
     tags:     ["Tag1", "Tag2"],
     url:      "https://...",         // external URL (Medium etc.)
     accent:   "blue" | "yellow",    // alternates automatically if omitted
   }

   Grid layout is automatic:
     1 post  → single editorial (large, with illustration)
     2 posts → 2-column
     3+ posts → 3-column
   ============================================================ */

const POSTS = [
  {
    title:    "Cost-Efficient Ephemeral Environments with Istio",
    excerpt:  "Deploy only what changed. Route feature traffic via header or cookie. Reuse the rest from your stable non-prod cluster — no duplicate stacks, no wasted compute. Your cloud bill will thank you. Your on-call rotation won't need to.",
    date:     "Mar 2026",
    readTime: "14 min read",
    tags:     ["Istio", "Kubernetes", "Platform Eng"],
    url:      "ephemeral-envs-istio/index.html",
    accent:   "yellow",
    external: false,
  },
  {
    title:    "Kubernetes Operator with Kopf",
    excerpt:  "How to extend the Kubernetes API with custom operators using the Kopf Python framework — including a real-world use case: injecting init containers into labelled pods via mutation and validation webhooks.",
    date:     "Apr 2023",
    readTime: "6 min read",
    tags:     ["Kubernetes", "Operators", "Python", "Kopf"],
    url:      "https://medium.com/@jasmeetkohlisingh/kubernetes-operator-with-kopf-23f86b593ff7",
    accent:   "blue",
    external: true,
  },
];

/* ── K8s illustration SVG (shown in single editorial layout) ── */
const K8S_ILLUS = `
<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:280px;">
  <rect width="280" height="200" fill="transparent"/>
  <polygon points="140,22 173,42 173,82 140,102 107,82 107,42" fill="none" stroke="#00c8ff" stroke-width="1.4" opacity="0.7"/>
  <circle cx="140" cy="62" r="13" fill="none" stroke="#00c8ff" stroke-width="1.2" opacity="0.8"/>
  <text x="140" y="67" text-anchor="middle" font-family="monospace" font-size="9" fill="#00c8ff" opacity="0.9">K8s</text>
  <circle cx="140" cy="122" r="8" fill="none" stroke="#ffe600" stroke-width="1.1"/>
  <circle cx="188" cy="140" r="8" fill="none" stroke="#ffe600" stroke-width="1.1"/>
  <circle cx="92"  cy="140" r="8" fill="none" stroke="#ffe600" stroke-width="1.1"/>
  <circle cx="218" cy="97"  r="8" fill="none" stroke="#00c8ff" stroke-width="1.1" opacity="0.55"/>
  <circle cx="62"  cy="97"  r="8" fill="none" stroke="#00c8ff" stroke-width="1.1" opacity="0.55"/>
  <circle cx="198" cy="34"  r="8" fill="none" stroke="#00c8ff" stroke-width="1.1" opacity="0.55"/>
  <circle cx="82"  cy="34"  r="8" fill="none" stroke="#00c8ff" stroke-width="1.1" opacity="0.55"/>
  <line x1="140" y1="102" x2="140" y2="114" stroke="#ffe600" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.7"/>
  <line x1="140" y1="102" x2="180" y2="132" stroke="#ffe600" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.7"/>
  <line x1="140" y1="102" x2="100" y2="132" stroke="#ffe600" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.7"/>
  <line x1="173" y1="62"  x2="210" y2="97"  stroke="#00c8ff" stroke-width="0.7" stroke-dasharray="2,2" opacity="0.35"/>
  <line x1="107" y1="62"  x2="70"  y2="97"  stroke="#00c8ff" stroke-width="0.7" stroke-dasharray="2,2" opacity="0.35"/>
  <line x1="162" y1="30"  x2="190" y2="34"  stroke="#00c8ff" stroke-width="0.7" stroke-dasharray="2,2" opacity="0.35"/>
  <line x1="118" y1="30"  x2="90"  y2="34"  stroke="#00c8ff" stroke-width="0.7" stroke-dasharray="2,2" opacity="0.35"/>
  <!-- init container injection arrow -->
  <path d="M188,148 Q210,165 188,172 L155,172" fill="none" stroke="#ffe600" stroke-width="0.9" stroke-dasharray="3,2" opacity="0.6"/>
  <polygon points="155,169 148,172 155,175" fill="#ffe600" opacity="0.7"/>
  <text x="210" y="176" font-family="monospace" font-size="6" fill="#ffe600" opacity="0.55">init</text>
</svg>`;

/* ── External link icon SVG ── */
const EXT_ICON = `<svg class="ext-icon" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

/* ── Empty state terminal ── */
function renderEmpty() {
  return `
    <div class="blog-empty">
      <div class="blog-empty-terminal">
        <div class="blog-empty-bar">
          <span class="tbar-dot" style="background:#ff5f57"></span>
          <span class="tbar-dot" style="background:#febc2e"></span>
          <span class="tbar-dot" style="background:#28c840"></span>
          <span class="tbar-title">digillect-blog ~ posts</span>
        </div>
        <div class="blog-empty-body">
          <p><span class="tc">$</span> ls -la ./posts/</p>
          <p class="t-muted">total 0</p>
          <p class="t-muted">drwxr-xr-x  thoughts/    (still marinating)</p>
          <p class="t-muted">drwxr-xr-x  opinions/    (too spicy, redacting)</p>
          <p class="t-muted">drwxr-xr-x  war-stories/ (NDA pending)</p>
          <p><span class="tc">$</span> echo "ETA?"</p>
          <p><span class="ty">▌</span> <span class="t-cursor">soon™</span></p>
        </div>
      </div>
    </div>`;
}

/* ── Build a card ── */
function buildCard(post, index, layoutClass) {
  const accent   = post.accent || (index % 2 === 0 ? 'blue' : 'yellow');
  const tags     = post.tags.map(t => `<span class="blog-tag">${t}</span>`).join('');
  const isExt    = post.external !== false && (post.url.startsWith('http'));
  const target   = isExt ? 'target="_blank" rel="noopener noreferrer"' : '';
  const ctaLabel = isExt ? 'Read on Medium' : 'Read Post';
  const source   = isExt ? 'Medium' : 'Digillect';
  const visual   = layoutClass === 'layout-single'
    ? `<div class="blog-card-visual-wrap">${K8S_ILLUS}</div>`
    : '';

  return `
    <a class="blog-card accent-${accent}"
       href="${post.url}" ${target}
       aria-label="Read: ${post.title}">
      ${visual}
      <div class="blog-card-content">
        <div class="blog-card-tags">${tags}</div>
        <div class="blog-card-meta">
          <span>${post.date}</span>
          <span class="blog-card-meta-dot">●</span>
          <span>${post.readTime}</span>
          <span class="blog-card-meta-dot">●</span>
          <span>${source}</span>
        </div>
        <div class="blog-card-title">${post.title}</div>
        <p class="blog-card-desc">${post.excerpt}</p>
        <span class="blog-card-cta">${ctaLabel} ${isExt ? EXT_ICON : '→'}</span>
      </div>
    </a>`;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {

  /* hamburger for blog page */
  const btn    = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-mobile-drawer');
  if (btn && drawer) {
    btn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        drawer.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        drawer.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  if (!POSTS.length) {
    grid.innerHTML = renderEmpty();
    return;
  }

  /* Determine layout class */
  let layoutClass = 'layout-grid';
  if (POSTS.length === 1) layoutClass = 'layout-single';
  if (POSTS.length === 2) layoutClass = 'layout-double';
  grid.classList.add(layoutClass);

  grid.innerHTML = POSTS.map((post, i) => buildCard(post, i, layoutClass)).join('');
});
