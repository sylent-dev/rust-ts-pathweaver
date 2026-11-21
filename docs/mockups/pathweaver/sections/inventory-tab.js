// The Inventory tab (2k2), twelve variants chosen with the tabs « Inventory tab » at the top of the page: at
// the level of the band (◀ ▶), then on two cases of the corpus: the most hints, an Amazon at 40 (13 hints, 17
// to come at 65, 13 of them in place of another); a campaign of free texts at 32, up to three hints one
// after the other on a weapon (two of them both at 32).

const inventoryTabWindow = (band, level, source) =>
  `<div class="app-window" style="width:960px">${band ? levelBand() : ""}${buildTabs("inventory")}${inventoryTab(level, source)}</div>`;

addSection(() => {
  const variant = INVENTORY_TAB_VARIANTS[chosen.inventoryTab] ?? INVENTORY_TAB_VARIANTS.n1;
  return [`The Inventory tab, twelve variants with the tabs « Inventory tab » at the top: normal N1–N3, high H1–H3, explosive E1–E3, free F1–F3; ${variant.title}`, [
    [`${variant.title}: ${variant.text} At the level of the band: ◀ ▶, the track or ← →`, inventoryTabWindow(true, STATE.level)],
    ["An Amazon at 40: the most hints of the corpus, 13 at the level, 17 to come at 65", inventoryTabWindow(false, 40, "replaced")],
    ["A campaign at 32: free texts, three hints one after the other on the weapon of set I", inventoryTabWindow(false, 32, "campaign")],
  ]];
});
