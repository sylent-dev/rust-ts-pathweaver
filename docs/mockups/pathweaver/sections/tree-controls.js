// The controls over the tree (2i, the owner, 2026-11-19): the legend always at the top, the bottom bar
// T14, on the Overview and on the Tree tab; the ascendancy waits for the centre of the tree (2i2).

addSection(() => ["The controls over the tree: the legend at the top, the bottom bar T14 · Ghost", [
  ["The Overview · 960 px: the weapon set, the points, the zoom", `<div class="app-window" style="width:960px">${levelBand()}${buildTabs()}${overview()}</div>`],
  ["The Tree tab · 960 px: the tree in the whole window, without the right column", `<div class="app-window" style="width:960px">${levelBand()}${buildTabs("tree")}${treeTab()}</div>`],
  ["The Tree tab · 1,600 px", `<div class="app-window" style="width:1600px">${levelBand()}${buildTabs("tree")}${treeTab()}</div>`],
]]);
