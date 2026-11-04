# 03 · Design — screens, components, motion, states

> **Summary:** What the site looks like and how it moves. Built on the existing design tokens in `assets/css/styles.css`; adds an intro card, motion tokens and a handful of new components.
> **Status:** Draft v1 · 2026-11-02 · Owner: Raymond Wang
> **Related:** [PRD](01-PRD.md) · [Positioning](02-POSITIONING.md) · [Tech](04-TECH.md) · [Project Plan](05-PROJECT-PLAN.md)


> **Update 2026-11-04 (redesign):** the site moved to a dark "console" look and a one-minute home page. Visible section headings were removed; case studies are now **Builds** (`builds/*.html`); highlights became a ticker; skills a colour-coded chip cloud; experience a 4-step career line; testimonials one rotating quote. Insights, the list page, the vertical timeline and the lightbox were removed. See the README for the current structure.

> **Update 2026-11-04 (boot sequence):** the intro card became a dark product boot sequence (log lines → node graph → name decode → Enter), the site is light by default, stats are flip cards, principles go to 06 and linger after hover, nav links "warp" to sections, builds show animated mini-prototypes, and a Loop strip shows the product lifecycle.

---

## 1. Screens (wireframes)

### 1a. Intro card: desktop
```
┌──────────────────────────────────────────────────────────────┐
│ Skip intro (visible on focus)                         🌙     │
│               ░░ aurora background ░░                        │
│        ┌──────────────────────────────────────┐              │
│        │  ┌──────┐  Raymond Wang              │              │
│        │  │photo │  PM building AI products   │              │
│        │  └──────┘  at JPMorgan Chase          │              │
│        │  NYC · AI products · 2 yrs           │              │
│        │  [ Explore → ]  Résumé  LinkedIn  ✉  │              │
│        └──────────────────────────────────────┘              │
│                 scroll or press Enter ↓                      │
└──────────────────────────────────────────────────────────────┘
```

### 1b. Intro card: mobile (375 px)
```
┌─────────────────────┐
│ RW               🌙 │
│ ┌─────────────────┐ │
│ │     [photo]     │ │
│ │  Raymond Wang   │ │
│ │  PM · AI prods  │ │
│ │ NYC · 2 yrs     │ │
│ │ [  Explore →  ] │ │
│ │ Résumé · in · ✉ │ │
│ └─────────────────┘ │
│   scroll ↓          │
└─────────────────────┘
```

### 1c. The unfold: 3 keyframes
```
t=0ms                 t=400ms                  t=850ms
┌──────────────┐     ┌────────────────────┐   ┌──────────────────────────┐
│   ┌──────┐   │     │┌──────────────────┐│   │RW Raymond Wang  About Work│
│   │ card │   │ ──▶ ││  card growing,   ││──▶│──────────────────────────│
│   └──────┘   │     ││  photo moving ↖  ││   │ Hero  [photo]            │
│              │     │└──────────────────┘│   │ About ▸ fades/staggers in │
└──────────────┘     └────────────────────┘   └──────────────────────────┘
```

### 1d. Home (State B)
Header (compact) → Hero (photo + positioning) → About & principles → Impact → Work* → Insights* → Skills → Experience timeline → Contact → Footer. (\* hidden until real content)

### 1e. Case-study page
Breadcrumb → title + read-time → quick facts → **decision map (P1)** → accordion sections (Context → Problem → Role → Discovery → Strategy → Execution → Outcome → Reflection) → prev/next.

### 1f. 404 page
Card-style: "This page doesn't exist." with buttons for Home and Case studies. Same header/footer.

## 2. Component inventory

**Existing (reuse; all in `assets/css/styles.css`)**
`.card` / `.card-hover` · `.chip` / `.chip-accent` · `.btn-primary` / `.btn-ghost` / `.btn-sm` · `.principle` · `.timeline` · `.metric` / `.metric-strip` · `.cs-section` accordion · `.toast` · `.lightbox` · `.progress-bar` · `.to-top` · `.contact-card` · `.quick-facts`

