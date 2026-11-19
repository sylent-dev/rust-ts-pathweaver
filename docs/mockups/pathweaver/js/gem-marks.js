// The mark of a gem (2g3, the owner, 2026-11-19, taken from 2j since the window of what changes
// shows it first; G3 of twelve marks, the others in the history of Git): a hexagon, « more like a
// gem » than the square of 2g, its top facet lighter; a support a square on its tip, told apart by
// its shape as well as by its colour. In the colour of its attribute, 10 px beside a text of 12 px
// (--gem-mark-size, the owner, 2026-11-19); under 10 px, its shape is lost.

const GEM_COLOURS = { r: "var(--gem-str)", g: "var(--gem-dex)", b: "var(--gem-int)" };
const gemColour = colour => GEM_COLOURS[colour] ?? "var(--gem-none)";
const GEM_SHAPES = {
  skill: '<polygon points="8,0.5 14.5,4.25 14.5,11.75 8,15.5 1.5,11.75 1.5,4.25" fill="currentColor"/><polygon points="8,0.5 14.5,4.25 8,8 1.5,4.25" fill="#fff" fill-opacity=".35"/>',
  support: '<polygon points="8,2 14,8 8,14 2,8" fill="currentColor"/>',
};

// The mark of a gem, `kind` « skill » or « support ».
const gemMark = (colour, kind = "skill") => `<svg class="app-gem-mark" viewBox="0 0 16 16" style="color:${gemColour(colour)}" aria-hidden="true">${GEM_SHAPES[kind]}</svg>`;
