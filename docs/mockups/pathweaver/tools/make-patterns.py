"""Prints the CSS of the patterns of css/textures.css whose paths are computed (contours, stars,
ripples, rays), to paste there:

    python3 docs/mockups/pathweaver/tools/make-patterns.py
"""
import math, random
from urllib.parse import quote

def svg(view, body):
    s = f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='{view}' preserveAspectRatio='none'>{body}</svg>"
    return 'url("data:image/svg+xml,' + quote(s, safe="/:=' .-,#()") .replace("#", "%23") + '")'

STROKE = "fill='none' stroke='black' vector-effect='non-scaling-stroke'"

def loop(cx, cy, r, phase):
    pts = []
    for i in range(48):
        a = 2 * math.pi * i / 48
        rr = r * (1 + 0.12 * math.sin(3 * a + phase) + 0.07 * math.sin(5 * a + 2 * phase))
        pts.append(f"{cx + rr * math.cos(a):.1f} {cy + rr * math.sin(a):.1f}")
    return "M" + "L".join(pts) + "Z"

contours = "".join(loop(100, 100, r, 0.4) for r in range(14, 67, 13))
contours += "".join(loop(x, y, r, 1.7) for x in (0, 200) for y in (0, 200) for r in (20, 33, 46))
print("--pattern-contours:", svg("0 0 200 200", f"<path d='{contours}' {STROKE}/>") + "; --scale-contours: 8;")

random.seed(7)
stars = "".join(f"<circle cx='{random.uniform(4, 196):.0f}' cy='{random.uniform(4, 196):.0f}' r='{random.choice((0.8, 0.8, 1, 1.2, 1.8)):g}'/>" for _ in range(70))
print("--pattern-stars:", svg("0 0 200 200", stars) + "; --scale-stars: 8;")

ripples = "".join(f"<circle cx='300' cy='100' r='{r}' {STROKE}/>" for r in range(10, 570, 10))
print("--pattern-ripples:", svg("0 0 400 400", ripples) + "; --scale-ripples: 40;")

rays = "M" + "M".join(f"300 100L{300 + 700 * math.cos(math.radians(a)):.0f} {100 + 700 * math.sin(math.radians(a)):.0f}" for a in range(0, 360, 6))
print("--pattern-rays:", svg("0 0 400 400", f"<path d='{rays}' {STROKE}/>") + "; --scale-rays: 40;")
