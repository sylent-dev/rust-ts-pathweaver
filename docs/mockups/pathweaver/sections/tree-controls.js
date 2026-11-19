// The controls over the tree (2i, the owner, 2026-11-19): the variant of the tab « Tree controls » at the
// top of the page, on the Overview at 960 px; the ascendancy waits for the centre of the tree (2i2).

addSection(() => [`The controls over the tree: ${VARIANTS.treeControls.options[chosen.treeControls]}, of twelve (the tab « Tree controls »)`, [
  ["The Overview · 960 px: the weapon set, the points, the legend and the zoom", `<div class="app-window" style="width:960px">${levelBand()}${buildTabs()}${overview()}</div>`],
]]);
