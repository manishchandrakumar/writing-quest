# Deploy / cutover — v1 portal

This is the runbook for shipping the `portal` branch to `arnav.manishchandrakumar.com`.

## What's in v1

- `/` — Home, Arnav-first: today's mission card, streak, latest coach review preview.
- `/quest` — The tracker (the old `index.html`, refactored — same UI and behavior).
- `/about` — Phases, philosophy, privacy posture.

v2 will add `/reviews` (heatmap), `/worksheets` (browse), `/parent` (trend dashboard), and `/gallery` (auto thumbnail grid). The data plumbing for all of those already exists.

## What changed architecturally

- The repo is now an **Astro** static project. Build: `npm run build` → `dist/`.
- `src/data/reviews.json` is the canonical place reviews land — not the old `<script id="verifiedReviews">` block inside `index.html` (the old root `index.html` was deleted).
- Streak / XP / "Day N done" derive from `reviews.json`. `localStorage` only adds the kid's *extra* "I finished ✓" clicks on top. This means progress survives device switch and the domain change.
- The reviewer skill writes to `public/worksheets/completed/` (renamed from `worksheets/completed/`). Photos are no longer gitignored — they're public-by-design and ship with the site.
- Each `reviews.json` entry must carry a `metrics` object (line target/actual, readability, phase quality, completion, spelling words used, time). The skill rubric collects this already; v1 wires it into the file.

## Setting up Cloudflare Pages (one-time)

You said the domain is on Cloudflare but you haven't connected the Pages project to it yet. Three clicks:

1. **Create/connect the Pages project** at <https://dash.cloudflare.com>:
   - Workers & Pages → Create → Pages → Connect to Git.
   - Repo: `manishchandrakumar/writing-quest`.
   - Production branch: `main`.
   - Build command: `npm run build`.
   - Build output directory: `dist`.
   - Node version: set environment variable `NODE_VERSION=20` (Pages defaults to 18, which is fine for Astro 4 too but 20 matches your local).
   - Save and deploy. You'll get a `*.pages.dev` URL.

2. **Wire the subdomain**:
   - In the Pages project: Custom domains → Set up a custom domain → `arnav.manishchandrakumar.com`.
   - Cloudflare auto-creates the CNAME for you (because the domain is on the same account). SSL provisions in seconds.
   - The portal is live.

3. **Apex stays parked.** Don't add `manishchandrakumar.com` itself to this Pages project — leaving it alone keeps it free for future use.

## Pre-cutover checklist (run from `portal` branch)

- [ ] `npm install` clean (already done locally).
- [ ] `npm run build` succeeds — verified.
- [ ] `npm run preview` and click through `/`, `/quest`, `/about` in a browser. Confirm: streak shows 2, level shows up, both Day 1 + Day 2 reviews appear, path grid renders, chart renders.
- [ ] Open the tracker, click "I finished ✓" on Day 3. Reload. The "+1 click" survives. Refresh again — Day 3 should *still* be marked (localStorage). Now open an incognito window — Day 3 won't be there (no localStorage), Days 1–2 *will* be (reviews.json). That's the expected behavior of the new source-of-truth split.
- [ ] Try `/worksheets/Day_01_Mission_Start.pdf` and `/worksheets/completed/Day_01_Mission_Start_2026-05-11.jpg` — both load.

## Cutover day (do it on a no-review day, e.g. weekend morning)

```bash
# from the portal branch:
git status                                          # confirm clean
git push origin portal                              # push the branch
gh pr create --base main --head portal \
  --title "v1 portal: Astro refactor + Home/Quest/About"
# review the diff, merge it
# Cloudflare Pages picks up main, runs npm run build, deploys
# visit arnav.manishchandrakumar.com — confirm
```

After cutover, **the next time you say "review" to Claude**, the skill will write to `src/data/reviews.json`. The first review on the new system should be a normal day — no special handling.

## If something breaks after cutover

- **White screen / build failed on Cloudflare:** check the Pages build log. Almost always a typo in `reviews.json`. Pull, fix the JSON locally (`npm run build` will tell you the line), push.
- **Old streak gone for Arnav:** that's expected — localStorage is per-origin. Days 1 + 2 will still count because they're in `reviews.json`. Tell him to click "I finished ✓" once on Day 3 and the streak shows 3.
- **Worksheet PDF 404:** check the URL — it's now `/worksheets/Day_NN_Theme.pdf`, served from `public/worksheets/`. No path change from before.

## Notes for future-you (v2 work)

- `/reviews` heatmap: read `src/data/reviews.json`, render 60 squares (one per day), color by phase + done/missed/lite, link each square to `/reviews/day-N`. Empty squares for un-reviewed days.
- `/worksheets`: list `public/worksheets/Day_*.pdf` (Astro `import.meta.glob` works on `public/` via a static manifest). Days 8–60 PDFs need to be generated separately.
- `/parent`: read `reviews.json[].metrics`, render trend lines: line target vs actual, readability over time, phase quality over time, cumulative spelling words. Chart.js is already loaded on `/quest`; load it on `/parent` too via the `loadChart` prop on `Base`.
- `/gallery`: list files in `public/worksheets/completed/` alphabetically (canonical naming = chronological), thumbnail grid, click to enlarge. Build-time file listing via Astro's `import.meta.glob('/public/worksheets/completed/*.jpg', { as: 'url' })` — or a tiny JSON manifest.

The data model already supports all four. Each is a self-contained page + a small render script.
