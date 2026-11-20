// The ascendancy at the centre of the tree (2i2, the owner, 2026-11-19): its passives moved by
// tools/make-data.py into the empty disc inside the ring of the class starts, every ascendancy shrunk
// alike to 85 %, over the portrait of the ascendancy, large and faded (its ink and its opacity are the
// controls « Portrait » and « Portrait opacity » at the top of the page). At level 80, where the build
// shown has taken seven of its nine passives of the ascendancy, the last at 80, ringed.

const CENTRE_ZOOMS = [["Whole", 0.021], ["Middle", 0.07], ["Close", 0.17]];

addSection(() => ["The ascendancy at the centre of the tree, over its portrait", CENTRE_ZOOMS.map(([label, scale]) => [
  `${label} · ${scale} px per unit · level 80`,
  `<div class="app-tree" style="width:960px;height:540px;flex:none"><canvas class="app-tree-canvas" data-tree="centre" data-scale="${scale}" data-level="80" aria-label="The centre of the tree, ${label.toLowerCase()}"></canvas></div>`,
])]);
