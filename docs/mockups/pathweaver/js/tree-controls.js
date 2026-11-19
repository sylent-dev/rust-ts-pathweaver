// The controls over the tree: the weapon set shown strong, the points, the legend and the zoom (2i,
// the owner, 2026-11-19). Of twelve variants (T1–T12), the owner kept T2, the bottom bar, as discreet
// as can be: no border, a gradient dark at the bottom to clear upward, the legend behind a button;
// the tab « Tree controls » of the page picks one of its variants.

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

// The bottom bar: a gradient of the shade of the tree, dark at the bottom, clear at its top; the sets on
// the left, the counts in the middle (the owner, 2026-11-19), the legend and the zoom on the right.
const barRow = c => `
  <span class="tc-group">${setButton(1, "Set I", "tc-ghost")}${setButton(2, "Set II", "tc-ghost")}</span>
  <span class="tc-counts app-number app-weak">${allCounts(c)}</span>`;
const bar = (variant, body, after = legendCard()) => `<div class="tc-bb ${variant}">${body}</div>${after}`;
const ghostBar = (variant, c) => bar(variant, `${barRow(c)}
  <span class="tc-end">${legendButton(LEGEND_ICON, "tc-ghost")}${zoomButtons("tc-ghost")}</span>`);
// The legend unfolding in the bar: a row above the controls, the bar raised with it.
const unfoldingBar = (variant, c) => bar(`${variant} is-unfolding ${STATE.treeLegend ? "is-open" : ""}`, `
  ${STATE.treeLegend ? legend("tc-unfolded") : ""}
  <span class="tc-row">${barRow(c)}
    <span class="tc-end">${legendButton(`${LEGEND_ICON}<span>${STATE.treeLegend ? "Hide" : "Legend"}</span>`, "tc-ghost tc-with-text")}${zoomButtons("tc-ghost")}</span></span>`, "");

// Of T13–T20, the owner kept T14, T18, T19 and T20 (2026-11-19); T21 mixes the four.
const VARIANT_HTML = {
  // T14 · Ghost: no box at all, words and icons on the gradient; the set shown in its colour, underlined.
  t14: c => ghostBar("", c),
  // T18 · Frosted: the gradient blurs the tree under it too, fading upward.
  t18: c => ghostBar("is-frosted", c),
  // T19 · Quiet: the bar faint until the pointer comes near it, then whole.
  t19: c => ghostBar("is-quiet", c),
  // T20 · Unfolding: the button of the legend raises the bar, the legend on a row above the controls.
  t20: c => unfoldingBar("", c),
  // T21 · The four: ghost, frosted, quiet until the pointer comes, the legend unfolding.
  t21: c => unfoldingBar("is-frosted is-quiet", c),
};

function treeControls(level) {
  const variant = chosen.treeControls;
  return `<div class="tc tc-${variant}">${VARIANT_HTML[variant](treeCounts(level))}</div>`;
}

ACTIONS["tree-legend"] = () => {
  STATE.treeLegend = !STATE.treeLegend;
  return true;
};
