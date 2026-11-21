// The Inventory tab (2k2): H1, the drawing and the detail of the slot chosen, at the level of the band
// (◀ ▶), then on two cases of the corpus: the most hints, an Amazon at 40 (13 hints, 17 to come at 65); a
// campaign of free texts at 32, three hints one after the other on the weapon of set I.

const inventoryTabWindow = (band, level, source) =>
  `<div class="app-window" style="width:960px">${band ? levelBand() : ""}${buildTabs("inventory")}${inventoryTab(level, source)}</div>`;

addSection(() => [`The Inventory tab: H1 cut in two, a click on a slot or a line shows its hint on the right; the sliders « Pane start », « Pane shade » and « Pane line », and the switch of the weapon set in twelve variants with the tabs « Set switch » (2k2b): normal N1–N3, high H1–H3, explosive E1–E3, free F1–F3; ${SET_SWITCHES[chosen.setSwitch].title}`, [
  [`${SET_SWITCHES[chosen.setSwitch].title}: ${SET_SWITCHES[chosen.setSwitch].text} At the level of the band: ◀ ▶, the track or ← →`, inventoryTabWindow(true, STATE.level)],
  ["An Amazon at 40: the most hints of the corpus, 13 at the level, 17 to come at 65", inventoryTabWindow(false, 40, "replaced")],
  ["A campaign at 32: free texts, three hints one after the other on the weapon of set I", inventoryTabWindow(false, 32, "campaign")],
]]);
