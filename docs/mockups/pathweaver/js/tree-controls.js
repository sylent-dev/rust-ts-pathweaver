// The controls over the tree: the weapon set shown strong, the points, the legend and the zoom (2i,
// the owner, 2026-11-19). The bottom bar is T14 · Ghost, of twenty variants: no border, a gradient
// dark at the bottom to clear upward, buttons without a box, the set shown in its colour (without the
// line under it), the counts in the middle. The legend is still open: eleven ways to reach it, T22–T32,
// picked with the tab « Legend » of the page.

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

const allCounts = c => `${c.shared} points · I ${c.one} · II ${c.two} · Ascendancy ${c.ascendancy}/${ASCENDANCY_POINTS}`;
const setButton = (set, label) =>
  `<button type="button" class="tc-set tc-ghost is-set${set}" data-action="tree-set" data-set="${set}" aria-pressed="${STATE.set === set}">${label}</button>`;
const ZOOM_ICONS = { in: ICONS.plus, out: ICONS.minus, fit: '<path d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3"/>' };
const zoomButton = way => way === "fit"
  ? `<button type="button" class="tc-zoom tc-ghost" data-action="tree-fit" aria-label="Fit the build">${icon(14, ZOOM_ICONS.fit)}</button>`
  : `<button type="button" class="tc-zoom tc-ghost" data-action="tree-zoom" data-zoom="${way}" aria-label="Zoom ${way}">${icon(14, ZOOM_ICONS[way])}</button>`;
const zoomButtons = () => `<span class="tc-group">${zoomButton("out")}${zoomButton("in")}${zoomButton("fit")}</span>`;
const legendButton = (label, extra = "", name = "Legend") =>
  `<button type="button" class="tc-legend-toggle tc-ghost ${extra}" data-action="tree-legend" aria-expanded="${STATE.treeLegend}" aria-pressed="${STATE.treeLegend}" aria-label="${name}">${label}</button>`;
const LEGEND_ICON = icon(14, '<path d="M2.5 4.5h3M2.5 8h3M2.5 11.5h3M7.5 4.5h6M7.5 8h6M7.5 11.5h4"/>');
const HELP_ICON = icon(14, '<circle cx="8" cy="8" r="5.8"/><path d="M6.4 6.3a1.7 1.7 0 1 1 2.3 1.6c-.5.2-.7.6-.7 1.1v.3M8 11.3v.1"/>');

// The legend: what each line and each passive means, the weapon sets included, and in a sentence.
const LEGEND = [
  ['<i class="tc-line"></i>', "shared", "taken whatever the weapon set"],
  ['<i class="tc-line is-set1"></i>', "set I", "taken only with weapon set I"],
  ['<i class="tc-line is-set2"></i>', "set II", "taken only with weapon set II"],
  ['<i class="tc-line is-later"></i>', "taken later", "taken at a level above this one"],
  ['<i class="app-dot"></i>', "not taken", "never taken by this build"],
  ['<i class="app-dot is-new"></i>', "new at this level", "taken at this very level"],
];
const legend = (extra = "", items = LEGEND) => `<div class="tc-legend app-weak ${extra}">${items.map(([swatch, label]) => `<span>${swatch}${label}</span>`).join("")}</div>`;
const open = html => (STATE.treeLegend ? html : "");

// The bottom bar of T14: the sets on the left, the counts in the middle, `end` on the right before the
// zoom; `above`, a row over the controls in the bar; `over`, what is drawn over the tree.
function bottomBar(c, { counts = `<span class="tc-counts app-number app-weak">${allCounts(c)}</span>`, end = "", above = "", over = "", barClass = "" } = {}) {
  return `<div class="tc-bb ${barClass}">${above}<span class="tc-row">
      <span class="tc-group">${setButton(1, "Set I")}${setButton(2, "Set II")}</span>${counts}
      <span class="tc-end">${end}${zoomButtons()}</span></span></div>${over}`;
}

