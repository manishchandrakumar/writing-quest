# How to install the Arnav Writing Reviewer skill

This skill lets Claude review Arnav's handwritten Writing Quest worksheets using the program's rules (2-to-1 review, phase-aware feedback, XP scoring).

## Option A — Use it inline (zero setup, recommended for now)

In any future Cowork session, just say:

> "Use the Arnav writing reviewer skill in my folder and review the attached worksheet."

Then drop the photo / scan / PDF of his completed page into the chat. Claude will read `SKILL.md` from `.skills/arnav-writing-reviewer/` and follow it.

## Option B — Install as a permanent user skill (auto-loads in every session)

1. On your computer, open the folder: `~/.claude/skills/` (create it if it doesn't exist).
2. Copy the entire `arnav-writing-reviewer` folder there. The path should look like:
   `~/.claude/skills/arnav-writing-reviewer/SKILL.md`
3. Restart the Claude desktop app.

From then on, the skill auto-triggers whenever you upload Arnav's writing and mention things like *"review his Day 3"* or *"check Arnav's writing"*.

## What the skill does

When triggered, it:

- Reads the worksheet header to identify Day number + theme
- Applies phase-appropriate review (Days 1–14 = effort only, no spelling critique)
- Produces a short kid-facing message + a detailed parent-facing block
- Calculates XP to enter into the Excel tracker
- After 3+ submissions, recommends adjustments to upcoming days

## What to upload

- Phone photo of the worksheet (any angle, any lighting — Claude rotates and reads)
- Or a scanned PDF
- Or a multi-day batch (one page per day in a single PDF works)

That's it. Keep printing worksheets, keep uploading, keep the streak alive.
