# Digillect — SRE Consultancy Website

Static site for [Digillect](https://digillect.ca), a Toronto-based SRE and cloud consultancy.
Built as a single-page site compatible with **GitHub Pages** (no build step required).

---

## Directory Structure

```
digillect/
├── index.html              # Main HTML — all sections, inline SVGs
│
├── css/
│   ├── tokens.css          # Design tokens: colours, base reset, shared primitives, buttons
│   ├── nav.css             # Fixed navigation bar
│   ├── hero.css            # Hero section + floating stat cards
│   ├── sections.css        # Marquee, illustration strip, about, services,
│   │                       # how-we-work, contact, footer
│   └── responsive.css      # Mobile / tablet breakpoints
│
├── js/
│   └── main.js             # Scroll reveal, service card stagger, form UX
│
└── assets/
    └── svg/
        ├── illus-cloud-infra.svg    # Server racks + cloud shape
        ├── illus-kubernetes.svg     # K8s hex cluster with satellite pods
        ├── illus-observability.svg  # Dashboard with SLO threshold + alert dot
        └── illus-migration-dr.svg   # On-prem → AWS migration with DR shield
```

> **Note on SVGs:** The four illustrations are *inlined* directly in `index.html` for
> guaranteed rendering (no network requests, no CORS issues). The files in `assets/svg/`
> are the same artwork kept as standalone files for easy editing.

---

## Deploying to GitHub Pages

1. Create a GitHub repo (e.g. `digillect-site` or `digillect.github.io`)
2. Push the contents of this folder to the `main` branch root
3. Go to **Settings → Pages → Branch: main / root** → Save
4. Site will be live at `https://<your-org>.github.io/<repo>/`

No build tools, no Node, no dependencies. Pure HTML/CSS/JS.

---

## Fonts

Loaded from Google Fonts (SIL Open Font License — free for commercial use):
- **Bebas Neue** — display / headings
- **DM Mono** — body / UI text
- **Instrument Serif** — blockquote italic

---

## Colour Palette

| Token          | Value                      |
|----------------|----------------------------|
| `--blue`       | `#00c8ff` (neon blue)      |
| `--yellow`     | `#ffe600` (electric yellow)|
| `--bg`         | `#09090b` (near black)     |
| `--fg`         | `#eaeef3` (off white)      |
| `--fg-muted`   | `#5f6e7e` (slate)          |

---

## Contact

admin@digillect.ca