**New**

| Component | Purpose | Notes |
|---|---|---|
| `.intro-card` | State A card | Monogram fallback when no headshot |
| `.aurora` | Background graphic | CSS gradients or `<canvas>`; paused when tab hidden |
| `.skip-link` | Skip intro / skip to content | Visible on focus only |
| `.flip-card` | Principle with an example on the back | Button semantics; `aria-pressed` |
| `.decision-map` | Inline SVG per case study | Nodes link to accordion sections |
| `.cmdk` | ⌘K palette (P2) | Dialog; focus trap |

## 3. Tokens

**Keep:** all color, radius, shadow and spacing tokens.

**Fix:**

| Token | Now | New | Why |
|---|---|---|---|
| `--text-mute` (light) | `#8089a0` (≈ 3.5:1 on white) | ≈ `#5f6880` (≥ 4.5:1) | WCAG AA for body copy that uses `.muted` |

**Add:**
```css
--dur-fast: 150ms;
--dur:      300ms;
--dur-slow: 800ms;
--ease-out: cubic-bezier(.16, 1, .3, 1);
--font-display: "Inter Tight", var(--font);   /* headlines only, via Google Fonts */
```

## 4. Motion spec

**Rules:** animate `transform` and `opacity` only · one "hero moment" per page · never block input · every animation must answer "what does this help someone understand?"

| Animation | Trigger | Duration / easing | Reduced-motion fallback | Helps the visitor understand… |
|---|---|---|---|---|
| Unfold (Flip) | Explore / Enter / first scroll | 700–900 ms, `--ease-out` | 150 ms crossfade | "This card *is* the site; there's more inside" |
| Section stagger | After unfold | 60 ms stagger, 300 ms each | Instant | Reading order |
| Aurora drift | Always (State A) | 20 s loop | Static gradient | Brand mood (decorative; must stay subtle) |
| Scroll reveal | Section enters viewport | 600 ms (exists) | Instant (exists) | Progression |
| Timeline draw (P1) | Scroll-linked | Follows scroll | Line fully drawn | Career progression over time |
| Flip card (P1) | Click / Enter | 400 ms | Crossfade | Principle → real example |
| Decision map highlight (P1) | Hover / focus node | 150 ms | Same (no motion) | How the decision flowed |
| Card spotlight / tilt (P1) | Pointer move (fine pointers only) | Follows pointer | Off | Clickability |
| Page transition (P1) | Navigating between pages | 300 ms | None | Continuity between pages |

## 5. States (every component)

| State | Rule |
|---|---|
| Default / hover / focus / active | Focus ring always visible (`:focus-visible` exists); hover never the only cue |
| Empty | **Hide the section.** No "coming soon" boxes, no dashed placeholders |
| Loading (images) | Reserve space with `width`/`height` or `aspect-ratio`; soft gradient while loading |
| Error (missing image) | Designed fallback (monogram, gradient tile). **Never show instruction text** like "Add assets/img/…" |

## 6. Responsive rules

- Breakpoints: **900 px** (hero stacks, grids go to 2 columns) · **720 px** (☰ menu, 1 column) · **480 px** (smaller type, centered footer).
- Touch targets ≥ **44 × 44 px**.
- **The ☰ menu button must exist on every page** (currently only on home).
- Hover-only effects are off for `(hover: none)`.

## 7. Consistency fixes

| Issue | Fix |
|---|---|
| "Résumé" (sub-pages) vs "Resume" (home) | Pick **"Résumé"** everywhere |
| "Previous case study →" points the wrong way | "← Previous case study" |
| Sub-page navs lack **Skills** | Same nav links on every page |
| 48 inline `style=""` attributes across 5 pages | Replace with classes, e.g. `.card-link`, `.page-main`, `.mt-0`, `.lead-narrow` |
| Footer "Built with plain HTML, CSS & JS" | Optional: fine for a PM portfolio but takes footer space; decide during the copy pass |
