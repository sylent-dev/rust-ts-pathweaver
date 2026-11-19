// The mark of a gem (2g3, the owner, 2026-11-19, taken from 2j since the window of what changes
// shows it first): a hexagon rather than the square of 2g, « more like a gem ». Twelve marks, three
// at each of four temperatures, each telling a skill from a support, in the colour of its attribute;
// the list « Gem » at the top applies one to every window, the slider « Gem size » sets its size.
// The marks set aside go once one is kept (2g4).

const GEM_COLOURS = { r: "var(--gem-str)", g: "var(--gem-dex)", b: "var(--gem-int)" };
const gemColour = colour => GEM_COLOURS[colour] ?? "var(--gem-none)";

// The points of a hexagon around the middle of a box of 16, pointing up, or flat on top.
const hexPoints = (radius, flat = false) => [0, 1, 2, 3, 4, 5].map(corner => {
  const angle = (Math.PI / 3) * corner + (flat ? 0 : -Math.PI / 2);
  return `${(8 + radius * Math.cos(angle)).toFixed(2)},${(8 + radius * Math.sin(angle)).toFixed(2)}`;
}).join(" ");
const hex = (radius, attributes = 'fill="currentColor"', flat = false) => `<polygon points="${hexPoints(radius, flat)}" ${attributes}/>`;
const shape = (points, attributes = 'fill="currentColor"') => `<polygon points="${points}" ${attributes}/>`;
const OUTLINE = width => `fill="none" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round"`;
// The six triangles of a hexagon pointing up, from its middle to each edge.
const hexFacets = radius => hexPoints(radius).split(" ").map((point, index, all) => `8,8 ${point} ${all[(index + 1) % 6]}`);
// The pointy hexagon of 8 × 8 pixels, row by row (G12).
const PIXEL_HEX = ["...##...", "..####..", ".######.", ".######.", ".######.", ".######.", "..####..", "...##..."];
const pixelHex = hollow => PIXEL_HEX.flatMap((row, y) => [...row].map((cell, x) => {
  const inside = cell === "#";
  const edge = inside && [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => PIXEL_HEX[y + dy]?.[x + dx] !== "#");
  return inside && (!hollow || edge) ? `<rect x="${x * 2}" y="${y * 2}" width="2" height="2" fill="currentColor"/>` : "";
})).join("");

// Each mark: its number, its temperature, what it tries, and its skill and support drawn in a box
// of 16, in currentColor.
const GEM_MARKS = {
  square: { title: "The square of 2g", skill: '<rect x="2" y="2" width="12" height="12" fill="currentColor"/>', support: '<rect x="4" y="4" width="8" height="8" fill="currentColor"/>' },
  g1: { title: "G1 · Normal · a hexagon, a support hollow", skill: hex(7.5), support: hex(6.4, OUTLINE(2.2)) },
  g2: { title: "G2 · Normal · flat on top, a support smaller", skill: hex(7.5, undefined, true), support: hex(5.2, undefined, true) },
  g3: { title: "G3 · Normal · a cut facet, a support a rhombus", skill: hex(7.5) + shape("8,0.5 14.5,4.25 8,8 1.5,4.25", 'fill="#fff" fill-opacity=".35"'), support: shape("8,1.5 14,8 8,14.5 2,8") },
  g4: { title: "G4 · High · a brilliant cut in six facets, a support set in a ring", skill: hexFacets(7.5).map((points, index) => shape(points, `fill="currentColor" fill-opacity="${[1, .72, .86, .6, .8, .92][index]}"`)).join(""),
    support: hex(4.6) + hex(7, OUTLINE(1.2) + ' stroke-opacity=".55"') },
  g5: { title: "G5 · High · a socket and its stone, a support the stone alone", skill: hex(6.8, OUTLINE(1.6) + ' fill="currentColor" fill-opacity=".18"') + hex(3.4), support: hex(4.4) },
  g6: { title: "G6 · High · a crystal standing, a support a short one", skill: shape("8,0.5 12.5,4.5 12.5,15.5 3.5,15.5 3.5,4.5") + shape("8,0.5 8,15.5 3.5,15.5 3.5,4.5", 'fill="#000" fill-opacity=".28"'),
    support: shape("8,6 12,9 12,15.5 4,15.5 4,9") + shape("8,6 8,15.5 4,15.5 4,9", 'fill="#000" fill-opacity=".28"') },
  g7: { title: "G7 · Explosive · a hexagon that glows, a support hollow", skill: hex(6.2), support: hex(5.6, OUTLINE(1.8)), glow: true },
  g8: { title: "G8 · Explosive · a cube seen from a corner, a support flat", skill: shape("8,0.5 14.5,4.25 8,8 1.5,4.25") + shape("1.5,4.25 8,8 8,15.5 1.5,11.75", 'fill="currentColor" fill-opacity=".72"')
    + shape("14.5,4.25 14.5,11.75 8,15.5 8,8", 'fill="currentColor" fill-opacity=".5"'), support: hex(5.6) },
  g9: { title: "G9 · Explosive · a star of six, a support its one triangle", skill: shape("8,0.5 14.5,11.75 1.5,11.75") + shape("8,15.5 1.5,4.25 14.5,4.25"), support: shape("8,2 14,12.5 2,12.5") },
  g10: { title: "G10 · Free · the triangle of the brand, pointing down; a support hollow", skill: shape("1,2.5 15,2.5 8,14.6"), support: shape("3,4 13,4 8,12.7", OUTLINE(1.8)) },
  g11: { title: "G11 · Free · a hexagon split in two shades, a support half filled", skill: hex(7.5) + shape("8,0.5 14.5,4.25 14.5,11.75 8,15.5", 'fill="#fff" fill-opacity=".3"'),
    support: hex(6.6, OUTLINE(1.6)) + shape("8,1.4 2.28,4.7 2.28,11.3 8,14.6") },
  g12: { title: "G12 · Free · in pixels, crisp at 8 and 16 px; a support hollow", skill: pixelHex(false), support: pixelHex(true), crisp: true },
};

// The mark of a gem, `kind` « skill » or « support », in the mark chosen at the top of the page.
function gemMark(colour, kind = "skill") {
  const mark = GEM_MARKS[chosen.gem] ?? GEM_MARKS.g1;
  return gemMarkOf(mark, colour, kind);
}
const gemMarkOf = (mark, colour, kind, size) => `<svg class="app-gem-mark ${mark.glow ? "is-glowing" : ""}" viewBox="0 0 16 16" ${mark.crisp ? 'shape-rendering="crispEdges"' : ""}
  style="color:${gemColour(colour)};${size ? `width:${size}px;height:${size}px` : ""}" aria-hidden="true">${mark[kind]}</svg>`;
