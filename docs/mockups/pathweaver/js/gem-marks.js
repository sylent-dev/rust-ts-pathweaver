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

// The shape says the kind of a gem, its colour what it is (the owner, 2026-11-20): a spirit gem is a
// skill, a hexagon, in a teal of its own rather than the colour of its attribute (--gem-spirit, the
// bright teal of five); a lineage support is a support, a square on its tip, in a warm grey of its own
// (--gem-lineage, of silver, a mid grey and the colour of its attribute), apart from the cool grey of
// the gems without an attribute (--gem-none). The colour of a gem of the build (BUILDS: its colour,
// its kind, whether it is a lineage support):
// A gem shared half and half between two attributes (2kb, the owner, 2026-11-20: 114 gems of the game,
// grey as a gem without an attribute until then) has two letters (« rg », tools/make-data.py): its
// colours, the first where the page needs one alone (the head of a card).
const gemColoursOf = gem => gem.kind === "spirit" ? ["var(--gem-spirit)"] : gem.lineage ? ["var(--gem-lineage)"]
  : gem.colour?.length === 2 ? [...gem.colour].map(gemColour) : [gemColour(gem.colour)];
const gemColourOf = gem => gemColoursOf(gem)[0];

// The halves of a shape, left and right, for a gem of two attributes: each in the colour of one, in the
// order of the game (strength, dexterity, intelligence), the light top facet of a skill over both.
const GEM_HALVES = {
  skill: ['8,0.5 1.5,4.25 1.5,11.75 8,15.5', '8,0.5 14.5,4.25 14.5,11.75 8,15.5'],
  support: ['8,2 2,8 8,14', '8,2 14,8 8,14'],
};
const GEM_FACET = '<polygon points="8,0.5 14.5,4.25 8,8 1.5,4.25" fill="#fff" fill-opacity=".35"/>';

// The mark of a gem: a hexagon for a skill (a spirit gem, or the skill a spirit gem triggers, which
// the file lists among its supports), a square on its tip for a support; split in two colours for a
// gem of two attributes.
function gemMark(gem) {
  const shape = gem.kind === "support" ? "support" : "skill";
  const colours = gemColoursOf(gem);
  const body = colours.length === 2
    ? GEM_HALVES[shape].map((points, index) => `<polygon points="${points}" style="fill:${colours[index]}"/>`).join("") + (shape === "skill" ? GEM_FACET : "")
    : GEM_SHAPES[shape];
  return `<svg class="app-gem-mark" viewBox="0 0 16 16" style="color:${colours[0]}" aria-hidden="true">${body}</svg>`;
}
