// The tree at its real size (2i3): the page of a build in a window of 1,600 × 1,000 pixels, what the
// owner's screen of 2,560 × 1,440 leaves to a wide window, on the Tree tab, at the level of the page;
// the tree drawn once per frame of the screen, and a counter of the frames per second while it moves.

addSection(() => ["The tree at its real size: the Tree tab in a window of 1,600 × 1,000 px; drag and zoom it, the counter at the bottom right", [
  [`Tree · level ${STATE.level} · ${escapeHtml(SHOWN.name)}`,
    `<div class="app-window app-window-full" style="width:1600px;height:1000px">${appBar(1600)}${buildHeader()}${levelBand()}${buildTabs("tree")}${treeTab({ view: "real", fps: true })}</div>`],
]]);
