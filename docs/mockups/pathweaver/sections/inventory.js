// The inventory (2j3): N2 kept, with square corners, the images of the items, the boxes B4 and the card
// of a slot under the pointer (js/slot-hover.js). In the Overview at the level of the band, then alone at
// that level, then on a sample.

// The sample: a free text of the corpus on the belt (« Any Belt », no image), a charm in Trinket1 as
// Maxroll writes it (7 entries of the corpus), drawn in the cell of the charms (drawnSlot, js/levels.js), and two ids the game
// data don't know, invented: a unique on the second ring, and a slot.
const INVENTORY_SAMPLE = ([
  { id: "Belt1", x: 0, y: 0, levels: [1, 100], unique: "", base: "Any Belt", note: "<grey>{Life and resistances.}" },
  { id: "Ring2", x: 0, y: 0, levels: [1, 100], unique: "Ashen Covenant", base: "", note: "", unknown: true },
  { id: "Trinket1", x: 2, y: 0, levels: [1, 100], unique: "", base: "Thawing Charm", note: "" },
  { id: "Trinket2", x: 0, y: 0, levels: [1, 100], unique: "", base: "Golden Charm", note: "", unknown: true },
]).map(drawnSlot);
function sampleHints(level) {
  const replaced = new Set(INVENTORY_SAMPLE.map(hint => hint.id));
  return [...slotsAt(level, STATE.inventorySet).filter(hint => !replaced.has(hint.id)), ...INVENTORY_SAMPLE];
}

addSection(() => ["The inventory: N2, square corners, the images of the items, the boxes darker with a line, the card of a slot", [
  ["The Overview at the level of the band: ◀ ▶, the track or ← →",
    `<div class="app-window" style="width:960px">${levelBand()}${overview()}</div>`],
  ["Alone, at the level of the band",
    `<div class="app-window" style="width:330px"><aside class="app-side app-inventory-alone">${inventoryBox(STATE.level)}</aside></div>`],
  ["A sample: « Any Belt », a free text without image; a charm in Trinket1, as Maxroll writes it, drawn among the charms; a unique and a slot the game data don't know",
    `<div class="app-window" style="width:330px"><aside class="app-side app-inventory-alone">${inventoryBox(STATE.level, sampleHints(STATE.level))}</aside></div>`],
]]);