// The eleven ways to the legend.
const LEGEND_VARIANTS = {
  // T22 · Card: its icon at the right end of the bar, the legend in a card over it.
  t22: c => bottomBar(c, { end: legendButton(LEGEND_ICON), over: open(legend("tc-card tc-pop is-right")) }),
  // T23 · Unfolding: « Legend » raises the bar, the legend on a row of the bar over the controls.
  t23: c => bottomBar(c, {
    end: legendButton(`${LEGEND_ICON}<span>${STATE.treeLegend ? "Hide" : "Legend"}</span>`, "tc-with-text"),
    above: open(legend("tc-unfolded")), barClass: STATE.treeLegend ? "is-raised" : "" }),
  // T24 · Shade at the top: a small tab hangs from the middle of the top edge; it pulls a shade down,
  // the mirror of the bottom bar, the legend in one line.
  t24: c => bottomBar(c, { over: `<div class="tc-shade ${STATE.treeLegend ? "is-open" : ""}">${open(legend("tc-shade-legend"))}
      ${legendButton(`Legend <span class="tc-chevron">${icon(10, ICONS.down)}</span>`, "tc-hanging")}</div>` }),
  // T25 · Corner: a « ? » alone at the top right of the tree, the legend in a card under it.
  t25: c => bottomBar(c, { over: `<span class="tc-corner">${legendButton(HELP_ICON, "tc-round")}</span>${open(legend("tc-card tc-pop is-top-right"))}` }),
  // T26 · The counts open it: the line of the counts in the middle is the button, the legend over it.
  t26: c => bottomBar(c, {
    counts: `<button type="button" class="tc-counts tc-ghost tc-counts-button app-number" data-action="tree-legend" aria-expanded="${STATE.treeLegend}" aria-pressed="${STATE.treeLegend}">${allCounts(c)}</button>`,
    over: open(legend("tc-card tc-pop is-centred")) }),
  // T27 · Swatches on the bar: the counts wear the lines of the sets; « ⋯ » for the rest of the legend.
  t27: c => bottomBar(c, {
    counts: `<span class="tc-counts app-number app-weak"><i class="tc-line"></i> ${c.shared} points · <i class="tc-line is-set1"></i> ${c.one} · <i class="tc-line is-set2"></i> ${c.two} · Ascendancy ${c.ascendancy}/${ASCENDANCY_POINTS}</span>`,
    end: legendButton('<span class="tc-dots">⋯</span>', "", "The rest of the legend"),
    over: open(legend("tc-card tc-pop is-right", LEGEND.slice(3))) }),
  // T28 · Drawer: a handle on the right edge of the tree; the legend slides in as a narrow panel.
  t28: c => bottomBar(c, { over: `<div class="tc-drawer ${STATE.treeLegend ? "is-open" : ""}">
      ${legendButton('<span class="tc-handle-text">Legend</span>', "tc-handle")}
      <div class="tc-drawer-panel">${legend("tc-drawer-legend")}</div></div>` }),
  // T29 · Peek: the legend shows while the pointer is over its button, and stays once clicked.
  t29: c => bottomBar(c, { end: `<span class="tc-peek ${STATE.treeLegend ? "is-pinned" : ""}">${legendButton(LEGEND_ICON)}${legend("tc-card tc-peek-card")}</span>` }),
  // T30 · Explained: « Legend » opens a card over the bar, each line with its sentence.
  t30: c => bottomBar(c, {
    end: legendButton(`<span>Legend</span><span class="tc-chevron is-up">${icon(10, ICONS.down)}</span>`, "tc-with-text"),
    over: open(`<div class="tc-card tc-pop is-right tc-sheet">${LEGEND.map(([swatch, label, sentence]) =>
      `<span class="tc-sheet-row">${swatch}<b>${label}</b><span class="app-weak">${sentence}</span></span>`).join("")}</div>`) }),
  // T31 · A key: L shows the legend anywhere on the page, the bar says so with the key.
  t31: c => bottomBar(c, { end: legendButton("<kbd>L</kbd><span>legend</span>", "tc-with-text"), over: open(legend("tc-card tc-pop is-right")) }),
  // T32 · Pill at the top: the swatches alone in a pill at the top middle; a click spells them out.
  t32: c => bottomBar(c, { over: `<span class="tc-pill ${STATE.treeLegend ? "is-open" : ""}">
      <button type="button" class="tc-pill-button" data-action="tree-legend" aria-expanded="${STATE.treeLegend}" aria-label="Legend">
        ${LEGEND.map(([swatch, label]) => `<span>${swatch}${STATE.treeLegend ? `<span>${label}</span>` : ""}</span>`).join("")}</button></span>` }),
};

function treeControls(level) {
  return `<div class="tc tc-${chosen.legendWay}">${LEGEND_VARIANTS[chosen.legendWay](treeCounts(level))}</div>`;
}

ACTIONS["tree-legend"] = () => {
  STATE.treeLegend = !STATE.treeLegend;
  return true;
};

// The key of T31: L opens and closes the legend, unless a field has the focus.
document.addEventListener("keydown", event => {
  if (chosen.legendWay !== "t31" || event.key.toLowerCase() !== "l" || event.target.closest("input, textarea, select")) return;
  STATE.treeLegend = !STATE.treeLegend;
  renderSheet();
});
