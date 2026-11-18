// Where « N changes at N » goes in the band of L6 (2g, the owner, 2026-11-18): nine places, the
// temperature rising, each under the header of the build with room for its window.

addSection(() => ["Where « N changes » goes · 21 to 29, from a normal temperature to an explosive one: click it to open the window; one level for all", LEVEL_CHANGE_VARIANTS.map(variant =>
  [`${variant.n} · ${variant.name} (${variant.temperature}): ${variant.note}`,
    `<div class="app-window lvx-window" style="width:960px">${buildHeader()}${variant.render(levelContext())}<div class="lvx-page"></div></div>`])]);
