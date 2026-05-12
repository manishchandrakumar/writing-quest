# Daily workflow — one-command edition

The whole loop is now **three things**:

1. **Drop** the day's worksheet photo (either way works):
   - Save it to `public/worksheets/completed/` *(any filename — Claude renames it)*, or
   - Drag it into the Cowork chat directly.
2. **Say "review"** in Cowork chat. That's it — no need to spell out the day or filename. Claude finds the latest unprocessed photo, identifies the day from the worksheet header, runs the phase-aware review, and updates the tracker.
3. **Run `./tools/sync.sh`** from `~/Personal/writing-quest`. One command. Stages, commits, pushes. Cloudflare auto-deploys in ~30s.

That's the full loop. ~30 seconds of human time per day.

---

## What happens when you say "review"

Claude (with the `arnav-writing-reviewer` skill loaded):

1. Locates the photo — checks `public/worksheets/completed/` first, then Cowork uploads.
2. Reads the worksheet header to identify Day N + theme.
3. Rotates / normalises the image; renames it to `Day_NN_Theme_YYYY-MM-DD.jpg`.
4. Applies the **phase-aware review rules** (Phase 1 = effort only — no spelling critique).
5. Produces two specific praises + one suggestion + verified XP number.
6. Patches the `<script id="verifiedReviews">` JSON block in `index.html`.
7. Tells you to run `./tools/sync.sh`.

## What `./tools/sync.sh` does

```bash
git add -A
git commit -m "Day N verified review"   # auto-detects N from index.html
git push origin main
```

If nothing changed, it exits cleanly with a message. If something fails (auth, network), the error is yours to see and fix.

## Where photos live

| Path | What it holds | Public? |
|---|---|---|
| `public/worksheets/Day_*.pdf` | Printable blanks | Yes (committed to GitHub, served as `/worksheets/*` on the site) |
| `public/worksheets/completed/` | Arnav's photographed work | **Yes** — committed publicly, served as `/worksheets/completed/*` on the site (the gallery in v2 will surface these). |

## If something goes wrong

- **"Nothing to commit"** → trackers were already in sync. No action needed.
- **Auth error on push** → check your stored GitHub credential / SSH key for `~/Personal/writing-quest`.
- **Wrong photo picked up by Claude** → say "review the Day_NN photo specifically" with the filename.
- **Want to redo a review** → say "redo Day N review" — Claude overwrites the corresponding entry in the JSON block.
