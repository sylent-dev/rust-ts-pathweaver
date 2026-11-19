// The controls over the tree: the weapon set shown strong, the points, the legend and the zoom (2i,
// the owner, 2026-11-19). Of twelve variants (T1–T12), the owner kept T2, the bottom bar, as discreet
// as can be: no border, a gradient dark at the bottom to clear upward, the legend behind a button.
// T13–T20 vary it; the tab « Tree controls » of the page picks one.

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

const ascendancyCount = c => `asc. ${c.ascendancy}/${ASCENDANCY_POINTS}`;
const allCounts = c => `${c.shared} pts · I ${c.one} · II ${c.two} · ${ascendancyCount(c)}`;
const setButton = (set, label, extra = "") =>
  `<button type="button" class="tc-set is-set${set} ${extra}" data-action="tree-set" data-set="${set}" aria-pressed="${STATE.set === set}">${label}</button>`;
const ZOOM_ICONS = { in: ICONS.plus, out: ICONS.minus, fit: '<path d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3"/>' };
const zoomButton = (way, extra = "") => way === "fit"
  ? `<button type="button" class="tc-zoom ${extra}" data-action="tree-fit" aria-label="Fit the build">${icon(14, ZOOM_ICONS.fit)}</button>`
  : `<button type="button" class="tc-zoom ${extra}" data-action="tree-zoom" data-zoom="${way}" aria-label="Zoom ${way}">${icon(14, ZOOM_ICONS[way])}</button>`;
const zoomButtons = (extra = "") => `<span class="tc-group">${zoomButton("out", extra)}${zoomButton("in", extra)}${zoomButton("fit", extra)}</span>`;
const legendButton = (label, extra = "") =>
  `<button type="button" class="tc-legend-toggle ${extra}" data-action="tree-legend" aria-expanded="${STATE.treeLegend}" aria-pressed="${STATE.treeLegend}">${label}</button>`;
const LEGEND_ICON = icon(14, '<path d="M2.5 4.5h3M2.5 8h3M2.5 11.5h3M7.5 4.5h6M7.5 8h6M7.5 11.5h4"/>');

// The legend: what each line and each passive means, the weapon sets included.
const LEGEND = [
  ['<i class="tc-line"></i>', "shared"], ['<i class="tc-line is-set1"></i>', "set I"], ['<i class="tc-line is-set2"></i>', "set II"],
  ['<i class="tc-line is-later"></i>', "taken later"], ['<i class="app-dot"></i>', "not taken"], ['<i class="app-dot is-new"></i>', "new at this level"],
];
const legend = (extra = "") => `<div class="tc-legend app-weak ${extra}">${LEGEND.map(([swatch, label]) => `<span>${swatch}${label}</span>`).join("")}</div>`;
// The legend opened by its button: a card over the right end of the bar.
const legendCard = (extra = "") => (STATE.treeLegend ? legend(`tc-card tc-pop ${extra}`) : "");

// The bottom bar: a gradient of the shade of the tree, dark at the bottom, clear at its top.
const bar = (variant, body, after = legendCard()) => `<div class="tc-bb tc-bb-${variant}">${body}</div>${after}`;
// The bar of most variants: the sets on the left, the counts, the legend and the zoom on the right.
const ghostBar = (variant, c) => bar(variant, `
  <span class="tc-group">${setButton(1, "Set I", "tc-ghost")}${setButton(2, "Set II", "tc-ghost")}</span>
  <span class="app-number app-weak">${allCounts(c)}</span>
  <span class="tc-end">${legendButton(LEGEND_ICON, "tc-ghost")}${zoomButtons("tc-ghost")}</span>`);

