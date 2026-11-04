# Raymond Wang — Portfolio

A fast, light-by-default portfolio with a dark "console" boot sequence, built with plain HTML, CSS and vanilla JavaScript. No build step. The only external code is GSAP (from a CDN, home page only, for the intro animation) and two Google Fonts. The site still works if either fails to load.

Planning docs (PRD, positioning, design, tech, project plan) live in [`docs/`](docs/).

## Preview locally

```bash
cd "/Users/raywang/Desktop/Vibe Coding"
python3 -m http.server 8000
# open http://localhost:8000/home.html
```

The boot sequence shows **once per browser tab**. To see it again, open the page in a new tab or a private window. Links that go straight to a section (e.g. `home.html#builds`) skip it.

## Files

```
home.html                 Main page: boot sequence → hero + flip stats → highlights ticker → builds →
                          loop → how I work → stack → path → quotes → contact
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
| Boot sequence (log lines, name, one-liner; graph labels are in the `<svg class="graph">`) | `INTRO` |
| Headline + 3 flip cards (number/label on the front, detail on the back) | `HERO` |
| Ticker phrases (edit **both** lists, which must match) | `HIGHLIGHTS` |
| Build tiles and their mini-prototypes (illustrations, mock data) | `BUILDS` |
| Lifecycle steps | `LOOP` |
| The 6 principles | `HOW I WORK` |
| Skills (`g-product` / `g-ai` / `g-data` / `g-domain` sets the colour) | `STACK` |
| Career line (put `is-now` on the current role) | `PATH` |
| Quotes: `q-short` shows first, optional `q-more` behind "Read more" (give it an `id` and point the button's `aria-controls` at it). Add an `<li>` and a dot appears automatically | `QUOTE` |
| Email / LinkedIn | `mailto:` / `linkedin` on every page |
| Unfinished spots | `EDIT ME` (build pages) |

Keep it short. The home page is meant to be a one-minute scroll, and the detail lives on the build pages.

### Résumé, headshot, preview image
- **Résumé:** replace `Raymond_Wang_Resume.pdf`, keeping the same file name.
- **Headshot:** replace `assets/img/headshot.jpg` with a square image under 300 KB.
- **Preview image:** `assets/img/og-image.png` (1200×630) is what LinkedIn and Slack show. Regenerate it if your title or photo changes.

## Adding a build

1. Copy `builds/momentum.html` to `builds/<name>.html`.
2. Update the title, tag, fact chips, the mini-prototype, the 3 decision-map nodes and the sections. Each panel `id` must be `<name>-<section>`, and each decision-map link points at one of those ids.
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
| Boot sequence | Automatic on `home.html`: log lines type in, the graph links up, the name decodes, then Enter/scroll flies the photo into the hero. Skip button + skip link; everything shows at once with reduced motion; slide-up on phones |
| Decode text | `data-decode` on any short text: scrambles into the real text when it scrolls into view |
| Counters | `data-count="10"` on a number, with the real value as its text |
| Reveal / stagger | `data-reveal` fades an element in; add `data-stagger` to animate its children one by one |
| Card glow + tilt | Class `card-hover` (mouse/trackpad only) |
| Flip cards | `.flip` > `.flip-inner` > `.flip-front` + `.flip-back`: flips on hover/keyboard focus, tap on touch |
| Linger | Principle and loop details stay ~1.5 s after the pointer leaves (`--linger` in styles.css) |
| Mini-prototypes | `data-live` on a `.proto`: animates only while on screen |
| Warp | Nav links, ⌘K sections and "See builds": scan-line sweep with the section name, then the section lights up as it arrives |
| Quote rotator | `data-rotator`: arrows, dots, "Read more"; pauses while hovered, focused or expanded |
| Ticker, career line, motifs | Pure CSS (`.ticker`, `.path`, `.art`) |
| Accordions | `.cs-section` on build pages; `aria-expanded="true"` opens one by default. Links to a panel id open that section |
| Copy email | `data-copy="you@example.com"` on a mailto link: copies it and still opens the mail app |
| Jump menu | ⌘K (Ctrl K on Windows) or the ⌕ button |
| Light/dark | Light by default (the boot screen is always dark); the ◐ button switches and remembers the choice |

**When something fails:**
- Reduced-motion users get final states with no movement.
- Without JavaScript, all content shows: the boot screen is a static first section, and every quote is listed in full.
- A missing headshot becomes an "RW" tile.
- If GSAP or the fonts fail to load, the site falls back to CSS animation and system fonts.

## Before you publish

```bash
grep -rn "EDIT ME" --include="*.html" .           # remaining fill-in spots (hidden comments)
grep -c 'data-nav-toggle' *.html builds/*.html    # header copies in sync
```

`og:image` and `og:url` in `home.html` and `index.html` point at **https://rayportf.vercel.app**. If you add a custom domain, update them (LinkedIn ignores relative image paths).

## Deploy

Live at **https://rayportf.vercel.app** (Vercel project `rayportf`, from the `RayPortfolio` GitHub repo). Every push to `main` goes live automatically.
