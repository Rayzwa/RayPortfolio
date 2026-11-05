# 05 · Project Plan — how & when

> **Summary:** Six phases, from clean-up to optional extras. Content comes before the Unfold build, because the card's words drive its layout. Tick boxes as you go.
> **Status:** Draft v1 · 2026-11-02 · Owner: Raymond Wang
> **Related:** [PRD](01-PRD.md) · [Positioning](02-POSITIONING.md) · [Design](03-DESIGN.md) · [Tech](04-TECH.md)

> **Status 2026-11-04:** at the owner's request, the phases were built in one pass instead of gated. Done: Phase 0 code, résumé-aligned content, the Unfold intro, P1 delight (timeline, card glow, decision maps, page transitions), 404 page, docs merge, headshot, link-preview image, ⌘K menu. Deployed to GitHub (RayPortfolio) for Vercel. **Redesign 2026-11-04:** dark console theme, one-minute home page, Builds pages, motion system (decode, type-on, ticker, tilt, career line, quote rotator), dead-code purge. **Still needs you:** build reflections (`EDIT ME`); delete the duplicate Vercel projects (`rayport`, `rayportfolio`).

---

## Overview

| Phase | Scope | Effort | Done when |
|---|---|---|---|
| 0. Clean-up | Fix what's broken; delete dead code (**code done 2026-11-02**; assets & decisions pending) | ~1 day | No placeholders; nav check passes; Lighthouse Accessibility ≥ 95 |
| 1. Positioning & content | Story, copy, case study #1, quotes | ~1 week (writing) | Disclosure review done; copy final |
| 2. Unfold | Intro card + transition + guardrails | 2–3 days | All PRD acceptance tests pass |
| 3. Delight (P1) | Timeline, flip cards, decision map, spotlight, View Transitions | 3–4 days | Each passes the motion rule; perf budget held |
| 4. Launch | Deploy, 404, og image, share test | ½ day | Live URL preview renders correctly |
| 5. P2 (optional) | ⌘K, constellation, teardown | Later | — |

## Dependencies

```
Phase 0 ──▶ Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4 ──▶ Phase 5
              │            ▲
              └─ headshot ─┘   (needed before Flip polish)
Positioning ──▶ copy ──▶ card layout
Disclosure review ──▶ case study published
```

---

## Phase 0 · Clean-up

