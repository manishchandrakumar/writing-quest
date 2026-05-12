#!/usr/bin/env python3
"""
Compress a worksheet photo in place (or to a target path).

Usage:
  python3 tools/compress-photo.py <input.jpg> [output.jpg]
  python3 tools/compress-photo.py public/worksheets/completed/Day_03_Foo_2026-05-13.jpg

What it does:
  1. Reads the image, applies EXIF orientation, drops EXIF metadata.
  2. Rotates landscape iPhone shots into portrait (worksheets are A4 portrait).
  3. Downscales to MAX_W if wider.
  4. Re-encodes as progressive JPEG at QUALITY.

Defaults (1600 px wide, quality 80) take iPhone shots from ~2.5 MB to ~350 KB
without losing legibility of handwriting. Tweak the constants if needed.
"""
from __future__ import annotations
import sys
from pathlib import Path
from PIL import Image, ExifTags

MAX_WIDTH = 1600
QUALITY   = 80


def apply_exif_orientation(im: Image.Image) -> Image.Image:
    try:
        key = next(k for k, v in ExifTags.TAGS.items() if v == "Orientation")
        exif = im._getexif() or {}
        o = exif.get(key)
        if o == 3:   im = im.rotate(180, expand=True)
        elif o == 6: im = im.rotate(270, expand=True)
        elif o == 8: im = im.rotate(90,  expand=True)
    except Exception:
        pass
    return im


def compress(src: Path, dst: Path | None = None,
             max_w: int = MAX_WIDTH, quality: int = QUALITY) -> tuple[int, int, tuple[int, int]]:
    """Compress src → dst (defaults to in-place). Returns (before, after, new size)."""
    dst = dst or src
    before = src.stat().st_size
    im = Image.open(src)
    im = apply_exif_orientation(im)
    # Worksheets are A4 portrait — force portrait
    if im.size[0] > im.size[1]:
        im = im.rotate(-90, expand=True)
    if im.size[0] > max_w:
        new_h = int(im.size[1] * max_w / im.size[0])
        im = im.resize((max_w, new_h), Image.LANCZOS)
    im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
    after = dst.stat().st_size
    return before, after, im.size


def main(argv: list[str]) -> int:
    if not (2 <= len(argv) <= 3):
        print(__doc__)
        return 1
    src = Path(argv[1]).expanduser().resolve()
    if not src.exists():
        print(f"Not found: {src}", file=sys.stderr)
        return 2
    dst = Path(argv[2]).expanduser().resolve() if len(argv) == 3 else src
    before, after, size = compress(src, dst)
    pct = 100 * (1 - after / before) if before else 0
    print(f"{src.name}: {before/1024:.0f} KB → {after/1024:.0f} KB "
          f"({pct:.0f}% smaller, {size[0]}x{size[1]}) → {dst}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
