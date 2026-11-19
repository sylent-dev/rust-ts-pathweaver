// The controls over the tree (2i, the owner, 2026-11-19): the variant of the tab « Tree controls » at the
// top of the page, on the Overview at 960 px; the ascendancy waits for the centre of the tree (2i2).

addSection(() => [`The bottom bar of the tree: ${VARIANTS.treeControls.options[chosen.treeControls]} (the tab « Tree controls »)`, [
  ["The Overview · 960 px: the weapon set, the points, the legend behind its button, the zoom", `<div class="app-window" style="width:960px">${levelBand()}${buildTabs()}${overview()}</div>`],
]]);
