# Writing Quest — Printable Worksheets

A4 printable worksheets, one per day. Print and let Arnav write directly on the page.

## Files in this folder

### Week 1 (Days 1–7) — Fluency before perfection
| File | What it is |
|---|---|
| `Day_01_Mission_Start.pdf`       | Day 1 — Roblox prompt, 3 lines target |
| `Day_02_Friends_Mode.pdf`        | Day 2 — Friends (Arsh / Varad), 4 lines |
| `Day_03_Minecraft_Builder.pdf`   | Day 3 — Minecraft build, 5 lines |
| `Day_04_Story_Spark.pdf`         | Day 4 — Hero / secret door story, 5 lines |
| `Day_05_Speed_Day.pdf`           | Day 5 — Dream YouTube channel, 5 lines |
| `Day_06_Free_Pick.pdf`           | Day 6 — Free choice, 6 lines |
| `Day_07_Week_1_Wrap.pdf`         | Day 7 — Reflection + first milestone, 7 lines |
| `Print_All_Week_1.pdf`           | All 7 Week-1 days in one PDF |

### Week 2 (Days 8–14) — Fluency continues, spell bank opens
| File | What it is |
|---|---|
| `Day_08_Spelling_Sneak-In.pdf`   | Day 8 — 5 spell-bank words in a 6-line story |
| `Day_09_Continuous_Flow.pdf`     | Day 9 — 3-min non-stop flow + principal-for-a-day |
| `Day_10_Boss__Friend_Story.pdf`  | **Day 10 BOSS** — 10-line story: "The Day Arsh, Varad and I Saved the School" |
| `Day_11_Game_Day.pdf`            | Day 11 — Compare Roblox & Minecraft, 7 lines |
| `Day_12_Speed_Beat.pdf`          | Day 12 — Speed challenge + "fastest thing I've done", 7 lines |
| `Day_13_YouTube_Mode.pdf`        | Day 13 — Video script intro, 7 lines |
| `Day_14_Family_Fun.pdf`          | Day 14 — Best family moment, 8 lines |
| `Print_All_Week_2.pdf`           | All 7 Week-2 days in one PDF |

## Daily workflow

1. Print today's worksheet (or print all 7 once at the start of the week and keep them ready).
2. Arnav fills in the four boxes in order: Warm-up → Speed drill → Main Mission → Self-check.
3. Set a 25-minute timer. Leave the room.
4. Once finished, take a phone photo or scan the page. Drop the photo into `public/worksheets/completed/`.
5. In Claude Code in the project root, just type `review` — the `arnav-writing-reviewer` skill handles compress + rename + review + commit + PR + auto-merge.
6. Enter the XP into `Arnav_Writing_Quest_Tracker.xlsx` (Daily Log tab) — that's the ritual.

## Regenerating worksheets

```bash
.venv/bin/python tools/generate-worksheets.py 2          # Week 2
.venv/bin/python tools/generate-worksheets.py 3 --force  # Week 3, overwrite if exists
```

The generator reads `src/data/days.json` for prompts/targets and a per-day warm-up/speed-drill table from the top of the script itself. Each week's PDFs are ~3 KB each (text-only, A4) and the combined Print_All is ~16 KB.

## Reviewer skill

The review logic lives at `.skills/arnav-writing-reviewer/` in this folder. It uses the program's phase-aware rules:

- Days 1–14: praise effort, do NOT correct spelling/neatness/grammar.
- Always 2 specific praises + maximum 1 specific suggestion (the 2-to-1 rule).
- Always tied to Arnav's world (Roblox, Minecraft, friends).

See `.skills/arnav-writing-reviewer/HOW_TO_INSTALL.md` for installation.
