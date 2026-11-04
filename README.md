# Raymond Wang — Portfolio

A fast portfolio built with plain HTML, CSS and vanilla JavaScript. No build step. The only external code is GSAP (loaded from a CDN on the home page for the intro animation), and the site still works if that fails to load.

Planning docs (PRD, positioning, design, tech, project plan) live in [`docs/`](docs/).

## Preview locally

```bash
cd "/Users/raywang/Desktop/Vibe Coding"
python3 -m http.server 8000
# open http://localhost:8000/home.html
```

The intro card shows **once per browser tab**. To see it again, open the page in a new tab (or a private window). Links that go straight to a section (e.g. `home.html#work`) skip it.

## Files

```
home.html                          Main page: intro card, hero, about, highlights, work, skills, testimonials, experience, contact
index.html                         Redirect stub → home.html (also carries link-preview tags for the bare URL)
404.html                           "Page not found" page
Raymond_Wang_Resume.pdf            Résumé linked from every page
case-studies/
  case-studies-list.html           List of case studies
  case-study-momentum.html         Momentum (JPMC hackathon, 2026)
  case-study-growinged.html        GrowingED (OwlHack winner, 2023)
  index.html                       Redirect stub → case-studies-list.html
insights/
  insights-list.html               Not linked yet — add a teardown, then link it
  index.html                       Redirect stub → insights-list.html
assets/css/styles.css              All styling (tokens, components, intro, responsive, dark mode, print)
assets/js/main.js                  Shared behaviour on every page
assets/js/intro.js                 The "Unfold" intro (home page only)
assets/img/                        Images (see assets/img/README.md)
docs/                              Planning docs — keep these out of the published site
```

## Where to edit your content

Use **Cmd+F** on the section name — no line numbers to go stale.

| What | File | Search for |
|---|---|---|
| Intro card (name, one-liner, 3 facts) | `home.html` | `INTRO` |
| Hero headline + summary | `home.html` | `HERO` |
| About + "How I work" principles | `home.html` | `ABOUT` |
| Highlights (6 items) | `home.html` | `HIGHLIGHTS` |
| Case-study cards | `home.html` and `case-studies/case-studies-list.html` | `card-link` |
| Skills | `home.html` | `SKILLS` |
| Testimonials | `home.html` | `TESTIMONIALS` |
| Experience timeline | `home.html` | `EXPERIENCE` |
| Email / LinkedIn | every page | `mailto:` / `linkedin` |
| Unfinished spots | anywhere | `EDIT ME` |

### Résumé
Replace `Raymond_Wang_Resume.pdf` with a new version **using the same file name** so every button keeps working.

### Headshot
`assets/img/headshot.jpg` (800×800, ~95 KB) is a web-sized copy of `Raymond_Wang_Headshot_Square.jpg`. To change the photo, replace `assets/img/headshot.jpg` with a square image under 300 KB. Keep the full-size original out of the published site, since the pages don't use it.

### Link-preview image
`assets/img/og-image.png` (1200×630) is what LinkedIn/Slack show when someone shares your link. Regenerate it if your title or photo changes.

## Adding a case study

1. Copy `case-studies/case-study-momentum.html` to `case-studies/case-study-<topic>.html`.
2. Update the title, quick facts, the 3 decision-map nodes and the sections. Each panel `id` must be `<topic>-<section>` (e.g. `topic-problem`), and each decision-map link points at one of those ids.
3. Add a card to `case-studies/case-studies-list.html` and the `#work` section of `home.html`, and update the prev/next buttons.
4. Only include facts you can share publicly (see `docs/02-POSITIONING.md` §7).

## When you change the header or footer

The header/footer is copied into every page. Update all of them: `home.html`, `404.html`, `case-studies/case-studies-list.html`, each `case-studies/case-study-*.html`, `insights/insights-list.html`. Then check every page reports the same count:

```bash
grep -c 'data-nav-toggle' *.html */*.html
```

## Built-in features

| Feature | How to use |
|---|---|
| Unfold intro | Automatic on `home.html`. Click Explore, press Enter, or scroll. Skip link for keyboard users; quick fade with reduced motion; slide-up on phones |
| Dark mode | Toggle in the header; follows the device setting until a visitor picks one |
| Animated numbers | On any `.num`, add `data-count="35"` plus optional `data-prefix`, `data-suffix`, `data-decimals`. Keep the real value as the text |
| Case-study accordions | `.cs-section` blocks; `aria-expanded` on the button sets the default. Links to a panel id open that section |
| Decision map | `.decision-map` at the top of case studies; nodes link to sections |
| Timeline draw-in | Automatic on `.timeline` |
| Card glow | Automatic on `.card-hover` (mouse/trackpad only) |
| Copy email | `data-copy="you@example.com"` on a link: copies it and still opens the mail app |
| Image zoom | Add `data-lightbox` to an `<img>` |
| Missing-image fallback | `data-fallback="monogram"` (RW tile) or `data-fallback="hide"` (removes the figure) |
| Read time | `<span data-read-time></span>` on case-study pages |
| Page transitions | Automatic in browsers that support View Transitions |
| Jump-anywhere menu | Press ⌘K (Ctrl K on Windows) on any page. Commands are built from the nav links, the résumé link and the footer email/LinkedIn, so new pages need no setup |

All motion respects the device's reduced-motion setting, and all content is readable with JavaScript turned off.

## Before you publish

```bash
grep -rn "EDIT ME" --include="*.html" .          # remaining fill-in spots (hidden comments)
grep -c 'data-nav-toggle' *.html */*.html        # header copies in sync
```

- Publish only the site files — not `docs/` or this README (see `docs/04-TECH.md` §9).
- After choosing a domain, change `og:image` in `home.html` and `index.html` to the full URL (e.g. `https://<domain>/assets/img/og-image.png`). LinkedIn ignores relative image paths.

## Deploy

**GitHub Pages:** push the site to a repo, then **Settings → Pages → Build from branch → main / root**. The bare URL works through the `index.html` redirect stub.

**Netlify:** drag the folder (or a folder with only the site files) onto https://app.netlify.com/drop.
