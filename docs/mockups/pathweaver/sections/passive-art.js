// The passives with the icons and frames of the game (2i, the owner, 2026-11-18): each kind, not
// taken and taken, at the size of the sheets. The tree shows them from a frame of 2 px (the owner,
// 2026-11-19), compared at three zooms with the shapes of the style, the comparison removed since.

// The kinds shown, each with the graph its sample is taken from.
const ART_KINDS = [
  ["Small", "small", false], ["Attribute", "attribute", false], ["Notable", "notable", false],
  ["Keystone", "keystone", false], ["Jewel socket", "jewel", false],
  ["Ascendancy", "small", true], ["Ascendancy notable", "notable", true], ["Ascendancy start", "start", true],
];
addSection(() => ["The passives with the icons and frames of the game: each kind", [
  ["Each kind of passive, not taken (top) and taken (bottom), at the size of the sheets", `<div class="app-tree" style="width:960px;height:270px;flex:none"><canvas class="app-tree-canvas" data-tree="kinds" aria-label="Kinds of passives"></canvas></div>`],
]]);

// Each kind at the size of the sheets: the first passive of the kind that has its icon.
function drawKinds(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  if (!artReady()) return;
  const step = width / ART_KINDS.length;
  context.font = `500 12px ${token(canvas, "--font-text")}`;
  context.fillStyle = token(canvas, "--weak");
  context.textAlign = "center";
  for (const [i, [label, kind, ascendancy]] of ART_KINDS.entries()) {
    const graph = ascendancy ? TREE.ascendancy : TREE;
    const node = graph.nodes.find(n => TREE.kinds[n[2]] === kind && (n[3] >= 0 || kind === "jewel" || kind === "start"));
    const x = step * (i + 0.5);
    for (const [row, taken] of [false, true].entries()) drawArt(context, frameOf(graph, node), node[3], taken, x, 65 + row * 115, 1);
    context.fillText(label, x, height - 10);
  }
}

AFTER_RENDER.push(() => {
  for (const canvas of document.querySelectorAll('canvas[data-tree="kinds"]')) drawKinds(canvas);
});
