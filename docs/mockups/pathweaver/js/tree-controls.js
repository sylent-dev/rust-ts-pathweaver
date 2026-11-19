// The controls over the tree: the weapon set shown strong, the points, the legend and the zoom (2i,
// the owner, 2026-11-19). The bottom bar is T14 · Ghost, of twenty variants: no border, a gradient
// dark at the bottom to clear upward, buttons without a box, a transparent tile on hover, the set
// shown in its colour, the counts in the middle. The legend stays at the top.

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
  `<button type="button" class="tc-set is-set${set}" data-action="tree-set" data-set="${set}" aria-pressed="${STATE.set === set}">${label}</button>`;
const ZOOM_ICONS = { in: ICONS.plus, out: ICONS.minus, fit: '<path d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3"/>' };
const zoomButton = way => way === "fit"
  ? `<button type="button" class="tc-zoom" data-action="tree-fit" aria-label="Fit the build">${icon(14, ZOOM_ICONS.fit)}</button>`
  : `<button type="button" class="tc-zoom" data-action="tree-zoom" data-zoom="${way}" aria-label="Zoom ${way}">${icon(14, ZOOM_ICONS[way])}</button>`;
const zoomButtons = () => `<span class="tc-group">${zoomButton("out")}${zoomButton("in")}${zoomButton("fit")}</span>`;

// The legend, always shown at the top of the tree (the owner, 2026-11-19, from T24 of eleven ways): the
// three colours of the links, which can't be guessed, and the ring of what is new at the level, which
// the Tree tab has no box « New at N » to explain; what is not taken goes without saying.
const treeLegend = level => `<div class="tc-shade"><div class="tc-legend app-weak">
    <span><i class="tc-line"></i>shared</span><span><i class="tc-line is-set1"></i>set I</span><span><i class="tc-line is-set2"></i>set II</span>
    <span><i class="app-dot is-new"></i>new at ${level}</span></div></div>`;

// The bottom bar: the sets on the left, the counts in the middle, the zoom on the right.
const bottomBar = c => `<div class="tc-bb"><span class="tc-row">
    <span class="tc-group">${setButton(1, "Set I")}${setButton(2, "Set II")}</span>
    <span class="tc-counts app-number app-weak">${allCounts(c)}</span>
    <span class="tc-end">${zoomButtons()}</span></span></div>`;

function treeControls(level) {
  return `<div class="tc">${treeLegend(level)}${bottomBar(treeCounts(level))}</div>`;
}
