#!/usr/bin/env python3
"""
Generate Writing Quest worksheet PDFs for a given week.

Usage:
  python3 tools/generate-worksheets.py 2          # generate Week 2 (Days 8-14)
  python3 tools/generate-worksheets.py 2 --force  # overwrite existing files

Reads day metadata from src/data/days.json. Writes one PDF per day plus a
Print_All_Week_N.pdf containing all 7 days, into public/worksheets/.

Per-day customisation:
  - Warm-up + speed-drill text is chosen by a small per-week table below.
    Days that need special prompts (spell-bank, timed runs, reflective) get
    their own warm-up; others fall back to a sensible default.
  - The main mission box uses the prompt text straight from days.json.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from pypdf import PdfWriter, PdfReader


ROOT = Path(__file__).resolve().parent.parent
DAYS_JSON = ROOT / "src" / "data" / "days.json"
OUT_DIR = ROOT / "public" / "worksheets"

# Brand colors (matched roughly to portal)
BLUE = HexColor("#1e40af")
YELLOW = HexColor("#fef3c7")
YELLOW_BORDER = HexColor("#f59e0b")
RED_BORDER = HexColor("#dc2626")
BLUE_BAND = HexColor("#dbeafe")
GOLD = HexColor("#c2944c")
GREY_LINE = HexColor("#d1d5db")


# Per-day warm-up + speed-drill copy. Keys are day numbers.
# If a day isn't in this table, the default (below) is used.
WARMUP = {
    1:  ("Decorate this page with your name in big letters in the box below. Make it look like a game logo.",
         "Write the alphabet a–z as fast as you can in one line."),
    2:  ("Draw a tiny doodle of your favourite Roblox character in the box.",
         "Speed sentence: 'My friend is the best.' Copy 4 times in under 60 seconds."),
    3:  ("Doodle one Minecraft block you'd build with first.",
         "Write the days of the week in order, as fast as you can."),
    4:  ("Draw a tiny doodle of your story's hero in the box.",
         "Speed sentence: 'The hero ran fast.' Copy 4 times in under 60 seconds."),
    5:  ("Shake your hand and stretch your fingers for 30 seconds. Then write your name 3 times below.",
         "Write as many words as you can in 60 seconds (any words you like). Count them at the end."),
    6:  ("YOUR CHOICE: copy 3 favourite words OR draw 3 doodles in the box.",
         "Pick any sentence from a book or comic and copy it neatly below."),
    7:  ("Re-read Day 1 and Day 6 quietly to yourself. Tick the box when done.",
         "Speed copy: write 'I am a writer.' 6 times below in under 60 seconds."),

    # Week 2 — Phase 1 closes (Days 8-14)
    8:  ("Write the 5 spell-bank words in the box: because, friend, school, before, every.",
         "Speed sentence: 'I write every day.' Copy 4 times in under 60 seconds."),
    9:  ("3-MINUTE NON-STOP FLOW: write anything that comes to mind. Don't lift your pen. Don't fix anything.",
         "Speed copy: 'I keep going.' 5 times in under 60 seconds."),
    10: ("BOSS DAY warm-up: write your 3 favourite hero names (Roblox, Minecraft, real life — your call).",
         "Draw a tiny shield in the box. You are levelling up today."),
    11: ("Draw a tiny Roblox logo AND a tiny Minecraft pickaxe in the box.",
         "Write 5 words about Roblox AND 5 words about Minecraft in 60 seconds."),
    12: ("SPEED BEAT: write your name as fast as you can, 5 times. Don't fix it.",
         "Speed sentence: 'I go faster every day.' Copy 4 times in under 60 seconds."),
    13: ("Draw the logo of your dream YouTube channel from Day 5 in the box.",
         "Write 5 video title ideas in 60 seconds (just titles, no story yet)."),
    14: ("Re-read your favourite Week 2 day quietly to yourself. Tick the box when done.",
         "Write 5 names of family members or pets in under 30 seconds."),
}

DEFAULT_WARMUP = (
    "Shake your hand and stretch your fingers for 30 seconds. Then draw anything you like in the box.",
    "Write as many words as you can in 60 seconds (any words you like). Count them at the end.",
)


def load_days() -> list[dict]:
    return json.loads(DAYS_JSON.read_text())["days"]


def draw_box(c: canvas.Canvas, x, y, w, h, border_color, fill_color=None, border_width=1.2):
    if fill_color is not None:
        c.setFillColor(fill_color)
        c.setStrokeColor(border_color)
        c.setLineWidth(border_width)
        c.rect(x, y, w, h, stroke=1, fill=1)
    else:
        c.setStrokeColor(border_color)
        c.setLineWidth(border_width)
        c.rect(x, y, w, h, stroke=1, fill=0)


def draw_wrapped(c: canvas.Canvas, text: str, x, y, max_width, font="Helvetica", size=9, leading=11) -> float:
    """Draw wrapped text; return y of last line baseline."""
    c.setFont(font, size)
    words = text.split()
    line, lines = "", []
    for w in words:
        trial = (line + " " + w).strip()
        if c.stringWidth(trial, font, size) <= max_width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)
    for ln in lines:
        c.drawString(x, y, ln)
        y -= leading
    return y + leading


def draw_lines(c: canvas.Canvas, x, y_top, width, n_lines, leading=8 * mm):
    c.setStrokeColor(GREY_LINE)
    c.setLineWidth(0.4)
    for i in range(n_lines):
        y = y_top - (i + 1) * leading
        c.line(x, y, x + width, y)


def render_day(c: canvas.Canvas, day: dict, week_n: int):
    """Render one day onto the current page."""
    n = day["n"]
    theme = day["theme"].upper()
    lines = day["lines"]
    phase = day["phase"]
    prompt = day["prompt"]
    boss = day.get("boss", False)

    width, height = A4
    margin = 14 * mm
    inner_w = width - 2 * margin

    # --- Top blue header bar
    bar_h = 18 * mm
    bar_y = height - margin - bar_h
    draw_box(c, margin, bar_y, inner_w, bar_h, BLUE, BLUE, border_width=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin + 6 * mm, bar_y + bar_h - 8 * mm, "WRITING QUEST")
    c.setFont("Helvetica", 8.5)
    c.drawString(margin + 6 * mm, bar_y + bar_h - 13.5 * mm,
                 "Personal 60-Day Writing Program · Arnav Kashyap")
    # Day chip on right
    chip_w = 70 * mm
    chip_h = 9 * mm
    chip_x = margin + inner_w - chip_w - 4 * mm
    chip_y = bar_y + bar_h - chip_h - 4 * mm
    chip_color = HexColor("#c2410c") if boss else GOLD
    draw_box(c, chip_x, chip_y, chip_w, chip_h, chip_color, chip_color, border_width=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 10)
    chip_label = f"DAY {n}  ·  {theme}"
    if boss:
        chip_label = f"*  BOSS DAY {n}  ·  {theme}"
    c.drawCentredString(chip_x + chip_w / 2, chip_y + 2.6 * mm, chip_label)

    # --- Date / Player / Phase row
    row_y = bar_y - 8 * mm
    c.setFillColor(black)
    c.setFont("Helvetica", 9.5)
    c.drawString(margin, row_y, "Date: __________________")
    c.drawString(margin + inner_w * 0.42, row_y, "Player: Arnav Kashyap")
    c.drawRightString(margin + inner_w, row_y, f"Phase {phase}  ·  Week {week_n}")

    # --- Section: WARM-UP
    cursor = row_y - 6 * mm
    warmup_text, drill_text = WARMUP.get(n, DEFAULT_WARMUP)
    cursor = draw_section(c, "WARM-UP  ·  3 min", warmup_text,
                          x=margin, y_top=cursor, width=inner_w,
                          fill=BLUE_BAND, border=BLUE,
                          inner_height=22 * mm)

    # --- SPEED DRILL
    cursor -= 4 * mm
    cursor = draw_section(c, "SPEED DRILL  ·  3 min", drill_text,
                          x=margin, y_top=cursor, width=inner_w,
                          fill=YELLOW, border=YELLOW_BORDER,
                          inner_height=20 * mm,
                          extras=[("Start: ______   End: ______   Words: ______", 6)])

    # --- MAIN MISSION
    cursor -= 4 * mm
    main_title = f"MAIN MISSION  ·  Target: {lines} lines  ·  12–18 min"
    if boss:
        main_title = f"*  BOSS MAIN MISSION  ·  Target: {lines} lines  ·  18–25 min"
    # Need enough room for the prompt + lined writing area.
    line_leading = 8 * mm
    writing_lines = max(lines + 1, 8)  # always at least 8 lines of writing space
    mission_inner = 8 * mm + writing_lines * line_leading + 4 * mm
    cursor = draw_section(c, main_title, prompt,
                          x=margin, y_top=cursor, width=inner_w,
                          fill=white, border=RED_BORDER,
                          inner_height=mission_inner,
                          lined_lines=writing_lines,
                          line_leading=line_leading)

    # --- SELF-CHECK + XP chip (two-column row)
    cursor -= 4 * mm
    sc_w = inner_w * 0.66
    sc_h = 20 * mm
    sc_y = cursor - sc_h
    draw_box(c, margin, sc_y, sc_w, sc_h, GREY_LINE, white, border_width=0.8)
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin + 3 * mm, sc_y + sc_h - 5 * mm, "SELF-CHECK  ·  2 min")
    c.setFillColor(black)
    c.setFont("Helvetica", 9)
    selfcheck_text = self_check_for(n)
    draw_wrapped(c, selfcheck_text,
                 margin + 3 * mm, sc_y + sc_h - 10 * mm,
                 sc_w - 6 * mm, size=9, leading=10)

    # XP chip
    xp_x = margin + sc_w + 4 * mm
    xp_w = inner_w - sc_w - 4 * mm
    draw_box(c, xp_x, sc_y, xp_w, sc_h, GOLD, GOLD, border_width=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(xp_x + xp_w / 2, sc_y + sc_h - 6 * mm, "XP EARNED TODAY")
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(xp_x + xp_w / 2, sc_y + sc_h - 13 * mm, "+_____")
    c.setFont("Helvetica", 7.5)
    c.drawCentredString(xp_x + xp_w / 2, sc_y + 2.5 * mm, "Enter in the Excel tracker")

    # --- Footer (signature + streak + tagline)
    foot_y = sc_y - 8 * mm
    c.setFillColor(black)
    c.setFont("Helvetica", 8.5)
    c.drawString(margin, foot_y, "Parent signature & date: ____________________")
    c.drawRightString(margin + inner_w, foot_y,
                      "Streak today:  [ ] Yes   [ ] Lite   [ ] Freeze   [ ] No")

    c.setFont("Helvetica-Oblique", 7.5)
    c.setFillColor(HexColor("#6b7280"))
    c.drawCentredString(width / 2, 12 * mm,
                        "Writing Quest · Designed for Arnav Kashyap · "
                        f"Phase {phase} — Fluency before perfection")


def self_check_for(n: int) -> str:
    table = {
        1: "Read it back to a parent. Circle the word you like most.",
        2: "Tell a parent the best line you wrote.",
        3: "Read the build steps out loud. Did they make sense?",
        4: "Pick the most exciting word in your story. Draw a star next to it.",
        5: "Write the 60-second word count in the box. Try to beat it on Day 12!",
        6: "Tell a parent the title of today's piece.",
        7: "FIRST MILESTONE! Add up your XP for the whole week and write it. Big celebration.",
        8: "Underline each spell-bank word you used. Count them.",
        9: "Tell a parent ONE word you wrote that surprised you.",
        10: "BOSS WIN! Read the whole story to a parent — voices and all.",
        11: "Which would you actually pick: Roblox or Minecraft? Draw a star next to your choice.",
        12: "Compare today's name-speed to Day 5's. Faster? Tick the box.",
        13: "Read your intro out loud like a real YouTuber. Big voice.",
        14: "Tell a parent who in your family this story is about.",
    }
    return table.get(n, "Read your writing back to a parent. Circle the best word.")


def draw_section(c, title, body, x, y_top, width, fill, border, inner_height,
                 extras=None, lined_lines=0, line_leading=8 * mm):
    """Draw a labelled box; return y of bottom of box."""
    box_y = y_top - inner_height
    draw_box(c, x, box_y, width, inner_height, border, fill,
             border_width=1.4 if border == RED_BORDER else 1.0)
    # Title strip
    c.setFillColor(border if border in (RED_BORDER, BLUE, YELLOW_BORDER) else black)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(x + 3 * mm, y_top - 5.5 * mm, title)
    # Body
    c.setFillColor(black)
    c.setFont("Helvetica", 9)
    body_y = y_top - 9.5 * mm
    body_y = draw_wrapped(c, body, x + 3 * mm, body_y,
                          max_width=width - 6 * mm, size=9, leading=11)
    # Extras (e.g. timer line for speed drill)
    if extras:
        for line, gap in extras:
            body_y -= gap
            c.setFont("Helvetica", 8.5)
            c.drawString(x + 3 * mm, body_y, line)
    # Lined writing area
    if lined_lines:
        lines_top = body_y - 4 * mm
        draw_lines(c, x + 3 * mm, lines_top, width - 6 * mm, lined_lines, leading=line_leading)
    return box_y


def filename_for(day: dict) -> str:
    theme_part = day["theme"].replace(" ", "_").replace("·", "").replace("/", "_")
    return f"Day_{day['n']:02d}_{theme_part}.pdf"


def generate_week(week_n: int, force: bool = False) -> list[Path]:
    """Generate per-day PDFs for the given week (1-indexed). Returns list of paths."""
    days = load_days()
    start = (week_n - 1) * 7 + 1
    end = start + 7
    week_days = [d for d in days if start <= d["n"] < end]
    if not week_days:
        raise SystemExit(f"No days found for week {week_n} (looked for days {start}–{end - 1}).")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_paths = []
    for day in week_days:
        out = OUT_DIR / filename_for(day)
        if out.exists() and not force:
            print(f"  · {out.name} exists (use --force to overwrite) — skipped")
            out_paths.append(out)
            continue
        c = canvas.Canvas(str(out), pagesize=A4)
        render_day(c, day, week_n)
        c.showPage()
        c.save()
        size_kb = out.stat().st_size // 1024
        print(f"  ✓ {out.name} ({size_kb} KB)")
        out_paths.append(out)
    return out_paths


def combine_pdfs(paths: list[Path], out: Path):
    w = PdfWriter()
    for p in paths:
        for page in PdfReader(str(p)).pages:
            w.add_page(page)
    with out.open("wb") as f:
        w.write(f)
    print(f"  ✓ {out.name} ({out.stat().st_size // 1024} KB) — combined {len(paths)} pages")


def main():
    args = sys.argv[1:]
    force = "--force" in args
    nums = [int(a) for a in args if a.isdigit()]
    if not nums:
        raise SystemExit("Usage: generate-worksheets.py <week_n> [--force]")
    week_n = nums[0]
    print(f"Generating Week {week_n} worksheets…")
    paths = generate_week(week_n, force=force)
    combined = OUT_DIR / f"Print_All_Week_{week_n}.pdf"
    combine_pdfs(paths, combined)
    print(f"Done. Files in {OUT_DIR.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
