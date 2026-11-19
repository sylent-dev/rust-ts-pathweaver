// The passives with the icons and frames of the game (2i, the owner, 2026-11-18): each kind, not
// taken and taken, at the size of the sheets; then the tree of the build shown at three zooms, as
// the shapes of the style and with the icons, to see from what size the icons pay off.

// The kinds shown, each with the graph its sample is taken from.
const ART_KINDS = [
  ["Small", "small", false], ["Attribute", "attribute", false], ["Notable", "notable", false],
  ["Keystone", "keystone", false], ["Jewel socket", "jewel", false],
  ["Ascendancy", "small", true], ["Ascendancy notable", "notable", true], ["Ascendancy start", "start", true],
];
// The zooms compared: the build whole, as the Overview opens it, then the pixels of the screen per
// pixel of the sheets (1: the sheets as they are, the deepest zoom of the tree).
const ART_ZOOMS = [["build", "The build whole, as the Overview opens it"], ["0.3", "Middle"], ["1", "Close, the deepest zoom"]];

const artCanvas = (zoom, icons) => `<div class="app-tree" style="width:460px;height:300px;flex:none"><canvas class="app-tree-canvas" data-tree="sample" data-zoom="${zoom}" data-icons="${icons}" aria-label="Passive tree"></canvas></div>`;

addSection(() => ["The passives with the icons and frames of the game: each kind, then the tree at three zooms", [
  ["Each kind of passive, not taken (top) and taken (bottom), at the size of the sheets", `<div class="app-tree" style="width:960px;height:270px;flex:none"><canvas class="app-tree-canvas" data-tree="kinds" aria-label="Kinds of passives"></canvas></div>`],
  ...ART_ZOOMS.flatMap(([zoom, title]) => [
    [`${title} · the shapes of the style`, artCanvas(zoom, "off")],
    [`${title} · the icons of the game`, artCanvas(zoom, "on")],
  ]),
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

// The tree of the build shown, centred on the notable taken at the level nearest the middle of the
// build.
function drawSample(canvas) {
  const states = treeStates(TREE.taken, TREE.nodes.length, STATE.level, STATE.set ?? 1);
  const fit = fitView(TREE.nodes, TREE.taken.map(([i]) => i), canvas.clientWidth, canvas.clientHeight, 40);
  let view = fit;
  if (canvas.dataset.zoom !== "build") {
    const distance = i => Math.hypot(TREE.nodes[i][0] - fit.x, TREE.nodes[i][1] - fit.y);
    const notables = TREE.taken.map(([i]) => i).filter(i => TREE.kinds[TREE.nodes[i][2]] === "notable" && states[i] >= 2);
    const middle = notables.reduce((best, i) => (distance(i) < distance(best) ? i : best), notables[0]);
    view = { x: TREE.nodes[middle][0], y: TREE.nodes[middle][1], scale: Number(canvas.dataset.zoom) * TREE.sheets.scale };
  }
  drawTree(canvas, TREE, states, view, "", 1.5, canvas.dataset.icons === "on" ? 0 : Infinity);
}

AFTER_RENDER.push(() => {
  for (const canvas of document.querySelectorAll('canvas[data-tree="kinds"]')) drawKinds(canvas);
  for (const canvas of document.querySelectorAll('canvas[data-tree="sample"]')) drawSample(canvas);
});
