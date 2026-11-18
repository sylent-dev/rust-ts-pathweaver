// The level band (2g, the owner, 2026-11-18; L6 of twenty variants, specs.md, Window layout): the
// level in its box, the column of ◀ the marker before, « N changes » here and ▶ the marker after,
// then the track from that column to the margin of the band; « N changes » opens the window of
// what changes (js/level-changes.js). The twenty variants and the nine places of « N changes »
// are in the history of Git (commits 23a5d66 and 1258abf).

STATE.level = 59;
const LEVEL_TRACK_WIDTH = 708;

// The x of a level on the track, on a whole pixel: a line of 1 px on a half pixel smears.
const levelX = level => Math.round(((level - 1) / (MAX_LEVEL - 1)) * LEVEL_TRACK_WIDTH);

// What changes at a level of the build shown, by category (tools/make-data.py).
const changesHere = level => BUILDS.changes.shown.levels[level];
const markerTitle = level => `Level ${level}: ${plural(changesHere(level)?.count ?? 0, "change")}`;

// ◀ or ▶, with the level it goes to.
const levelStep = (direction, target) => `<button type="button" class="app-level-block app-level-step" data-action="level-go" data-level="${target ?? ""}" ${target === undefined ? "disabled" : ""} aria-label="${direction} marker">${icon(16, ICONS[direction])}<span class="app-number">${target ?? "–"}</span></button>`;

// The column of the arrows in three (25, the owner, 2026-11-18): ◀ the marker before, « N changes »
// here, ▶ the marker after; the line of the track leaves from « here ».
const levelSteps = (previous, next, record, open) =>
  `<div class="app-level-steps">${levelStep("previous", previous)}${changesLink(record, open)}${levelStep("next", next)}</div>`;

function levelBand({ window = false } = {}) {
  const level = STATE.level;
  const all = markers();
  const record = changesHere(level);
  const open = window && STATE.changesOpen && record !== undefined;
  return `<div class="app-level">
    <div class="app-level-now"><span class="app-level-label">Level</span><span class="app-level-number">${level}</span></div>
    ${levelSteps(all.filter(marker => marker < level).at(-1), all.find(marker => marker > level), record, open)}
    <div class="app-level-track" data-action="level-track" style="width:${LEVEL_TRACK_WIDTH}px">
      <span class="app-level-line"></span>
      ${all.map(marker => `<span class="app-level-marker" style="left:${levelX(marker)}px" title="${markerTitle(marker)}"></span>`).join("")}
      <span class="app-level-cursor" style="left:${levelX(level)}px"></span>
      <span class="app-level-end app-number" style="left:0">1</span><span class="app-level-end app-number" style="left:${LEVEL_TRACK_WIDTH}px">${MAX_LEVEL}</span>
    </div>
    ${open ? changesWindow(record, level, { opening: STATE.changesOpening }) : ""}
  </div>`;
}

ACTIONS["level-go"] = element => {
  if (element.dataset.level === "") return false;
  STATE.level = Number(element.dataset.level);
  return true;
};
ACTIONS["level-track"] = (element, event) => {
  const box = element.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
  STATE.level = Math.round(1 + ratio * (MAX_LEVEL - 1));
  return true;
};
