// The motion of the controls over the tree (2i4): the Tree tab at its real size, as in 2i3, to try the
// variants of the tabs at the top of the page; the counter shows the frames per second of the motions too.

addSection(() => ["The motion of the controls over the tree: switch Set I and Set II at the bottom left; the variants in the tabs at the top", [
  [`Tree · level ${STATE.level} · ${VARIANTS.setMotion.options[chosen.setMotion]}`,
    `<div class="app-window app-window-full" style="width:1600px;height:1000px">${appBar(1600)}${buildHeader()}${levelBand()}${buildTabs("tree")}${treeTab({ view: "motion", fps: true })}</div>`],
]]);
