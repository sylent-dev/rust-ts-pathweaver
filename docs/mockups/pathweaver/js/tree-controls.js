// The controls over the tree: the weapon set shown strong, the points, the legend and the zoom (2i,
// the owner, 2026-11-19). Twelve variants, three at each of four temperatures: normal (T1–T3), high
// (T4–T6), explosive (T7–T9), free (T10–T12); the tab « Tree controls » of the page picks one.

STATE.treeLegend = false;

// What the controls show at the level: the passives shared, those of each set, the ascendancy.
function treeCounts(level) {
  return {
    shared: passivesAt(level, 0).length,
    one: passivesAt(level, 1).length,
    two: passivesAt(level, 2).length,
    ascendancy: TREE.ascendancyTaken.filter(([, low, high]) => appliesAt([low, high], level)).length,
  };
}

const setButton = (set, label, extra = "") =>
  `<button type="button" class="tc-set is-set${set} ${extra}" data-action="tree-set" data-set="${set}" aria-pressed="${STATE.set === set}">${label}</button>`;
const zoomButton = (way, size = 14) => way === "fit"
  ? `<button type="button" class="tc-zoom" data-action="tree-fit" aria-label="Fit the build">${icon(size, '<path d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3"/>')}</button>`
  : `<button type="button" class="tc-zoom" data-action="tree-zoom" data-zoom="${way}" aria-label="Zoom ${way}">${icon(size, way === "in" ? ICONS.plus : ICONS.minus)}</button>`;
const legendToggle = label => `<button type="button" class="tc-legend-toggle" data-action="tree-legend" aria-pressed="${STATE.treeLegend}">${label}</button>`;

// The legend: what each line and each passive means, the weapon sets included.
const LEGEND = [
  ['<i class="tc-line"></i>', "shared"], ['<i class="tc-line is-set1"></i>', "set I"], ['<i class="tc-line is-set2"></i>', "set II"],
  ['<i class="tc-line is-later"></i>', "taken later"], ['<i class="app-dot"></i>', "not taken"], ['<i class="app-dot is-new"></i>', "new here"],
];
// The short legend leaves out what the tree shows plainly (a passive not taken), in fewer words.
const legend = (extra = "", short = false) => `<div class="tc-legend app-weak ${extra}">${LEGEND.filter(([, label]) => !short || label !== "not taken").map(([swatch, label]) =>
  `<span>${swatch}${short ? label.replace("taken later", "later").replace("new here", "new") : label}</span>`).join("")}</div>`;