**Content / assets**
- [x] Replace `resume.pdf` with the real résumé (now `Raymond_Wang_Resume.pdf`)
- [x] Add `assets/img/headshot.jpg` (600×600, ≤ 300 KB), or ship the monogram fallback (800×800, 95 KB)
- [x] Remove fake metrics from both case-study Outcome sections
- [x] Hide Work and Insights sections until real content exists (Work now has 2 real case studies; Insights hidden)
- [x] Trim the skills list to what you can back up (now taken from the résumé) ([Positioning §6](02-POSITIONING.md#6-proof-gaps--plan-to-close-them))

**Code** (details in [Tech §3–5](04-TECH.md#3-code-audit-dead-code-to-delete))
- [x] Add the ☰ menu button to every sub-page (T5 attributes included)
- [x] Darken `--text-mute` ([Design §3](03-DESIGN.md#3-tokens))
- [x] Theme bootstrap in `<head>` (T4) and save-on-toggle only (T3)
- [x] Delete dead code (filter grid JS + CSS, `.kpis`, `.mt-2/3`)
- [x] Replace inline `onerror` with a shared fallback handler (T9)
- [x] Inline `style=""` → classes ([Design §7](03-DESIGN.md#7-consistency-fixes))
- [x] Consistency: "Résumé" everywhere, "← Previous" arrow, Skills in every nav
- [ ] Root URL: rename `home.html` → `index.html` (or add og tags to stubs); absolute og:image

**Exit check**
- [ ] `grep -rn "EDIT ME\|PLACEHOLDER\|Add assets/img" --include="*.html" .` prints nothing
- [x] `grep -c 'data-nav-toggle' *.html */*.html` counts all match
- [ ] Lighthouse Accessibility ≥ 95

## Phase 1 · Positioning & content

- [ ] Confirm target roles ([Positioning §1](02-POSITIONING.md#1-target-roles))
- [ ] Finalize the positioning statement and 3 key messages
- [x] Rewrite hero, about, impact copy against the voice rules
- [x] Write the intro-card copy: one-liner and 3 facts (≤ 12 words for the one-liner)
- [x] Draft case study #1 in the existing accordion template (Momentum + GrowingED, résumé facts only)
- [ ] Disclosure review of case study #1 with your manager ([Positioning §7](02-POSITIONING.md#7-disclosure-guardrails))
- [ ] Request 2 named testimonials
- [x] Take or choose the headshot

## Phase 2 · Unfold

- [x] Intro-card markup at the top of home (in HTML, not injected: G5/G6)
- [x] Aurora background (CSS first; canvas only if needed)
- [x] `intro.js` state machine: `card → unfolding → site`
- [x] Triggers: Explore, Enter/Space, first scroll (once only, G7)
- [x] GSAP Flip transition; CSS fallback if GSAP is missing (G11)
- [x] Guardrails: skip link (G1), session skip (G2), deep links (G3), reduced motion (G4), replaceState (G8), focus + aria-live (G9), monogram (G10), mobile slide-up (G12), print (G13)
- [x] Compact sticky nav after the unfold
- [ ] Run the full acceptance matrix ([PRD §9](01-PRD.md#9-acceptance-tests))

## Phase 3 · Delight (P1)

For each feature: build → check the motion rule → check reduced motion → re-run Lighthouse.
- [x] Self-drawing career timeline
- [x] Flip-to-example principle cards
- [x] Decision map on case study #1
- [x] Cursor spotlight/tilt on work cards (fine pointers only)
- [x] View Transitions between home and case studies
- [x] Remaining Tech fixes: T1, T2, T6, T7, T8, T10

## Phase 4 · Launch

- [ ] Move the public site into `site/` (or set the publish directory) so `docs/` stays private
- [x] Add `404.html`
- [x] Create `og-image.png` (1200×630) — absolute URL still needed once there's a domain
- [ ] Deploy (GitHub Pages or Netlify)
- [ ] Pre-deploy checklist ([Tech §8](04-TECH.md#8-testing))
- [ ] Paste the URL into a LinkedIn post draft and check the preview
- [ ] Optional: GoatCounter analytics
- [x] Merge README + CONTENT.md into one README ([Tech §10](04-TECH.md#10-docs-hygiene))

## Phase 5 · P2 (optional)

- [x] ⌘K command palette
- [ ] Skills constellation
- [ ] Annotated product teardown (also closes the "no public artifact" proof gap)

---

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-11-02 | Intro is a **card that unfolds** into the full site | Quick intro for recruiters, depth on demand |
| 2026-11-02 | **Vanilla + small CDN libs** (GSAP) | No build step; Flip/ScrollTrigger do the hard motion |
| 2026-11-02 | **Keep static header/footer copies** + sync checklist | Simplest; works without JS |
| 2026-11-02 | Planning docs live in `docs/` as 5 Markdown files | Editable alongside the code |
| _open_ | Target roles | See Positioning §8 |
| _open_ | Keep testimonials section? | Depends on getting named quotes |
| 2026-11-04 | Keep `home.html`; add preview tags to the root stub instead of renaming | Owner chose the names deliberately |
| 2026-11-04 | Title matches résumé: **Product Analyst** | Site and downloadable résumé must agree |
| 2026-11-04 | Phone number on the public résumé is OK | Owner decision |
| 2026-11-04 | First case studies: Momentum + GrowingED | Publicly shareable at résumé level of detail |
| 2026-11-04 | Insights hidden until a teardown exists | No "coming soon" sections |
| 2026-11-04 | Phases built in one pass | Owner request |
| 2026-11-04 | Redesign: dark "console" look, visual over wordy, no visible section headings | Owner feedback: too wordy, not "AI" enough |
| 2026-11-04 | "Case studies" → **Builds**; list page and Insights removed | Home shows every build; no empty sections |
| 2026-11-04 | Testimonials → one rotating quote | Fewer words; keeps the existing quotes |
| 2026-11-04 | Intro card → **product boot sequence** (always dark), site **light by default** | Owner: more immersive opening that shows details first |
| 2026-11-04 | Headline "stakeholder needs"; flip stat cards (50 stakeholders · team of 10 · 2 lending teams) | Owner-provided facts |
| 2026-11-04 | Principles 05–06 (lifecycle), linger on hover; nav "warp" transitions; 4 quotes with Read more; animated mini-prototypes + Loop strip | Owner: eye-catching, reads as a PM at a glance |
| 2026-11-04 | Live domain: rayportf.vercel.app (absolute og:image/og:url) | Owner confirmed |
| 2026-11-04 | Desktop (≥ 900×620) becomes full-screen **panels**; phones keep scrolling; warp overlay removed | Owner: transitions felt stiff, sections bled into view |
| 2026-11-04 | Builds → **showcase stage** (selector + one build at a time); added Loan Portfolio RAG agent (internal; answers from the Insight warehouse of releases and how-tos) | Owner: builds looked unpolished |
| 2026-11-04 | Boot sequence opens the site by itself (countdown, pauses on hover/focus) and follows the site theme | Owner: having to click Enter and the dark → light switch felt off |
| 2026-11-04 | Smoothness pass from the owner's screen recording (freezes at the intro exit, ~8 fps on a panel switch): GSAP removed; intro exit is compositor-only (Web Animations API); panel switches do one layout and defer effects until landed; no backdrop blur / mask-image / large shadows in moving areas | Frame analysis of the recording + Chrome trace: long tasks 5 → 1, layout 203 → 98 ms |
| 2026-11-04 | **Editorial restyle**: Fraunces + Source Sans 3, warm paper/terracotta palette, no glows/gradients/scramble/tilt, intro becomes a photo-and-name reveal | Owner: the site felt too AI-generated |
| 2026-11-04 | Performance pass: compositor-only cursor glow, no SVG filters on animated nodes, loop pulse on transform, hidden panels don't render | Owner: avoid lag |
