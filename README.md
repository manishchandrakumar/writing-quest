# Writing Quest

A personalised 60-day writing improvement program for a Class 5 student, built on a Duolingo-style streak / XP loop.

**Live tracker:** *(coming soon — pointed at the booked domain)*

## What's in this repo

| Path | Purpose |
|---|---|
| `index.html` | The interactive tracker — streak, XP, 60-day path, 8 levels, badges, "Coach's verified reviews" panel. Self-contained, no build step. |
| `worksheets/` | Printable A4 worksheets for Days 1–7 (Week 1). Each one is a single-page warm-up + speed drill + main mission + self-check. |
| `docs/` | The full program PDF/DOCX, the XP/streak Excel tracker, and the hosting README. |
| `.skills/arnav-writing-reviewer/` | Claude/Cowork skill that reviews handwritten worksheet photos. Phase-aware (Phase 1 = effort only, no spelling critique). |

## The system in one paragraph

20–25 min per day. Each day Arnav prints the worksheet, writes the warm-up + speed drill + main mission (3 → 20 lines, growing each week), self-marks completion in the tracker (`I finished ✓`), and earns XP. A parent photographs the page, uploads it to a Claude session with the reviewer skill, and gets back two specific praises + one suggestion + a verified XP number, which gets baked into `index.html`'s embedded `<script id="verifiedReviews">` JSON block and pushed back to the site. Arnav refreshes the page, sees the verified review and updated streak.

## Phase rules

| Phase | Days | Review focuses on | Ignored (for now) |
|---|---|---|---|
| 1 — Fluency | 1–14 | Did he finish? Readable? Effort? | Spelling, neatness, grammar |
| 1 — Story mode | 15–21 | Idea flow | Handwriting style |
| 2 — Structure | 22–35 | Paragraph shape + spelling | Sentence variety |
| 2 — Explain | 36–42 | Structure + connectors | Tone |
| 3 — Timed | 43–49 | Speed + structure | Style polish |
| 3 — Opinion | 50–56 | Reasons + example | Stylistic flourish |
| 3 — Class 6 prep | 57–60 | Full structure + 1 grammar point | Anything outside that week's goal |

Hard rule: **fluency before perfection, confidence before correction, momentum before neatness.**

## Tracker features

- **60-day path** in 3 phase tabs (Fluency / Structure / Independence), with locked / today / done / boss states.
- **Streak fire** — primary kid-facing motivator.
- **8 levels**: Pencil Apprentice → Word Cadet → Sentence Knight → Paragraph Mage → Spelling Sentinel → Story Captain → Opinion Warrior → Class 6 Champion.
- **8 badges** auto-unlocked at milestones.
- **XP-over-time line chart** (Chart.js via CDN + offline fallback).
- **Coach's verified reviews** panel.
- **localStorage** persistence across reloads. Verified-review data is embedded in the HTML and merged on load.

## Hosting

This repo is deployed via Cloudflare Pages. Any change to `index.html` (e.g., a new verified review) auto-deploys on `git push`.

## License

Personal project. Code is available under the MIT License (see `LICENSE`) — use the structure freely if it's useful for another kid.
