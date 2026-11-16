// The level band: ◀ and ▶ with the level each goes to, the level in large, the track with its
// markers and the cursor, « what changes at N » on the right (specs.md, The level).

STATE.level = 59;
const TRACK_WIDTH = 450;

const trackX = level => ((level - 1) / (MAX_LEVEL - 1)) * TRACK_WIDTH;

function changeLines(level) {
  const changes = changesAt(level);
  const added = [
    ...changes.skills.map(skill => `${escapeHtml(skill.name)} (${plural(skill.supports.filter(s => appliesAt(s.levels, level)).length, "support")})`),
    ...changes.supports.map(support => `${escapeHtml(support.name)} on ${escapeHtml(support.skill)}`),
    ...changes.slots.map(slot => `${SLOT_NAMES[slot.id]} hint`),
  ];
  const removed = changes.removed + changes.removedPassives;
  const passives = [
    changes.passives > 0 ? `+ ${plural(changes.passives, "passive")}` : "",
    changes.removedPassives > 0 ? `− ${plural(changes.removedPassives, "passive")}` : "",
    removed === 0 ? "nothing removed" : changes.removed > 0 ? `− ${changes.removed} removed` : "",
  ].filter(Boolean).join(" · ");
  return [added.length > 0 ? `+ ${added.join(" · ")}` : "", passives].filter(Boolean);
}

function levelBand() {
  const level = STATE.level;
  const all = markers();
  const previous = all.filter(marker => marker < level).at(-1);
  const next = all.find(marker => marker > level);
  const isMarker = all.includes(level);
  const step = (direction, target) => `<div class="app-level-step">
      <button type="button" class="app-level-arrow" data-action="level-go" data-level="${target ?? ""}" ${target === undefined ? "disabled" : ""} aria-label="${direction} marker">${icon(20, ICONS[direction])}</button>
      <span class="app-weak app-number">${target ?? ""}</span>
    </div>`;
  return `<div class="app-level">
    ${step("previous", previous)}
    <div class="app-level-now"><span class="app-weak">Level</span><span class="app-level-number app-number">${level}</span></div>
    ${step("next", next)}
    <div class="app-level-track" data-action="level-track" style="width:${TRACK_WIDTH}px">
      <div class="app-level-line"></div>
      ${all.map(marker => `<span class="app-level-marker" style="left:${trackX(marker)}px"></span>`).join("")}
      <span class="app-level-cursor" style="left:${trackX(level)}px"></span>
      <span class="app-level-end app-weak app-number" style="left:0">1</span>
      <span class="app-level-end app-weak app-number" style="left:${TRACK_WIDTH}px">${MAX_LEVEL}</span>
    </div>
    <div class="app-level-changes">
      <span class="app-weak">${isMarker ? "What changes at" : "Nothing changes at"} ${level}</span>
      ${isMarker ? changeLines(level).map(line => `<span class="app-level-change">${line}</span>`).join("") : ""}
    </div>
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
