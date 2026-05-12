# Arnav Quest Tracker — Hosting & Re-upload Workflow

The interactive tracker is built. Now we need to make it accessible to Arnav. Pick one of the three hosting paths below.

---

## Honest reality first: Google Drive can't run HTML

Google Drive can **store** the HTML file but its built-in preview does NOT execute JavaScript. So the Drive "Open" link will show a blank/static page. To make the tracker actually interactive, pick one of these three paths:

---

## Path A — Local file (zero setup, works today)

**Best if**: Arnav uses a single computer/tablet at home.

1. Download the tracker file from Drive (already uploaded — see link below).
2. Save it to Arnav's desktop or a shared family folder.
3. Double-click → opens in browser → fully interactive.
4. He uses it daily. localStorage remembers his progress across reloads.
5. When you upload his worksheet for review, I re-generate the file with verified XP baked in. You replace the file on Drive AND on his desktop (drag & drop).

Drive link (current upload):
https://drive.google.com/file/d/1mQzkQvEiDcTAnjcFEROlXpfGkvPxLkmx/view?usp=drivesdk

Pros: zero setup, no internet needed after load. Cons: file replacement is a manual step after each review.

---

## Path B — Free web host with a real URL (Recommended)

**Best if**: Arnav uses multiple devices, or you want a shareable URL like "arnavquest.netlify.app".

Easiest options, ranked by simplicity:

1. **Netlify Drop** — drag-and-drop hosting, zero account needed for the first deploy.
   - Go to https://app.netlify.com/drop
   - Drag `arnav-quest-tracker.html` onto the page.
   - You get a permanent URL in 5 seconds.
   - To update: drag-drop again to the same site (claim it with a free account first to keep the URL stable).

2. **GitHub Pages** — if you already use GitHub.
   - Create a repo `arnav-writing-quest`.
   - Add `index.html` (rename the tracker file).
   - Settings → Pages → Source: main branch.
   - URL becomes `https://<your-user>.github.io/arnav-writing-quest/`.

3. **Vercel / Cloudflare Pages** — same idea, similar setup.

Pros: real URL, works on any device, easy to update. Cons: 5 minutes of setup.

---

## Path C — Cowork artifact

I can create the same tracker as a Cowork-native artifact that lives inside your Cowork app and refreshes whenever you open it. This stays inside Cowork (Arnav can't open it on his own device without Cowork access), so it works for parents tracking — not for the kid himself.

Tell me "make it a Cowork artifact too" if useful.

---

## The re-upload workflow (after each review)

This is the loop:

1. **Arnav writes** the day's worksheet (printed PDF).
2. **You photograph** the finished page.
3. **You start a Claude session** and say: *"Review Arnav's Day X using the writing reviewer skill in my folder"* — drop the photo.
4. **I produce**:
   - Kid-facing praise (2 specifics + 1 next-time suggestion)
   - Parent-facing scorecard
   - Verified XP number
   - Updated tracker HTML file (same tracker, with the new review baked into the `verifiedReviews` JSON block at the bottom)
5. **You replace** the file on whichever host you picked (Path A/B/C above).
6. **Arnav refreshes** the tracker → sees his new verified review in the "Coach's verified reviews" card, his XP bumped, possibly a new badge or level-up.

The re-generation only changes ONE section in the HTML (the JSON block). His localStorage (self-tracked mission completions, streak, etc.) is preserved across re-uploads — only the coach-verified review feed updates.

---

## What's inside the tracker

| Feature | Behaviour |
|---|---|
| Today's mission card | Prompt, target lines, phase, XP base |
| Mark "I finished" / "Lite day" | Awards XP, advances streak, plays confetti |
| 60-day path | Lesson-style Duolingo path with locked/today/done/boss states |
| Streak fire | Big visible counter — the core hook |
| Level system | 8 levels (Pencil Apprentice → Class 6 Champion) with XP bar |
| Badges | 8 badges auto-earned as Arnav hits milestones |
| XP-over-time chart | Cumulative XP line chart (Chart.js w/ offline fallback) |
| Coach's verified reviews | Reviews I push after each parent upload |
| Reset button | Clears local progress (keeps coach reviews) |

Works on phone, tablet, and desktop. localStorage persists across reloads.

---

## File locations

- Source HTML (full, readable): `arnav-quest-tracker.html` in this folder.
- Drive copy: https://drive.google.com/file/d/1mQzkQvEiDcTAnjcFEROlXpfGkvPxLkmx/view?usp=drivesdk
- For re-uploads, I'll update the Drive file and you re-deploy (or just replace the local copy).
