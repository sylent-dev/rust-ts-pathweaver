// The mark of Pathweaver (2c), drawn by the owner in Inkscape (2026-11-17) and built again here
// from its rules, so that its weight can change without redrawing it.
//
// Two rings of a triangle pointing down, one inside the other, with bars of the same width `bar`
// and gaps of the same width `gap`; every edge is horizontal or at 60°.
// - The outer ring is three separate bars: its corners are cut off, each at the line that puts
//   the lower end of the top bar right above the corner of the inner ring.
// - The inner ring is a P: its top corners are closed, its left bar runs down to the cut of the
//   bottom, its right bar stops one gap short of the left bar, on the line through the centre;
//   the right bar of the outer ring stops on the same line.
// The size of the rings follows from the bars: the outer ring is two steps (bar + gap) from the
// centre, which puts that line exactly through it. The owner's drawing is 2.4 units wider, 1 %.
//
// Coordinates: the centre at 0, 0, y down. A line is a normal and a value (n · p = value): H for
// the horizontal lines, A for the lines going down to the right, B for those going down to the left.

const SIN60 = Math.sqrt(3) / 2;
const NORMALS = { H: [0, 1], A: [SIN60, -0.5], B: [SIN60, 0.5] };

// The point where two lines cross.
function crossing([kind1, value1], [kind2, value2]) {
  const [a, b] = NORMALS[kind1];
  const [c, d] = NORMALS[kind2];
  const det = a * d - b * c;
  return [(value1 * d - b * value2) / det, (a * value2 - value1 * c) / det];
}

// The polygons of the mark: each a list of lines, a corner where one line meets the next.
function logoPolygons(bar, gap) {
  const step = bar + gap;
  const outer = 2 * step;
  const inner = outer - step;
  const cut = 2 * outer - 1.5 * step - 0.5 * bar;     // the corners of the outer ring
  const end = -(inner - bar) + gap;                   // the end of the right bars: 0, the centre
  const ring = radius => ({
    top: ["H", -radius], topIn: ["H", -(radius - bar)],
    left: ["A", -radius], leftIn: ["A", -(radius - bar)],
    right: ["B", radius], rightIn: ["B", radius - bar],
  });
  const o = ring(outer);
  const i = ring(inner);
  const cutLeft = ["B", -cut], cutRight = ["A", cut], cutBottom = ["H", cut], endRight = ["A", end];
  return [
    [o.top, cutRight, o.topIn, cutLeft],
    [cutLeft, o.left, cutBottom, o.leftIn],
    [cutRight, o.right, endRight, o.rightIn],
    [i.top, i.left, cutBottom, i.leftIn, i.topIn, i.rightIn, endRight, i.right],
  ].map(lines => lines.map((line, index) => crossing(line, lines[(index + 1) % lines.length])));
}

// The weights compared, numbered after the fonts (72 to 85). The step (bar + gap) stays the same
// in 86 to 89, so that every weight has the same size; 90 and 91 are drawn for the size they are
// shown at, every flat edge on a whole pixel (logoPixelFit).
const LOGO_WEIGHTS = [
  { id: 86, name: "As drawn", bar: 23, gap: 26, note: "bars a little thinner than the gaps" },
  { id: 87, name: "Even", bar: 24.5, gap: 24.5, note: "bars as wide as the gaps" },
  { id: 88, name: "Bold", bar: 28, gap: 21, note: "for the small sizes" },
  { id: 89, name: "Light", bar: 19, gap: 30, note: "more air, thinner at 16 px" },
  { id: 90, name: "On the pixel grid", pixel: true, note: "bars of whole pixels, twice the gaps: 2 and 1 px at 16 px" },
  { id: 91, name: "The P alone", pixel: true, part: "p", note: "the inner ring, on the pixel grid: 3 px bars at 16 px" },
];

const markPolygons = (part, bar, gap) => part === "p" ? logoPolygons(bar, gap).slice(3) : logoPolygons(bar, gap);

function polygonBounds(polygons) {
  const xs = polygons.flat().map(([x]) => x);
  const ys = polygons.flat().map(([, y]) => y);
  const [left, right, top, bottom] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return { left, right, top, bottom, width: right - left, height: bottom - top };
}

// The mark on the pixel grid at `size` px: the largest step (bar + gap, in whole pixels, the bar
// two thirds of it) whose mark leaves a pixel free, the top edge on a whole pixel. Every flat
// edge is then on a whole pixel too; the edges at 60° can't be, whatever the drawing.
function logoPixelFit(part, size) {
  for (let step = Math.max(2, Math.floor(size / 3)); ; step -= 1) {
    const bar = Math.round(step * 2 / 3);
    const polygons = markPolygons(part, bar, step - bar);
    const bounds = polygonBounds(polygons);
    if (step === 2 || (bounds.width <= size - 1 && bounds.height <= size - 1)) {
      const box = [(bounds.left + bounds.right - size) / 2, bounds.top - Math.round((size - bounds.height) / 2), size, size];
      return { polygons, box, bar, gap: step - bar };
    }
  }
}

// The mark as an SVG of `size` pixels: the outer ring (class logo-frame) and the P (logo-p), each
// in its own ink (css/logo.css), or in the colours of `inks` ({ frame, p }) when it leaves the page
// (the favicon, the canvases of the zoom). The box is square, the mark centred in it.
function logoMark(weight, size, inks) {
  let polygons, box;
  if (weight.pixel) ({ polygons, box } = logoPixelFit(weight.part, size));
  else {
    polygons = markPolygons(weight.part, weight.bar, weight.gap);
    const bounds = polygonBounds(polygons);
    const side = Math.max(bounds.width, bounds.height);
    box = [(bounds.left + bounds.right - side) / 2, (bounds.top + bounds.bottom - side) / 2, side, side];
  }
  const path = polygon => "M" + polygon.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + "Z";
  const paint = (kind, ink) => inks ? `fill="${ink}"` : `class="logo-${kind}"`;
  const frame = polygons.length > 1 ? `<path ${paint("frame", inks?.frame)} d="${polygons.slice(0, 3).map(path).join("")}"/>` : "";
  return `<svg class="logo-mark" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${box.map(n => n.toFixed(2)).join(" ")}" aria-hidden="true">
    ${frame}<path ${paint("p", inks?.p)} d="${path(polygons.at(-1))}"/></svg>`;
}

// The mark on a square of the accent, in the ink that goes on it; the square keeps a margin of
// whole pixels, so that a mark on the pixel grid stays on it.
const logoSquare = (weight, size) =>
  `<span class="logo-square" style="width:${size}px;height:${size}px">${logoMark(weight, size - 2 * Math.round(size * .11))}</span>`;

// The inks of the list « Mark » as colours, for a mark that leaves the page.
function logoInks(ink, text, accent) {
  return { text: { frame: text, p: text }, accent: { frame: accent, p: accent },
    "p-accent": { frame: text, p: accent }, "frame-accent": { frame: accent, p: text } }[ink];
}
