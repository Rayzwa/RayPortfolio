# Raymond Wang — Portfolio

A fast, dark "console"-style portfolio built with plain HTML, CSS and vanilla JavaScript. No build step. The only external code is GSAP (from a CDN, home page only, for the intro animation) and two Google Fonts. The site still works if either fails to load.

Planning docs (PRD, positioning, design, tech, project plan) live in [`docs/`](docs/).

## Preview locally

```bash
cd "/Users/raywang/Desktop/Vibe Coding"
python3 -m http.server 8000
# open http://localhost:8000/home.html
```

The intro card shows **once per browser tab**. To see it again, open the page in a new tab or a private window. Links that go straight to a section (e.g. `home.html#builds`) skip it.

## Files

```
home.html                 Main page: intro card → hero + stats → highlights ticker → builds →
                          how I work → stack → path → quote → contact
index.html                Redirect stub → home.html (also carries link-preview tags for the bare URL)
404.html                  "Signal lost" page. Uses root-absolute links (/…) because Vercel serves it at any depth
builds/momentum.html      Momentum (JPMC hackathon, 2026)
builds/growinged.html     GrowingED (OwlHack winner, 2023)
Raymond_Wang_Resume.pdf   Résumé linked from every page
assets/css/styles.css     All styling (tokens, components, motion, responsive, print)
assets/js/main.js         Shared behaviour on every page
assets/js/intro.js        The "Unfold" intro (home page only)
assets/img/               Images (see assets/img/README.md)
vercel.json               Redirects: / → home.html, old /case-studies/* links → #builds
docs/                     Planning docs, kept off the website by .vercelignore
```

## Where to edit your content

Use **Cmd+F** on the comment name in `home.html`. There are no line numbers to go stale.

| What | Search for |
|---|---|
| Intro card (name, one-liner, 3 facts) | `INTRO` |
| Headline + 3 stat tiles | `HERO` |
| Ticker phrases (edit **both** lists, which must match) | `HIGHLIGHTS` |
| Build tiles | `BUILDS` |
| The 4 principles | `HOW I WORK` |
| Skills (`g-product` / `g-ai` / `g-data` / `g-domain` sets the colour) | `STACK` |
| Career line (put `is-now` on the current role) | `PATH` |
| Quotes (add another `<li>`; a dot appears automatically) | `QUOTE` |
| Email / LinkedIn | `mailto:` / `linkedin` on every page |
| Unfinished spots | `EDIT ME` (build pages) |

Keep it short. The home page is meant to be a one-minute scroll, and the detail lives on the build pages.

### Résumé, headshot, preview image
- **Résumé:** replace `Raymond_Wang_Resume.pdf`, keeping the same file name.
- **Headshot:** replace `assets/img/headshot.jpg` with a square image under 300 KB.
- **Preview image:** `assets/img/og-image.png` (1200×630) is what LinkedIn and Slack show. Regenerate it if your title or photo changes.

## Adding a build

1. Copy `builds/momentum.html` to `builds/<name>.html`.
2. Update the title, tag, fact chips, the 3 decision-map nodes and the sections. Each panel `id` must be `<name>-<section>`, and each decision-map link points at one of those ids.
3. Add a tile to the `BUILDS` section of `home.html`, and fix the prev/next buttons at the bottom of each build page.
4. Add the page to the ⌘K menu: the two `"Build"` lines near "Command palette" in `assets/js/main.js`.
5. Only include facts you can share publicly (see `docs/02-POSITIONING.md` §7).

## When you change the header or footer

The header and footer are copied into `home.html`, `404.html` and each `builds/*.html`. Update all of them, then check that every page reports `1`:

```bash
grep -c 'data-nav-toggle' *.html builds/*.html
```

## Built-in effects

| Effect | How to use |
|---|---|
| Unfold intro | Automatic on `home.html`. Click Explore, press Enter or scroll. Skip link for keyboard users; quick fade with reduced motion; slide-up on phones |
| Decode text | `data-decode` on any short text: scrambles into the real text when it scrolls into view |
| Type-on | `data-type`: types the text with a caret (used on the intro line) |
| Counters | `data-count="10"` on a number, with the real value as its text |
| Reveal / stagger | `data-reveal` fades an element in; add `data-stagger` to animate its children one by one |
| Card glow + tilt | Class `card-hover` (mouse/trackpad only) |
| Quote rotator | `data-rotator` on the quote figure |
| Ticker, career line, motifs | Pure CSS (`.ticker`, `.path`, `.art`) |
| Accordions | `.cs-section` on build pages; `aria-expanded="true"` opens one by default. Links to a panel id open that section |
| Copy email | `data-copy="you@example.com"` on a mailto link: copies it and still opens the mail app |
| Jump menu | ⌘K (Ctrl K on Windows) or the ⌕ button |
| Light/dark | Dark by default; the ◐ button switches and remembers the choice |

**When something fails:**
- Reduced-motion users get final states with no movement.
- Without JavaScript, all content shows: the intro is the first section, and every quote is listed.
- A missing headshot becomes an "RW" tile.
- If GSAP or the fonts fail to load, the site falls back to CSS animation and system fonts.

## Before you publish

```bash
grep -rn "EDIT ME" --include="*.html" .           # remaining fill-in spots (hidden comments)
grep -c 'data-nav-toggle' *.html builds/*.html    # header copies in sync
```

Once the site has its final domain, change `og:image` in `home.html` and `index.html` to the full URL (e.g. `https://<domain>/assets/img/og-image.png`). LinkedIn ignores relative image paths.

## Deploy

The site is hosted on **Vercel** from the `RayPortfolio` GitHub repo. Every push to `main` goes live automatically.
