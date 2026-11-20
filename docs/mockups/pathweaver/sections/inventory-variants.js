// The inventory, twelve variants (2j3, js/inventory-variants.js): each in the right column at the
// level of the band above, then on the case of the other slots: a free text, a charm in Trinket1 and
// two ids the game data don't know.

const INV_CASES = [
  [false, "At the level of the band: ◀ ▶ or ← → move it"],
  [true, "A sample: « Any Belt », a free text without image; a charm in Trinket1, as Maxroll writes it; a unique and a slot the game data don't know"],
];

function inventoryVariant(id) {
  const variant = INV_VARIANTS[id], level = STATE.level;
  const cases = INV_CASES.map(([sample, label]) => `<p class="inv-v-case">${label}</p><aside class="app-side inv-v-column">${variant.render(invHints(level, sample), level, sample)}</aside>`).join("");
  return `<div class="app-window inv-v" style="width:330px"><p class="inv-v-text">${variant.text}</p>${cases}</div>`;
}

addSection(() => ["The inventory, twelve variants: square corners and the images of the items; normal N1–N3, high H1–H3, explosive E1–E3, free F1–F3", [
  ["The level of the build: ◀ ▶, the track or ← →", `<div class="app-window inv-v-band" style="width:960px">${levelBand()}</div>`],
  ...Object.entries(INV_VARIANTS).map(([id, variant]) => [variant.title, inventoryVariant(id)]),
]]);