const VARIANT_HTML = {
  // T2 as the owner kept it, for comparison: a strip with its border, the legend inline.
  t2: c => `
    <div class="tc-t2-bar">
      <span class="app-switch">${setButton(1, "Set I")}${setButton(2, "Set II")}</span>
      <div class="tc-legend app-weak tc-t2-legend">${LEGEND.filter(([, label]) => label !== "not taken").map(([swatch, label]) =>
        `<span>${swatch}${label.replace("taken later", "later").replace("new at this level", "new")}</span>`).join("")}</div>
      <span class="app-number">${c.shared} · I ${c.one} · II ${c.two} · ${ascendancyCount(c)}</span>
      <span class="tc-group">${zoomButton("out")}${zoomButton("in")}</span>
    </div>`,
  // T13 · Gradient: T2 without its border, on a gradient, the legend behind a button.
  t13: c => bar("t13", `
    <span class="app-switch">${setButton(1, "Set I")}${setButton(2, "Set II")}</span>
    <span class="app-number app-weak">${allCounts(c)}</span>
    <span class="tc-end">${legendButton("Legend")}${zoomButtons()}</span>`),
  // T14 · Ghost: no box at all, words and icons on the gradient; the set shown in its colour, underlined.
  t14: c => ghostBar("t14", c),
  // T15 · Counts in the sets: each set says its points, the shared ones beside them.
  t15: c => bar("t15", `
    <span class="tc-group"><span class="tc-shared app-number"><i class="tc-line"></i>${c.shared}</span>
      ${setButton(1, `<i class="tc-line is-set1"></i>I <b class="app-number">${c.one}</b>`, "tc-ghost")}${setButton(2, `<i class="tc-line is-set2"></i>II <b class="app-number">${c.two}</b>`, "tc-ghost")}</span>
    <span class="app-number app-weak">${ascendancyCount(c)}</span>
    <span class="tc-end">${legendButton("?", "tc-ghost tc-round")}${zoomButtons("tc-ghost")}</span>`),
  // T16 · Centred: one short line in the middle, its parts parted by dots, nothing at the corners.
  t16: c => bar("t16", `
    <span class="tc-centred">${setButton(1, "I", "tc-ghost")}${setButton(2, "II", "tc-ghost")}<i class="tc-dot"></i>
      <span class="app-number app-weak">${allCounts(c)}</span><i class="tc-dot"></i>
      ${zoomButton("out", "tc-ghost")}${zoomButton("in", "tc-ghost")}${zoomButton("fit", "tc-ghost")}<i class="tc-dot"></i>${legendButton(LEGEND_ICON, "tc-ghost")}</span>`,
    legendCard("is-centred")),
  // T17 · Tabs: the sets as the tabs of a build, a line of their colour under the one shown; the zoom says how close.
  t17: c => bar("t17", `
    <span class="tc-group">${setButton(1, `Set I <b class="app-number">${c.one}</b>`, "tc-tab")}${setButton(2, `Set II <b class="app-number">${c.two}</b>`, "tc-tab")}</span>
    <span class="app-number app-weak">${c.shared} shared · ${ascendancyCount(c)}</span>
    <span class="tc-end">${legendButton("Legend", "tc-ghost")}<span class="tc-group">${zoomButton("out", "tc-ghost")}<span class="tc-zoom-level app-number app-weak"></span>${zoomButton("in", "tc-ghost")}</span></span>`),
  // T18 · Frosted: the gradient blurs the tree under it too, fading upward.
  t18: c => ghostBar("t18", c),
  // T19 · Quiet: the bar faint until the pointer comes near it, then whole.
  t19: c => ghostBar("t19", c),
  // T20 · Unfolding: the button of the legend raises the bar, the legend on a row above the controls.
  t20: c => bar(`t20 ${STATE.treeLegend ? "is-open" : ""}`, `
    ${STATE.treeLegend ? legend("tc-t20-legend") : ""}
    <span class="tc-row"><span class="tc-group">${setButton(1, "Set I", "tc-ghost")}${setButton(2, "Set II", "tc-ghost")}</span>
      <span class="app-number app-weak">${allCounts(c)}</span>
      <span class="tc-end">${legendButton(`${LEGEND_ICON}<span>${STATE.treeLegend ? "Hide" : "Legend"}</span>`, "tc-ghost tc-with-text")}${zoomButtons("tc-ghost")}</span></span>`, ""),
};

function treeControls(level) {
  const variant = chosen.treeControls;
  return `<div class="tc tc-${variant}">${VARIANT_HTML[variant](treeCounts(level))}</div>`;
}

ACTIONS["tree-legend"] = () => {
  STATE.treeLegend = !STATE.treeLegend;
  return true;
};

// How close the tree is (T17): its scale against the one that fits the build.
TREE_DRAWN.push(main => {
  const level = main.parentElement.querySelector(".tc-zoom-level");
  if (level) level.textContent = `×${(STATE.treeView.scale / STATE.treeFit).toFixed(1)}`;
});
