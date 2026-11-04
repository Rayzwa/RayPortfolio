# 01 · PRD — Raymond Wang PM Portfolio

> **Summary:** A 10-second intro card that unfolds into a 3-minute proof of how I think.
> **Status:** Draft v1 · 2026-11-02 · Owner: Raymond Wang
> **Related:** [Positioning](02-POSITIONING.md) · [Design](03-DESIGN.md) · [Tech](04-TECH.md) · [Project Plan](05-PROJECT-PLAN.md)

---

## 1. Overview

**Problem.** The current site works technically but reads as a template. Case studies are placeholders, the Insights section says "coming soon", the résumé is a placeholder PDF, and setup instructions show on the live page. It also feels static: nothing about the experience shows product craft.

**Vision.** Easy to use first, impressive second. A visitor gets the essentials in seconds, then chooses to go deeper. Every animation has to help someone understand something, and none may slow them down.

**One-liner.** *A 10-second intro that opens into a 3-minute proof of how I think.*

## 2. Audiences & jobs-to-be-done

| Audience | Time on site | Job to be done | Served by |
|---|---|---|---|
| Recruiter | 15–30 s | "Who is this, what level, can I get the résumé and contact?" | Intro card (State A) |
| Hiring manager | 3–5 min | "Show me evidence of product thinking." | Unfolded site → one strong case study |
| Peer / mentor | Browsing | "What's this person like? How do they work?" | Principles, insights, tone |

**Design rule:** the card serves the recruiter; the unfolded site serves the hiring manager.

## 3. Goals & success metrics

| Goal | Metric / target |
|---|---|
| Fast access to essentials | Résumé, LinkedIn, email are **1 click** from the card |
| Evidence of product thinking | A real case study within **≤ 2 clicks** |
| Feels fast | LCP **< 2.0 s**, no layout shift (CLS < 0.05), total JS **< 80 KB gzipped** |
| Usable by everyone | **WCAG 2.2 AA**; full keyboard path; reduced motion respected |
| Learn what works (optional) | GoatCounter funnel: page view → unfold → case-study click |

**Non-goals:** CMS, user accounts, WebGL/3D scenes, blog engine, contact form backend.

## 4. Signature experience — "The Unfold"

### State A — Intro card
- Centered card: headshot, name, one-line positioning, 3 quick facts (based in · focus · experience).
- Actions: **Explore →** (primary), Résumé, LinkedIn, Email.
- Subtle animated "aurora" background (soft gradient, slow drift).
- Hint under the card: *"scroll or press Enter"*.

### Transition
- Triggered by: **Explore click**, **Enter/Space**, or **first downward scroll**.
- GSAP Flip, 700–900 ms, ease-out: card edges grow to fill the viewport, the photo and name glide into their positions in the hero/header, and sections stagger in.
- Specs in [Design §4](03-DESIGN.md#4-motion-spec).

### State B — Full site
About · Impact · Work · Insights · Skills · Experience · Contact (sections hidden while empty, see §7).

## 5. Ease-of-use guardrails (blind-spot list)

Each item is a requirement, not a nice-to-have.

| # | Situation | Required behavior |
|---|---|---|
| G1 | Keyboard user | "Skip intro" link is the **first Tab stop** |
| G2 | Returning visitor (same session) | `sessionStorage` flag → land directly on State B |
| G3 | Deep link (`index.html#work`) | Skip the card, scroll to the section |
| G4 | `prefers-reduced-motion` | 150 ms crossfade instead of Flip; no aurora drift |
| G5 | JavaScript off | Card is simply the top of a normal scrolling page; nothing hidden |
| G6 | SEO / no-JS crawlers | All content is in the HTML from the start, **never injected** |
| G7 | Scroll trigger | Fires **once**; never hijacks scrolling afterwards (avoids trackpad-inertia jank) |
| G8 | Back button | Use `history.replaceState`, so Back leaves the site instead of trapping people on the card |
| G9 | Focus after unfold | Move focus to the About heading; announce via an `aria-live` region |
| G10 | No headshot | Monogram tile replaces the photo; Flip still works |
| G11 | GSAP CDN fails | Fallback: CSS class swap with a CSS transition |
| G12 | Small screens (≤ 720 px) | Card is already near full-screen → simple slide-up, not Flip |
| G13 | Printing | Print stylesheet shows State B with all accordions expanded |

## 6. Feature priorities

**P0: must ship**
- Phase 0 clean-up (see [Project Plan](05-PROJECT-PLAN.md#phase-0--clean-up)).
- The Unfold, with every guardrail G1–G13.
- One real, disclosure-safe case study.
- Sticky nav that compacts after the unfold; scroll-progress bar (exists).

**P1: delight that aids understanding**
- **Self-drawing career timeline:** the line draws as you scroll and milestones pop in.
- **Flip-to-example principle cards:** tap a "How I work" card to see a real one-line example.
- **Decision map** per case study: a small SVG (problem → options → chosen path → outcome); hovering a node highlights the matching section.
- **Cursor spotlight / tilt on work cards:** off on touch screens and with reduced motion.
- **View Transitions** between home and case-study pages (falls back to a normal page load).

**P2: frozen until launch**
- ⌘K / Ctrl+K command palette (jump to a section, résumé, email).
- Skills constellation (connected-dot graphic with chips as fallback).
- Annotated product teardown (reuses the lightbox).

## 7. Information architecture

```
index.html  (today's home.html, see Tech §5)
 ├─ State A: intro card
 └─ State B: About · Impact · Work* · Insights* · Skills · Experience · Contact
case-studies/
 ├─ index.html (list)
 └─ case-study-<topic>.html
insights/
 ├─ index.html (list)*
 └─ insight-<topic>.html
404.html
```
\* **Hidden until real content exists.** Never ship a "coming soon" or template section.

## 8. Risks

| Risk | Mitigation |
|---|---|
| JPMorgan disclosure policy limits case-study detail | Write about the problem, approach and decisions, not figures; manager review ([Positioning §7](02-POSITIONING.md#7-disclosure-guardrails)) |
| Over-animation makes it feel gimmicky | Every P1 feature must pass "does this help someone understand?" ([Design §4](03-DESIGN.md#4-motion-spec)) |
| Scope creep delays launch | P2 frozen until Phase 4 ships |
| Content lags behind build | Phase 1 (content) runs before the Unfold build |

## 9. Acceptance tests

Run before every deploy. Full matrix lives in [Tech §8](04-TECH.md#8-testing).

- [ ] Chrome + Safari desktop
- [ ] iPhone width (375 px)
- [ ] Keyboard only (Tab, Enter, Esc)
- [ ] Reduced motion on
- [ ] JavaScript off
- [ ] Dark mode (and no light flash on load)
- [ ] Back button after unfolding
- [ ] Deep link straight to `#work`
- [ ] LinkedIn share preview shows title, description, image