const VARIANT_HTML = {
  // Normal: what a map tool does.
  t1: c => `
    <div class="tc-t1-top"><span class="app-switch"><span class="app-switch-label">Weapon set</span>${setButton(1, "I")}${setButton(2, "II")}</span>
      <span class="app-number tc-glass">${c.shared} pts · I ${c.one} · II ${c.two} · asc. ${c.ascendancy} / ${ASCENDANCY_POINTS}</span></div>
    <div class="tc-t1-zoom">${zoomButton("in")}${zoomButton("out")}${zoomButton("fit")}</div>
    ${legend("tc-glass tc-t1-legend")}`,
  t2: c => `
    <div class="tc-t2-bar">
      <span class="app-switch">${setButton(1, "Set I")}${setButton(2, "Set II")}</span>
      ${legend("", true)}
      <span class="app-number">${c.shared} · I ${c.one} · II ${c.two} · asc. ${c.ascendancy}/${ASCENDANCY_POINTS}</span>
      <span class="tc-t2-zoom">${zoomButton("out")}${zoomButton("in")}</span>
    </div>`,
  t3: c => `
    <div class="tc-t3-bar">
      <span class="tc-segment">${setButton(1, "I")}${setButton(2, "II")}</span>
      <span class="app-number"><b>${c.shared}</b> points <span class="app-weak">· set I ${c.one} · set II ${c.two} · ascendancy ${c.ascendancy} / ${ASCENDANCY_POINTS}</span></span>
      <span class="tc-t3-end">${legendToggle("Legend")}${zoomButton("out")}${zoomButton("in")}${zoomButton("fit")}</span>
    </div>
    ${STATE.treeLegend ? legend("tc-card tc-t3-legend") : ""}`,

  // High: one object that holds the controls, a number that leads.
  t4: c => `
    <div class="tc-t4-points"><span class="tc-big app-number">${c.shared}</span><span class="tc-t4-unit">points</span>
      <span class="tc-t4-sub app-number"><i class="is-set1">I ${c.one}</i> <i class="is-set2">II ${c.two}</i> · asc. ${c.ascendancy} / ${ASCENDANCY_POINTS}</span></div>
    <div class="tc-t4-capsule">${zoomButton("out")}${zoomButton("in")}<i class="tc-sep"></i>${setButton(1, "I")}${setButton(2, "II")}<i class="tc-sep"></i>${legendToggle(icon(14, '<circle cx="8" cy="8" r="5.5"/><path d="M8 7.2v3.6M8 5.2v.1"/>'))}</div>
    ${STATE.treeLegend ? legend("tc-card tc-t4-legend") : ""}`,
  t5: c => `
    <div class="tc-card tc-t5-card">
      <span class="tc-t5-title app-number">${c.shared} points · ascendancy ${c.ascendancy} / ${ASCENDANCY_POINTS}</span>
      <span class="tc-t5-row"><i class="tc-line"></i>shared<b class="app-number">${c.shared}</b></span>
      <button type="button" class="tc-t5-row" data-action="tree-set" data-set="1" aria-pressed="${STATE.set === 1}"><i class="tc-line is-set1"></i>weapon set I<b class="app-number">${c.one}</b></button>
      <button type="button" class="tc-t5-row" data-action="tree-set" data-set="2" aria-pressed="${STATE.set === 2}"><i class="tc-line is-set2"></i>weapon set II<b class="app-number">${c.two}</b></button>
      <span class="tc-t5-row app-weak"><i class="tc-line is-later"></i>taken later</span>
      <span class="tc-t5-row app-weak"><i class="app-dot is-new"></i>new here</span>
    </div>
    <div class="tc-t5-zoom">${zoomButton("out")}${zoomButton("in")}</div>`,
  t6: c => `
    <div class="tc-t6-rail">${zoomButton("in")}${zoomButton("out")}${zoomButton("fit")}<i class="tc-sep"></i>${setButton(1, "I")}${setButton(2, "II")}<i class="tc-sep"></i>${legendToggle(icon(14, '<path d="M3 4.5h10M3 8h10M3 11.5h6"/>'))}</div>
    <span class="tc-t6-count app-number app-weak">${c.shared} pts · I ${c.one} · II ${c.two} · asc. ${c.ascendancy}/${ASCENDANCY_POINTS}</span>
    ${STATE.treeLegend ? legend("tc-card tc-t6-legend") : ""}`,

  // Explosive: the tree as the screen of a game, a compass, a printed map.
  t7: c => `
    <i class="tc-t7-corner is-tl"></i><i class="tc-t7-corner is-tr"></i><i class="tc-t7-corner is-bl"></i><i class="tc-t7-corner is-br"></i>
    <div class="tc-t7-points"><span class="tc-huge app-number">${c.shared}</span><span class="tc-caps">points</span></div>
    <div class="tc-t7-gauges">${[[1, c.one], [2, c.two]].map(([set, count]) =>
      `<button type="button" class="tc-t7-gauge" style="--set:var(--tree-set-${set})" data-action="tree-set" data-set="${set}" aria-pressed="${STATE.set === set}"><span class="tc-caps">${set === 1 ? "I" : "II"}</span><i style="--fill:${Math.min(100, (count / 24) * 100)}%"></i><b class="app-number">${count}</b></button>`).join("")}</div>
    <div class="tc-t7-ascendancy"><span class="tc-caps">ascendancy</span>${Array.from({ length: ASCENDANCY_POINTS }, (_, i) => `<i class="${i < c.ascendancy ? "is-taken" : ""}"></i>`).join("")}</div>
    <div class="tc-t7-zoom">${zoomButton("in")}<span class="tc-t7-track"><i class="tc-zoom-knob"></i></span>${zoomButton("out")}</div>
    <div class="tc-t7-legend tc-caps app-weak"><span><i class="app-dot is-new"></i>new</span><span><i class="tc-line is-later"></i>later</span></div>`,
  t8: c => `
    <div class="tc-t8-compass">
      <span class="tc-t8-centre"><b class="app-number">${c.shared}</b><span>pts</span></span>
      <button type="button" class="tc-t8-n" data-action="tree-zoom" data-zoom="in" aria-label="Zoom in">+</button>
      <button type="button" class="tc-t8-s" data-action="tree-zoom" data-zoom="out" aria-label="Zoom out">−</button>
      ${setButton(1, `I<small>${c.one}</small>`, "tc-t8-w")}${setButton(2, `II<small>${c.two}</small>`, "tc-t8-e")}
    </div>
    <span class="tc-t8-ascendancy app-number app-weak">asc. ${c.ascendancy} / ${ASCENDANCY_POINTS}</span>
    ${legend("tc-glass tc-t8-legend")}`,
  t9: c => `
    <i class="tc-t9-frame"></i>
    <div class="tc-t9-top tc-caps app-weak">${LEGEND.map(([swatch, label]) => `<span>${swatch}${label}</span>`).join("")}</div>
    <div class="tc-t9-left tc-caps"><span class="app-weak">weapon set</span>${setButton(1, "I")}${setButton(2, "II")}</div>
    <div class="tc-t9-bottom tc-caps app-number">${c.shared} points <span class="is-set1">· I ${c.one}</span> <span class="is-set2">· II ${c.two}</span> · ascendancy ${c.ascendancy} / ${ASCENDANCY_POINTS}</div>
    <div class="tc-t9-right">${zoomButton("in", 12)}<span class="tc-t9-scale"><i class="tc-zoom-knob"></i></span>${zoomButton("out", 12)}</div>`,

  // Free: what else the tree could do.
  t10: c => `
    <div class="tc-t10-layer">
      <div class="tc-t10-top"><span class="app-switch">${setButton(1, "I")}${setButton(2, "II")}</span>
        <span class="app-number">${c.shared} pts · I ${c.one} · II ${c.two} · asc. ${c.ascendancy}/${ASCENDANCY_POINTS}</span>
        <span class="tc-t10-zoom">${zoomButton("out")}${zoomButton("in")}${zoomButton("fit")}</span></div>
      ${legend("tc-glass tc-t10-legend")}
    </div>
    <div class="tc-t10-keys app-weak"><kbd>1</kbd><kbd>2</kbd> sets · <kbd>+</kbd><kbd>−</kbd> zoom · <kbd>0</kbd> fit · hover for more</div>`,
  t11: c => `
    <div class="tc-t11-chips">${[[0, "Both", c.shared + c.one + c.two], [3, "Shared", c.shared], [1, "Set I", c.one], [2, "Set II", c.two]].map(([set, label, count]) =>
      `<button type="button" class="tc-chip is-set${set}" data-action="tree-set" data-set="${set}" aria-pressed="${STATE.set === set}">${label} <b class="app-number">${count}</b></button>`).join("")}
      <span class="tc-chip is-static app-number">asc. ${c.ascendancy}/${ASCENDANCY_POINTS}</span></div>
    <label class="tc-t11-zoom">${icon(12, ICONS.minus)}<input type="range" class="tc-zoom-range" min="0" max="1000" aria-label="Zoom">${icon(12, ICONS.plus)}</label>
    <div class="tc-t11-legend app-weak"><span><i class="app-dot is-new"></i>new here</span><span><i class="tc-line is-later"></i>taken later</span></div>`,
  t12: c => `
    <div class="tc-t12-top"><span class="app-switch">${setButton(1, "I")}${setButton(2, "II")}</span>
      <span class="app-number tc-glass">${c.shared} pts · I ${c.one} · II ${c.two} · asc. ${c.ascendancy}/${ASCENDANCY_POINTS}</span>
      ${legendToggle("?")}</div>
    ${STATE.treeLegend ? legend("tc-card tc-t12-legend") : ""}
    <div class="tc-t12-map"><canvas class="tc-minimap" data-tree="minimap" aria-label="Minimap"></canvas>
      <span class="tc-t12-zoom">${zoomButton("out", 12)}${zoomButton("in", 12)}${zoomButton("fit", 12)}</span></div>`,
};

