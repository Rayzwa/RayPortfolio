# 04 · Tech — architecture, code audit, performance, testing

> **Summary:** Stay static and build-free; add GSAP for the Unfold and P1 motion. Remove dead code, fix 10 inefficiencies and bugs, close the root-URL/LinkedIn blind spot, and keep publishing clean.
> **Status:** Draft v1 · 2026-11-02 · Owner: Raymond Wang
> **Related:** [PRD](01-PRD.md) · [Positioning](02-POSITIONING.md) · [Design](03-DESIGN.md) · [Project Plan](05-PROJECT-PLAN.md)

---

## 1. Architecture

- **Static files only.** No build step. Host on GitHub Pages or Netlify.
- **Libraries** (cdnjs, pinned, `defer`), loaded only on pages that use them:
  ```html
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  ```
  If `window.gsap` is undefined, fall back to CSS ([PRD G11](01-PRD.md#5-ease-of-use-guardrails-blind-spot-list)).
- **JS files**

| File | Loaded on | Role |
|---|---|---|
| `assets/js/main.js` | All pages | Shared core (exists) |
| `assets/js/intro.js` | Home only | Unfold state machine + guardrails G1–G13 |
| `assets/js/motion.js` | Pages with P1 features | Timeline, flip cards, decision map, spotlight |

- **Theme bootstrap:** a tiny inline script in `<head>` (before CSS paints) sets `data-theme`, which removes the dark-mode flash.

## 2. Reuse map (don't rewrite)

| Need | Already exists in `main.js` |
|---|---|
| Section stagger after unfold | `[data-reveal]` + IntersectionObserver |
| Outcome numbers | `data-count` counters |
| Case-study sections | `.cs-section` accordion |
| Copy email + feedback | `data-copy` + toast |
| Image zoom | `img[data-lightbox]` |
| Scroll feedback | progress bar, back-to-top |
| Active nav link | scrollspy |

## 3. Code audit: dead code to delete

Verified by grep on 2026-11-02: **no HTML file references these.**

> ✅ **Done 2026-11-02:** all items below removed in Phase 0.

| Where | What | Notes |
|---|---|---|
| `assets/js/main.js` lines 150–167 | Filterable work grid | No `data-filter-bar` or `data-tags` in any page |
| `assets/css/styles.css` | `.filter-bar`, `.filter-btn`, `.filter-count`, `.is-hidden` | Only used by the dead filter |
| `assets/css/styles.css` | `.work-card .kpis`, `.kpis b`, `.kpis span` | Unused |
| `assets/css/styles.css` | `.mt-2`, `.mt-3` | Unused |
| `README.md` | "Filterable work grid" table row | Documents removed feature |

> If PRD §7 "hide empty sections" needs a hidden utility, use the native `hidden` attribute instead of reviving `.is-hidden`.

## 4. Inefficiencies & bugs to fix

> ✅ **Done 2026-11-02:** T1–T10 fixed in Phase 0.

| # | Issue | Where | Fix |
|---|---|---|---|
| T1 ✅ | Progress bar animates `width` on every scroll event → reflow | `main.js` `updateProgress` | `transform: scaleX()` with `transform-origin: left`, throttled via `requestAnimationFrame` |
| T2 ✅ | Two separate `document` click listeners | `main.js` (theme/nav + copy) | Merge into one delegated handler |
| T3 ✅ | `setTheme()` writes localStorage on first load → the site locks to whatever the OS theme was at first visit | `main.js` lines 11–26 | Only save on manual toggle; otherwise follow `prefers-color-scheme` changes |
| T4 ✅ | Theme applied at end of `<body>` → light flash for dark-mode users | All pages | Inline `<head>` bootstrap (see §1) |
| T5 ✅ | Nav toggle lacks `aria-expanded` / `aria-controls` | `home.html` + JS | Add attributes; update on toggle |
| T6 ✅ | Theme button changes its `aria-label` **and** sets `aria-pressed` | `main.js` `setTheme` | Fixed label "Dark mode" plus `aria-pressed` only |
| T7 ✅ | Lightbox doesn't trap focus or return it on close | `main.js` lightbox | Store opener, trap Tab, restore focus |
| T8 ✅ | Read-time counts the whole `<main>` incl. buttons/nav text | `main.js` read time | Count `.cs-panel` text only |
| T9 ✅ | Inline `onerror` handlers on images (show instruction text) | `home.html`, case studies | One shared handler in `main.js` that swaps in a designed fallback |
| T10 ✅ | `data-copy` on the email link blocks `mailto:` | `home.html` | Let mailto open **and** copy, or add a separate copy icon button |

## 5. Blind spot: root URL & link previews

- Today, `/` is a meta-refresh stub (`index.html`) → `home.html`.
  - An extra hop before the intro (slower first impression).
  - **LinkedIn and Slack previews of the root URL read the stub, which has no description or image.**
- **Recommendation:** rename `home.html` → `index.html` (and the list pages → `index.html` in their folders), then delete the stubs. To tell tabs apart in VS Code, set `"workbench.editor.labelFormat": "short"`, which shows the folder name next to the file name.
- Alternative, if keeping the names: copy the og: and description tags into each stub.
- `og:image` must be an **absolute URL** (e.g. `https://<you>.github.io/<repo>/assets/img/og-image.png`), and the file must exist (1200×630).

## 6. Shared header/footer (decision: keep static copies)

The nav and footer are copy-pasted into every page. That's fine for 5–7 pages, but drift is how the ☰ button went missing on 4 of them.

**Nav sync checklist** (whenever the header or footer changes):
- [ ] `index.html` (home)
- [ ] `case-studies/index.html` (list)
- [ ] `case-studies/case-study-*.html` (each)
- [ ] `insights/index.html` (list)
- [ ] `404.html`

**Check command** (every number should be the same):
```bash
grep -c 'data-nav-toggle' *.html */*.html
```

## 7. Performance budget

| Metric | Budget | How to check |
|---|---|---|
| LCP | < 2.0 s | Lighthouse (mobile) |
| CLS | < 0.05 | Lighthouse |
| JS total | < 80 KB gzipped | DevTools Network |
| Each image | ≤ 300 KB, WebP preferred, explicit `width`/`height` | Finder / DevTools |
| Lighthouse | ≥ 95 Performance **and** Accessibility | Chrome DevTools |
| Aurora | Paused on `visibilitychange`; static if frame rate drops or reduced motion | Manual |

## 8. Testing

**Manual matrix** (from [PRD §9](01-PRD.md#9-acceptance-tests)): Chrome/Safari · 375 px · keyboard only · reduced motion · JS off · dark mode · Back button · deep link · LinkedIn preview.

**Automated / command checks**
```bash
npx linkinator . --recurse                          # broken links
grep -rn "EDIT ME\|PLACEHOLDER\|Add assets/img" --include="*.html" .   # must print nothing
grep -c 'data-nav-toggle' *.html */*.html           # nav sync
```

**Pre-deploy checklist**
- [ ] All three commands above pass
- [ ] Lighthouse ≥ 95 / ≥ 95
- [ ] Résumé PDF is the real one
- [ ] og:image URL loads in a browser
- [ ] Manual matrix done

## 9. Deployment hygiene

- **Don't publish internal files.** Move the public site into a `site/` folder (publish only that), or configure the host's publish directory. Keep `docs/`, `README.md` and `CONTENT.md` out of it; they contain notes and a local file path.
- Add `404.html` (GitHub Pages and Netlify both serve it automatically).

## 10. Docs hygiene

- `README.md` and `CONTENT.md` overlap and have drifted:
  - Both use line numbers that go stale after any edit.
  - `CONTENT.md:26` says bare folder URLs won't work (they do, via stubs).
  - `README.md:69` refers to `#work` on `index.html` (it's `home.html`).
- **After the rebuild:** merge them into one `README.md` organized by section name (search with Cmd+F), with no line numbers.
