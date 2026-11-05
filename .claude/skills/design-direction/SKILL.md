---
name: design-direction
description: Raymond's portfolio visual direction (editorial, not "AI-looking"). Use before any change to the site's look, layout, type, colour or motion.
---

# Design direction: editorial, human, quiet

The site should read like a thoughtful magazine profile of a product manager, not a generated "AI" landing page.

## Type
- **Fraunces** (`--serif`): name, headlines (h1–h3), big numbers, quotes, the contact email. Italic Fraunces in the accent colour is the one emphasis move (e.g. `.grad`).
- **Source Sans 3** (`--font`): everything else, including small labels (uppercase + light letter-spacing only for tiny kickers).
- **Mono** (`--mono`, system fonts only): only inside build mock-ups (`.proto`) and `kbd`.

## Colour
Warm paper and ink with one accent. Tokens live in `assets/css/styles.css`:
- Light: bg `#f6f2ec`, surface `#fffdf9`, text `#1d1a16`, accent terracotta `#a8461f`.
- Dark: bg `#15130f`, text `#ede6db`, accent `#e3895e`.
- Tone colours (`--g-*`) are muted slate / plum / sage / ochre. Every text colour must stay ≥ 4.5:1 on bg, surface and bg-soft in both themes.

## Avoid
- Neon glows (`0 0 Npx` coloured shadows), gradient text, two-colour gradients.
- Terminal motifs: `> commands`, log lines, blinking cursors, "init/boot/ok".
- Scramble/decode text, glitch effects, cursor-follow glows, 3D card tilt, dot or line grids behind content.
- Generic "AI startup" fonts (Space Grotesk, Inter, JetBrains Mono for UI text).

## Motion
Calm and purposeful: fades and short rises, transform/opacity only, nothing that plays while a panel is sliding. Respect reduced motion.

## References
Look for editorial portfolios on godly.website, siteinspire.com and minimal.gallery; check type pairings on typewolf.com and fontsinuse.com. If the owner shares links, match their feel rather than copying layouts.