function treeControls(level) {
  const variant = chosen.treeControls;
  return `<div class="tc tc-${variant}">${VARIANT_HTML[variant](treeCounts(level))}</div>`;
}

ACTIONS["tree-legend"] = () => {
  STATE.treeLegend = !STATE.treeLegend;
  return true;
};

// The minimap (T12): the whole tree in dots, the view of the main tree as a frame of the accent.
function drawMinimap(main) {
  const minimap = main.parentElement.querySelector(".tc-minimap");
  if (!minimap) return;
  const width = minimap.clientWidth, height = minimap.clientHeight;
  const view = fitView(TREE.nodes, TREE.nodes.map((_, i) => i), width, height, 8);
  drawTree(minimap, TREE, treeStates(TREE.taken, TREE.nodes.length, STATE.level), view,
    { minRadius: 0.6, iconsFromPx: Infinity, sets: setMasks(TREE.taken, TREE.nodes.length), shownSet: STATE.set });
  const context = minimap.getContext("2d"), main_ = STATE.treeView;
  const w = (main.clientWidth / main_.scale) * view.scale, h = (main.clientHeight / main_.scale) * view.scale;
  const x = (main_.x - view.x) * view.scale + width / 2, y = (main_.y - view.y) * view.scale + height / 2;
  context.strokeStyle = token(minimap, "--accent");
  context.lineWidth = 1.5;
  context.strokeRect(x - w / 2, y - h / 2, w, h);
}

