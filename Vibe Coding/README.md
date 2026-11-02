# Product Manager Portfolio

A fast, dependency-free PM portfolio built with plain HTML, CSS and vanilla JavaScript. No build step, no framework — open `home.html` in a browser and it works. Deploy free to GitHub Pages or Netlify.

> 📝 **Where do I edit my info?** See **[CONTENT.md](CONTENT.md)** — a map of exactly what content lives in which file, with a fill-in checklist.

## Structure

```
home.html                            Main page (hero, about, impact, work, insights, skills, testimonials, experience, contact)
index.html                           Tiny redirect stub → home.html (so bare folder URLs still work)
case-studies/
  case-studies-list.html             List of all case studies
  case-study-activation.html         Sample case-study template #1 (activation problem)
  case-study-selfserve.html          Sample case-study template #2 (self-serve flow)
  index.html                         Redirect stub → case-studies-list.html
insights/
  insights-list.html                 Product teardowns / short essays
  index.html                         Redirect stub → insights-list.html
assets/css/styles.css                All styling (design tokens + components + responsive + dark mode)
assets/js/main.js                    Theme toggle, mobile nav, scroll animations, active nav
assets/img/                          Your images (see assets/img/README.md)
resume.pdf                           Placeholder — replace with your real résumé
```

> Note: the real pages are named `home.html`, `case-studies-list.html`, etc. (not `index.html`) so they're easy to tell apart by name in an editor. Each folder still has a tiny `index.html` **redirect stub** that instantly forwards to the real page — so visiting a bare folder URL (e.g. the project root, or `/case-studies/`) still works exactly like before, whether you open the project with VS Code's Live Server, `python3 -m http.server`, or any static host. Without these stubs, a bare folder URL would show a raw file listing instead of your styled site — if your UI ever looks broken/unstyled, check that you're opening `home.html` directly or that these stub files are still present.

## Quick start

```bash
# preview locally
python3 -m http.server 8000
# then open http://localhost:8000/home.html
```

Or just double-click `home.html`.

## Find every place to edit

Every spot that needs your content is marked with an HTML comment:

```bash
grep -rn "EDIT ME" .
```

Replace any remaining `EDIT ME` markers (currently only inside the case-study accordion sections, which are templates to fill in with real write-ups).

## Content checklist (what to add + the "insight about you")

- [ ] **Identity** — Name, title, positioning line, LinkedIn URL, email, city, headshot (`assets/img/headshot.jpg`).
- [ ] **About / How I work** (`#about`) — 3-sentence bio + 3–5 PM operating principles. This is your differentiator.
- [ ] **Impact snapshot** — 3–5 headline metrics you're proudest of.
- [ ] **Case studies** (`#work` → `case-studies/`) — 2–4 deep dives. For each: context, problem, your role, discovery/insight, strategy & tradeoffs, execution, outcome (numbers), and what you'd do differently.
- [ ] **Insights** (`insights/`) — 1+ product teardown or essay. Shows product sense without NDA-covered work.
- [ ] **Skills & tools** (`#skills`) — discovery/research, strategy, prioritization, analytics, tools, experimentation.
- [ ] **Testimonials** — 2–3 quotes from managers, engineers, or designers you worked with.
- [ ] **Experience** (`#experience`) — roles + dates; link your résumé.
- [ ] **Contact** (`#contact`) — email + LinkedIn.
- [ ] **Résumé** — replace `resume.pdf` with your real file (keep the name, or update the links).
- [ ] **Images** — add `headshot.jpg`, `case-study-activation.jpg`, `case-study-selfserve.jpg`, `og-image.png` (see `assets/img/README.md`).

## Interactive features (Tier 1)

All are vanilla JS in `assets/js/main.js`; each block no-ops if its markup is absent, and all respect `prefers-reduced-motion`. Content is still fully visible with JavaScript disabled.

| Feature | Where | How to use/configure |
| --- | --- | --- |
| Animated metric counters | Case-study outcomes (and the Impact section, once you add real numbers) | On any `.num`, add `data-count="35"` plus optional `data-prefix="+"`, `data-suffix="%"`, `data-decimals="1"`. Keep the real value as the element text so it shows even without JS. |
| Filterable work grid (optional) | `#work` on `index.html` | Not currently used (only 2 template cards). To re-enable: add back a `.filter-bar[data-filter-bar]` with `.filter-btn[data-filter]` buttons, and a `data-tags="growth web"` attribute on each card — see `assets/js/main.js`. |
| Expandable case-study sections | Case-study pages | Each block is a `.cs-section` with `data-open="true|false"` and a `.cs-trigger` button. `aria-expanded` on the button sets the default state. |
| Copy-email + toast | `#contact`, `#about` | Add `data-copy="you@example.com"` to any email link; clicking copies it and shows a toast. |
| Scroll progress bar | All pages | Automatic (injected by JS). |
| Back-to-top button | All pages | Automatic (injected by JS); appears after ~600px of scroll. |
| Image lightbox | Any `<img data-lightbox>` | Add the `data-lightbox` attribute to an image to make it zoomable (Esc or click-outside closes). |
| Estimated read time | Case-study pages | Add `<span data-read-time></span>`; JS fills in "≈ N min read". |

## Adding a new case study

1. Copy `case-studies/case-study-activation.html` to `case-studies/case-study-<topic>.html` (pick a short, descriptive slug instead of a number — that's what made the old numbered files hard to tell apart).
2. Fill in the sections (keep the `.cs-section` / `.cs-trigger` / `.cs-panel` wrapper for the accordion; update each `aria-controls` / panel `id` to be unique, e.g. `cs-<topic>-context`).
3. Add a card linking to it in `case-studies/case-studies-list.html` and in the `#work` section of `home.html`, plus `data-count` on any outcome metrics.

## Deploy

### GitHub Pages
```bash
git init
git add .
git commit -m "Add PM portfolio"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
Then: repo → **Settings → Pages → Build from branch → `main` / root**. Your site is live at `https://<you>.github.io/<repo>/home.html`, and the bare root URL `https://<you>.github.io/<repo>/` also works — it hits the `index.html` redirect stub, which forwards to `home.html` automatically.

### Netlify
Drag the whole folder onto https://app.netlify.com/drop — instantly live, with a free custom-domain option.

## Notes
- Dark/light theme is remembered via `localStorage`.
- The site is fully responsive and keyboard-accessible; it respects `prefers-reduced-motion`.
- Interactive features are progressive enhancements — all content is readable and navigable without JavaScript.
- No tracking, no cookies, no external dependencies — nothing to break.
