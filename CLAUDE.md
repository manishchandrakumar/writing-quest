# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A static **Astro** portal and printable PDFs for a personalised 60-day writing program for **Arnav Kashyap** (Class 5, age ~10). The build target is `dist/`; Cloudflare Pages runs `npm run build` on push to `main` and deploys the result to `arnav.manishchandrakumar.com`. Local preview is `npm run dev`.

Read `README.md` (program overview), `WORKFLOW.md` (daily loop), and `.skills/arnav-writing-reviewer/SKILL.md` (the review rules — load this any time you're reviewing work) before doing non-trivial work.

## The daily loop (what "review" means)

The user (Manish) drops a photo of Arnav's completed worksheet and says **"review"**. That single word is the trigger for the `arnav-writing-reviewer` skill. The end-to-end flow:

1. Find the newest photo in `public/worksheets/completed/` that does **not** match `Day_NN_Theme_YYYY-MM-DD.jpg`. That's the unprocessed one.
2. Rotate / normalise / resize to ~1600px long edge (iPhone photos arrive landscape) and rename to the canonical pattern.
3. Read the worksheet header to identify Day N and theme — don't assume from memory.
4. Apply phase-aware review (see below), produce 2 specific praises + 1 forward-framed suggestion, compute XP, fill the `metrics` scorecard.
5. **Patch `src/data/reviews.json`**: append a new entry to the `verified[]` array including the `metrics` block. Bump `lastUpdated` to today. (The Astro build fails on malformed JSON, which catches errors before they reach production.)
6. Tell Manish to run `./tools/sync.sh`. Don't run it yourself unless asked.

Full rubric, XP formula, output format, edge cases: `.skills/arnav-writing-reviewer/SKILL.md`.

## Phase rules — the load-bearing constraint

The program's success depends on **phase-appropriate feedback**. Each phase defines what you may critique; everything else must be silently accepted even if visible.

| Days | Phase | Critique ONLY | Never mention |
|---|---|---|---|
| 1–14 | Fluency | Finished? Readable? Effort. | Spelling, grammar, neatness, punctuation |
| 15–21 | Story mode | Idea/story flow (max 1 spelling word) | Handwriting, complex grammar |
| 22–35 | Paragraph shape | Structure + spelling | Sentence variety |
| 36–42 | Explain | Structure + connectors | Tone |
| 43–49 | Timed | Speed + structure | Style |
| 50–56 | Opinion | Reasons + example | Flourish |
| 57–60 | Class 6 prep | Full structure + 1 grammar point | Anything outside the week's goal |

**Hard rule:** *fluency before perfection, confidence before correction, momentum before neatness.* If Arnav is on Day 1–14 and spelling is bad, you do not mention spelling. Not in kid-facing text, not in parent-facing text (the parent block has a separate "What NOT to bring up to Arnav" section for that).

Every review is **exactly 2 specific praises + at most 1 suggestion**. Praise must quote an actual word/line/moment ("specific = irreplaceable"). Suggestion is always future-framed ("next time…"), never past.

## Architecture (Astro portal)

```
src/
  data/
    days.json         — the 60-day program (immutable: prompt, line target, phase, boss flag)
    reviews.json      — verified reviews; the ONLY file reviews modify
  styles/global.css   — tokens + every class used across the portal
  layouts/Base.astro  — html shell, top bar, footer, font + optional Chart.js
  components/         — Brand, TopBar
  pages/
    index.astro       — Home: today's mission + streak + CTA (server-rendered, hydrates)
    quest.astro       — The tracker (the original index.html, refactored)
    about.astro       — Phases, philosophy, privacy
  scripts/quest.js    — All tracker behavior (path grid, modal, chart, mark-done, confetti)
worksheets/           — Public PDFs (blanks) + completed/ (real photos, publicly committed)
tools/sync.sh         — Stage + commit + push. Unchanged.
```

**Source of truth for "Day N is done":** `reviews.json`. If `reviews.json` has an entry for Day N, it counts toward streak + XP regardless of device, cache state, or domain. `localStorage` (`arnav_quest_v1`) only adds the kid's *extra* "I finished ✓" clicks for days not yet reviewed; it never subtracts from verified state. This means streak survives device switch and the apex-to-subdomain move.

**When editing `reviews.json`:** preserve valid JSON. Astro parses it at build time; a syntax error breaks the Cloudflare Pages build, which is preferable to a white-screened production site.

## Common commands

```bash
npm install                      # one-time after clone or after package.json changes
npm run dev                      # local preview at http://localhost:4321
npm run build                    # build to dist/ — fails loudly on bad JSON in reviews.json
./tools/sync.sh                  # stage + commit (auto-detects "Day N verified review") + push
./tools/sync.sh "custom message" # same, with a custom commit message
```

Cloudflare Pages runs `npm run build` on push to `main` and serves `dist/`. Redeploy takes ~30s.

## Privacy posture (read carefully)

The portal is **public** — `arnav.manishchandrakumar.com` serves the home page, tracker, and about page to anyone with the URL. v2 will add reviews archive, worksheets browser, parent dashboard, and gallery — also public. This is intentional. Things that are public-by-design:

- Arnav's first name, school city, friends' first names (Arsh, Varad)
- Verified review text including direct quotes of his writing
- The `metrics` block (line targets vs actual, readability scores, etc.)
- Completed worksheet photos under `public/worksheets/completed/` (committed publicly once v2 ships the gallery)

Things that stay out of the commit:

- Raw `IMG_*.jpg`/`IMG_*.jpeg` exports — only the canonical `Day_NN_Theme_YYYY-MM-DD.jpg` files (after the reviewer skill rotates/resizes/renames) get committed.
- Anything Manish flags as private during a review.

If the privacy posture changes — e.g. Manish asks for the dashboard to be gated — see the v2 plan; the architecture supports it via Cloudflare Access without a code rewrite.

## Cloudflare Pages headers

`_headers` (root) is applied automatically on deploy. v1 deletes the per-file cache rules — Cloudflare serves Astro's built assets with content-hashed filenames, so the default `Cache-Control` is correct for them; only worksheet PDFs keep a long cache.
