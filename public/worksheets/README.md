# Writing Quest — Week 1 Worksheets

Seven A4 printable worksheets, one per day. Print and let Arnav write directly on the page.

## Files in this folder

| File | What it is |
|---|---|
| `Day_01_Mission_Start.pdf`       | Day 1 worksheet — Roblox prompt, 3 lines target |
| `Day_02_Friends_Mode.pdf`        | Day 2 — Friends prompt (Arsh / Varad), 4 lines |
| `Day_03_Minecraft_Builder.pdf`   | Day 3 — Minecraft build, 5 lines |
| `Day_04_Story_Spark.pdf`         | Day 4 — Hero / secret door story, 5 lines |
| `Day_05_Speed_Day.pdf`           | Day 5 — Dream YouTube channel, 5 lines |
| `Day_06_Free_Pick.pdf`           | Day 6 — Free choice topic, 6 lines |
| `Day_07_Week_1_Wrap.pdf`         | Day 7 — Reflection + first milestone, 7 lines |
| `Print_All_Week_1.pdf`           | All 7 days in one PDF for easy printing |

## Daily workflow

1. Print today's worksheet (or print all 7 once and keep them ready).
2. Arnav fills in the four boxes in order: Warm-up → Speed drill → Main Mission → Self-check.
3. Set a 25-minute timer. Leave the room.
4. Once finished, take a phone photo or scan the page.
5. Upload the photo to a new Claude session and say:
   > "Review Arnav's Day [N] worksheet using the writing reviewer skill in my folder."
6. Claude returns: kid-facing praise + parent-facing scorecard + XP to log.
7. Enter the XP into `Arnav_Writing_Quest_Tracker.xlsx` (Daily Log tab) — that's the ritual.

## After Week 1

Once Arnav has finished Days 1–7 and you have uploaded at least 3 of them for review, I will generate Days 8–14 — adjusted automatically based on his actual pace, line count, and engagement signals.

## Reviewer skill

The review logic lives at `.skills/arnav-writing-reviewer/` in this folder. It uses the program's phase-aware rules:

- Days 1–14: praise effort, do NOT correct spelling/neatness/grammar.
- Always 2 specific praises + maximum 1 specific suggestion (the 2-to-1 rule).
- Always tied to Arnav's world (Roblox, Minecraft, friends).

See `.skills/arnav-writing-reviewer/HOW_TO_INSTALL.md` for installation.
