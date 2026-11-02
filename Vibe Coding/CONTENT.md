# CONTENT.md — Where to edit YOUR information

This file is a map. It tells you **exactly which file** holds each piece of your content and **what to type**. You edit these files in a text editor (VS Code), not in the browser. Only change the words *between* the `< >` tags — never delete the tags themselves.

> Quick preview while editing:
> ```bash
> cd "/Users/raywang/Desktop/Vibe Coding"
> python3 -m http.server 8000
> ```
> Then open http://localhost:8000/home.html and refresh after each save (Cmd+S).

---

## File names (renamed so nothing is called `index.html` twice)

Each page now has a distinct, descriptive filename instead of three files all named `index.html`:

| File | What it is | Lines |
| --- | --- | --- |
| `home.html` | **Your main page** — hero, about, impact, work, insights, skills, testimonials, experience, contact | ~263 |
| `case-studies/case-studies-list.html` | The **list** of your case studies (cards linking to each one) | ~58 |
| `insights/insights-list.html` | The **list** of your teardowns/essays | ~37 |

**Most of your content is in `home.html`.** When you open VS Code, click the top-level `home.html` (it sits just above the `assets`, `case-studies` and `insights` folders) — not the files nested inside those folders.

> ⚠️ Because these aren't named `index.html` anymore, a web server won't auto-serve them for a bare folder URL (e.g. `/case-studies/` won't work). Link directly to the full filename, e.g. `case-studies/case-studies-list.html`. All the in-page links in this project already do this.

---

## The 5 files you can put content in

| File | Put your content here |
| --- | --- |
| `home.html` | Name, headline, bio, principles, highlights, case-study cards, insights cards, skills, testimonials, experience timeline, contact |
| `case-studies/case-study-activation.html` | The full write-up of case study #1 (activation problem template) |
| `case-studies/case-study-selfserve.html` | The full write-up of case study #2 (self-serve flow template) |
| `case-studies/case-studies-list.html` | The one-line summaries shown in the case-study list |
| `insights/insights-list.html` | Your product teardown / essay text |

Files you **don't** need to touch: `assets/css/styles.css` (styling), `assets/js/main.js` (interactivity), `README.md`, `CONTENT.md`, `resume.pdf` (replace the file itself).

---

## Map of `home.html` (your main page)

Line numbers are for reference; press **Cmd+F** and search the section name or **`EDIT ME`** to jump there.

| Section | Around line | What to type |
| --- | --- | --- |
| Page title (browser tab) | 6 | Your name |
| Social-share title/description | 10–11 | Your name + one-line pitch |
| Nav bar (name + monogram) | 22 | `Raymond Wang` and `RW` → update if your name changes |
| Hero: status line | 44 | e.g. current role/company |
| Hero: big headline | 45 | Your name + a one-line claim |
| Hero: positioning paragraph | 46 | 2–3 sentences about what you do |
| Hero: LinkedIn link | 50 | Your LinkedIn URL |
| Hero: Based in / Focus / Experience | 53–55 | City, focus areas, years |
| Headshot | 59 | (drop `assets/img/headshot.jpg` in — see `assets/img/README.md`) |
| **About** — bio | 71–72 | Bio (2 paragraphs) |
| **About** — principles | 79–82 | Your 3–5 "how I work" principles |
| **About** — links | 74–75 | LinkedIn URL + your email (twice) |
| **Impact** — lead-in | 93–94 | One line above the highlights |
| **Impact** — highlights | 97–99 | Qualitative highlights (swap for real metrics once you have them — see note below) |
| **Work** — card 1 & 2 | 112–123 | Case-study titles + one-line summaries (currently template placeholders) |
| **Insights** — card | 139–144 | Teardown/essay title + summary (currently "coming soon") |
| **Skills** — chips | around 157–192 | Your tools/skills |
| **Testimonials** — quotes | around 206–214 | 2–3 quotes + names/roles |
| **Experience** — timeline | 229–231 | Your roles, dates, companies |
| **Contact** — email/LinkedIn | 244–246 | Your email + LinkedIn |
| Footer | 257 | Your name |

### ⚠️ Replace the Impact highlights with real metrics once you have them
The Impact section (lines **96–99**) currently shows qualitative highlights instead of numbers, since none were confirmed yet. Once you have real, shareable metrics, you can restore the animated-counter format used elsewhere (e.g. in the case-study Outcome sections):
```html
<div class="num" data-count="35" data-prefix="+" data-suffix="%">+35%</div>
```

---

## Map of the case-study + insights files

### `case-studies/case-study-activation.html` and `case-study-selfserve.html`
Each has 8 collapsible sections, in order, all tagged `EDIT ME`:
1. **Context** — product, users, business situation
2. **The problem** — user need + a baseline number
3. **My role** — what you owned vs. contributed
4. **Discovery & the key insight** — how you learned it + the one-line reframe
5. **Strategy & tradeoffs** — what you did and what you *didn't* do
6. **Execution** — how you shipped it
7. **Outcome** — the metrics (same `data-count` format as above)
8. **What I'd do differently** — your reflection

Also update: page `<title>` (line 6), nav name (line 14), the "Status" row (line 36), and the footer (last lines).

### `case-studies/case-studies-list.html` and `insights/insights-list.html`
Update the `<title>`, the intro paragraph, and the card titles/summaries (search `EDIT ME`).

### `resume.pdf`
Delete the placeholder and drop in your real résumé **keeping the name `resume.pdf`** so all the download links keep working.

---

## Fill-in checklist (gather these, then edit)

- [ ] Full name + initials (monogram)
- [ ] Title + one-line positioning
- [ ] Email + LinkedIn URL
- [ ] City, focus areas, years of experience
- [ ] Headshot image (`assets/img/headshot.jpg`, 600×600)
- [ ] 2–3 sentence bio
- [ ] 3–5 "how I work" principles
- [ ] 3–5 headline metrics
- [ ] 2–4 case studies (context → outcome → reflection)
- [ ] 1+ product teardown/essay
- [ ] Skills & tools list
- [ ] 2–3 testimonial quotes (name + role)
- [ ] Roles + dates (experience timeline)
- [ ] Résumé PDF

---

## Handy commands

```bash
cd "/Users/raywang/Desktop/Vibe Coding"

grep -rn "EDIT ME" .                    # list every fill-in spot
grep -rn "Your Name\|YN\|your-handle\|you@example.com" .   # find all placeholders

python3 -m http.server 8000             # preview at http://localhost:8000/home.html
```