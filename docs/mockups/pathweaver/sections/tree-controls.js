// The controls over the tree (2i, the owner, 2026-11-19): the bottom bar T14 and the way to its legend
// of the tab « Legend » at the top of the page, on the Overview and the Tree tab; the ascendancy waits
// for the centre of the tree (2i2).

addSection(() => [`The legend of the tree: ${VARIANTS.legendWay.options[chosen.legendWay]}, of eleven (the tab « Legend »), on the bottom bar T14`, [
  ["The Overview · 960 px: the weapon set, the points, the legend behind its button, the zoom", `<div class="app-window" style="width:960px">${levelBand()}${buildTabs()}${overview()}</div>`],
  ["The Tree tab · 960 px: the tree in the whole window, without the right column", `<div class="app-window" style="width:960px">${levelBand()}${buildTabs("tree")}${treeTab()}</div>`],
  ["The Tree tab · 1,600 px", `<div class="app-window" style="width:1600px">${levelBand()}${buildTabs("tree")}${treeTab()}</div>`],
]]);
