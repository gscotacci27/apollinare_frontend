#!/usr/bin/env python3
"""Generate PWA PNG icons from scratch. No external dependencies required."""
import os
import struct
import zlib


def _chunk(tag: bytes, data: bytes) -> bytes:
    payload = tag + data
    return struct.pack(">I", len(data)) + payload + struct.pack(">I", zlib.crc32(payload) & 0xFFFFFFFF)


def _lerp(a: int, b: int, t: float) -> int:
    return max(0, min(255, round(a + (b - a) * t)))


def _lerp_rgb(c1: tuple, c2: tuple, t: float) -> tuple:
    return (_lerp(c1[0], c2[0], t), _lerp(c1[1], c2[1], t), _lerp(c1[2], c2[2], t))


def _in_circle(x: int, y: int, cx: float, cy: float, r: float) -> bool:
    return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2


def create_icon(size: int) -> bytes:
    """
    Create a square PNG icon:
    - Vertical gradient background: indigo-500 (#6366f1) → slate-950 (#0f172a)
    - Centered white circle (radius ≈ 36 % of size)
    - Indigo letter 'A' drawn inside the circle using a scaled bitmap
    """
    TOP    = (99, 102, 241)   # indigo-500
    BOTTOM = (15,  23,  42)   # slate-950
    WHITE  = (255, 255, 255)
    MARK   = (79,  70, 229)   # indigo-600 — letter color

    cx, cy = size / 2, size / 2
    circle_r = size * 0.36

    # 7×9 bitmap for letter "A" (1 = filled)
    A_BITMAP = [
        [0, 0, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0],
        [1, 1, 0, 0, 1, 1, 0],
        [1, 1, 0, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 0],
        [1, 1, 0, 0, 1, 1, 0],
        [1, 1, 0, 0, 1, 1, 0],
        [1, 1, 0, 0, 1, 1, 0],
    ]
    ROWS, COLS = len(A_BITMAP), len(A_BITMAP[0])
    cell = size / 26   # letter occupies ~26 cells across the icon
    letter_w = COLS * cell
    letter_h = ROWS * cell
    lx0 = cx - letter_w / 2
    ly0 = cy - letter_h / 2

    rows = bytearray()
    for y in range(size):
        t = y / (size - 1) if size > 1 else 0
        bg = _lerp_rgb(TOP, BOTTOM, t)

        rows.append(0)  # filter byte = None
        for x in range(size):
            in_circ = _in_circle(x, y, cx, cy, circle_r)
            if in_circ:
                # Check if pixel is inside the letter bitmap
                col_idx = (x - lx0) / cell
                row_idx = (y - ly0) / cell
                in_letter = (
                    0 <= row_idx < ROWS
                    and 0 <= col_idx < COLS
                    and A_BITMAP[int(row_idx)][int(col_idx)] == 1
                )
                px = MARK if in_letter else WHITE
            else:
                px = bg
            rows += bytes(px)

    ihdr = _chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
    idat = _chunk(b"IDAT", zlib.compress(bytes(rows), 6))
    iend = _chunk(b"IEND", b"")
    return b"\x89PNG\r\n\x1a\n" + ihdr + idat + iend


def main() -> None:
    out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
    os.makedirs(out_dir, exist_ok=True)

    targets = [
        ("icon-512.png",         512),
        ("icon-192.png",         192),
        ("apple-touch-icon.png", 180),
    ]
    for filename, size in targets:
        path = os.path.join(out_dir, filename)
        with open(path, "wb") as f:
            f.write(create_icon(size))
        print(f"  ✓ {filename}  ({size}×{size})")


if __name__ == "__main__":
    main()