// The knobs and the slider of the zoom follow the view of the tree.
function placeZoom(main) {
  const place = zoomPlace(STATE.treeView.scale);
  for (const knob of main.parentElement.querySelectorAll(".tc-zoom-knob")) knob.style.setProperty("--place", place);
  const range = main.parentElement.querySelector(".tc-zoom-range");
  if (range) range.value = Math.round(place * 1000);
}
TREE_DRAWN.push(drawMinimap, placeZoom);

// The slider of the zoom (T11): from the furthest to the closest, around the middle of the tree.
document.getElementById("sheet").addEventListener("input", event => {
  if (!event.target.matches(".tc-zoom-range")) return;
  const main = event.target.closest(".app-tree").querySelector('canvas[data-tree="main"]');
  const scale = ZOOM_RANGE[0] * (ZOOM_RANGE[1] / ZOOM_RANGE[0]) ** (event.target.value / 1000);
  zoomTree(main, scale / STATE.treeView.scale);
  mountTrees();
});

// The keys of T10, while the pointer is over a tree.
document.addEventListener("keydown", event => {
  if (chosen.treeControls !== "t10" || !document.querySelector(".app-tree:hover")) return;
  const main = document.querySelector(".app-tree:hover canvas[data-tree='main']");
  const actions = { 1: () => { STATE.set = 1; }, 2: () => { STATE.set = 2; }, "+": () => zoomTree(main, 1.4), "-": () => zoomTree(main, 1 / 1.4), 0: () => { STATE.treeView = null; } };
  if (!actions[event.key]) return;
  actions[event.key]();
  renderSheet();
});
