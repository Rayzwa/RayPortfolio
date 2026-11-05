# Raymond Wang — Portfolio

A fast, light-by-default portfolio with an editorial look (Fraunces headlines, Source Sans 3 text, warm paper and terracotta), built with plain HTML, CSS and vanilla JavaScript. No build step. No JavaScript libraries; the only external files are two Google Fonts, and the site still works if they fail to load.

Planning docs (PRD, positioning, design, tech, project plan) live in [`docs/`](docs/).

## Preview locally

```bash
cd "/Users/raywang/Desktop/Vibe Coding"
python3 -m http.server 8000
# open http://localhost:8000/home.html
```

The intro shows **once per browser tab**. To see it again, open the page in a new tab or a private window. Links that go straight to a section (e.g. `home.html#builds`) skip it.

## Files

```
home.html                 Main page: intro, then six panels — Home (hero, flip stats, ticker) ·
                          Builds (showcase) · About (loop + principles) · Stack · Path (career + quotes) · Contact
index.html                Redirect stub → home.html (also carries link-preview tags for the bare URL)
404.html                  "Signal lost" page. Uses root-absolute links (/…) because Vercel serves it at any depth
builds/momentum.html      Momentum (JPMC hackathon, 2026)
builds/growinged.html     GrowingED (OwlHack winner, 2023)
Raymond_Wang_Resume.pdf   Résumé linked from every page
assets/css/styles.css     All styling (tokens, components, motion, responsive, print)
assets/js/main.js         Shared behaviour on every page
assets/js/intro.js        The intro (home page only)
assets/img/               Images (see assets/img/README.md)
vercel.json               Redirects: / → home.html, old /case-studies/* links → #builds
docs/                     Planning docs, kept off the website by .vercelignore
```

## Where to edit your content

Use **Cmd+F** on the comment name in `home.html`. There are no line numbers to go stale.

| What | Search for |
|---|---|
| Intro (name, one-liner, the short facts line) | `INTRO` |
| Headline, 3 flip cards (number/label on the front, detail on the back) and the ticker phrases (edit **both** ticker lists, which must match) | `HOME panel` |
| Builds: one selector `<li>` + one `<article class="show-item">` per build (tone class `g-product` / `g-data` / `g-ai` / `g-domain` sets its colour; mini-prototypes are illustrations with mock data) | `BUILDS panel` |
| Lifecycle steps and the 6 principles | `ABOUT panel` |
| Skills (`g-product` / `g-ai` / `g-data` / `g-domain` sets the colour) | `STACK panel` |
| Career line (put `is-now` on the current role) and quotes: `q-short` shows first, optional `q-more` behind "Read more" (give it an `id` and point the button's `aria-controls` at it). Add an `<li>` and a dot appears automatically | `PATH panel` |
| Contact line | `CONTACT panel` |
| Email / LinkedIn | `mailto:` / `linkedin` on every page |
| Unfinished spots | `EDIT ME` (build pages) |

Keep it short. Each panel should fit one laptop screen; the detail lives on the build pages.

### Résumé, headshot, preview image
- **Résumé:** replace `Raymond_Wang_Resume.pdf`, keeping the same file name.
- **Headshot:** replace `assets/img/headshot.jpg` with a square image under 300 KB.
- **Preview image:** `assets/img/og-image.png` (1200×630) is what LinkedIn and Slack show. Regenerate it if your title or photo changes.

## Adding a build

1. Copy `builds/momentum.html` to `builds/<name>.html`.
2. Update the title, tag, fact chips, the mini-prototype, the 3 decision-map nodes and the sections. Each panel `id` must be `<name>-<section>`, and each decision-map link points at one of those ids.
3. In the `BUILDS panel` of `home.html`, add a selector `<li>` (its `href` points at the new article's `id`) and a `show-item` article with a "View build →" link. Fix the prev/next buttons at the bottom of each build page.
   Internal work without a page (like the CRE AI tools and Loan Portfolio RAG agent) just gets the article, with an "Ask me about it →" mailto link instead.
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
| Intro | Automatic on `home.html`: the photo fades in, then the name and facts, then it opens the site by itself after a short countdown (shown as a line on Enter), flying the photo into the hero. Enter/scroll/Skip go straight in; hovering or tabbing to the intro buttons pauses the countdown. Uses the same theme as the site. Everything shows at once (and the countdown runs longer) with reduced motion; slide-up on phones |
| Desktop panels | Automatic at ≥ 900×620: one full-screen panel at a time, switched by nav links, ⌘K, the dot rail, the "next" button, arrow/Page keys, one wheel/trackpad gesture or a swipe. Back/Forward and links like `home.html#builds` work. Smaller screens scroll normally |
| Builds showcase | `data-showcase`: selectors become tabs (click, hover on desktop, arrow keys); a chip row on phones |
| Counters | `data-count="10"` on a number, with the real value as its text |
| Reveal / stagger | `data-reveal` fades an element in; add `data-stagger` to animate its children one by one |
| Card lift | Class `card-hover`: a small lift and accent border on hover |
| Flip cards | `.flip` > `.flip-inner` > `.flip-front` + `.flip-back`: flips on hover/keyboard focus, tap on touch |
| Linger | Principle and loop details stay ~1.5 s after the pointer leaves (`--linger` in styles.css) |
| Mini-prototypes | `data-live` on a `.proto`: animates only while on screen |
| Quote rotator | `data-rotator`: arrows, dots, "Read more"; pauses while hovered, focused or expanded |
| Ticker, career line, loop pulse | Pure CSS (`.ticker`, `.path`, `.loop`) |
| Accordions | `.cs-section` on build pages; `aria-expanded="true"` opens one by default. Links to a panel id open that section |
| Copy email | `data-copy="you@example.com"` on a mailto link: copies it and still opens the mail app |
| Jump menu | ⌘K (Ctrl K on Windows) or the ⌕ button |
| Light/dark | Light by default; the ◐ button switches and remembers the choice (the intro follows it) |

**When something fails:**
- Reduced-motion users get final states with no movement (panels swap instantly).
- Animations use only transform/opacity (the intro exit runs on the compositor via the Web Animations API), and anything off screen (hidden panels, inactive builds) doesn't run. Mock-ups and the chip/career-line effects wait until a panel has finished sliding in.
- Without JavaScript, all content shows: the intro is a static first section, and every quote is listed in full.
- A missing headshot becomes an "RW" tile.
- If the fonts fail to load, system fonts are used. Browsers without the Web Animations API get a simple CSS fade out of the intro.

## Before you publish

```bash
grep -rn "EDIT ME" --include="*.html" .           # remaining fill-in spots (hidden comments)
grep -c 'data-nav-toggle' *.html builds/*.html    # header copies in sync
```

`og:image` and `og:url` in `home.html` and `index.html` point at **https://rayportf.vercel.app**. If you add a custom domain, update them (LinkedIn ignores relative image paths).

## Deploy

Live at **https://rayportf.vercel.app** (Vercel project `rayportf`, from the `RayPortfolio` GitHub repo). Every push to `main` goes live automatically.
