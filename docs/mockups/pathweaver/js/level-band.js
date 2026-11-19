// The level band (2g, the owner, 2026-11-18; L6 of twenty variants, specs.md, Window layout): the
// level in its box, the column of ◀ the marker before, « N changes » here and ▶ the marker after,
// then the track from that column to the margin of the band; « N changes » opens the window of
// what changes (js/level-changes.js). The twenty variants and the nine places of « N changes »
// are in the history of Git (commits 23a5d66 and 1258abf).
//
// A band shows the levels of one build of BUILDS.changes (2g2): « shown », the build of the page,
// at STATE.level, which the page reads; or a case of the band (a snapshot, a guide that covers part
// of the levels), each at its own level, opened at the highest level it covers.

STATE.level = 59;
STATE.bandLevels = {};
const LEVEL_TRACK_WIDTH = 708;

const bandRange = key => BUILDS.changes[key].range ?? [1, MAX_LEVEL];
const isSnapshot = key => BUILDS.changes[key].range === null;
const bandLevel = key => (key === "shown" ? STATE.level : STATE.bandLevels[key] ?? bandRange(key)[1]);
function setBandLevel(key, level) {
  if (key === "shown") STATE.level = level;
  else STATE.bandLevels[key] = level;
}

// The x of a level on the track, from the lowest level of the build to its highest, on a whole
// pixel: a line of 1 px on a half pixel smears.
const levelX = (level, [low, high]) => Math.round(((level - low) / Math.max(1, high - low)) * LEVEL_TRACK_WIDTH);

// What changes at a level of a build, by category (tools/make-data.py).
const changesHere = (key, level) => BUILDS.changes[key].levels[level];
const markerTitle = (key, level) => `Level ${level}: ${plural(changesHere(key, level)?.count ?? 0, "change")}`;

// ◀ or ▶, with the level it goes to.
const levelStep = (direction, target) => `<button type="button" class="app-level-block app-level-step" data-action="level-go" data-level="${target ?? ""}" ${target === undefined ? "disabled" : ""} aria-label="${direction} marker">${icon(16, ICONS[direction])}<span class="app-number">${target ?? "–"}</span></button>`;

// The column of the arrows in three (25, the owner, 2026-11-18): ◀ the marker before, « N changes »
// here, ▶ the marker after; the line of the track leaves from « here ». A snapshot has nothing that
// changes: ◀ and ▶ alone, as before « N changes » (2g2).
const levelSteps = (previous, next, record, open, snapshot = false) =>
  `<div class="app-level-steps">${levelStep("previous", previous)}${snapshot ? "" : changesLink(record, open)}${levelStep("next", next)}</div>`;

function levelBand({ key = "shown", window = false } = {}) {
  const level = bandLevel(key);
  const range = bandRange(key);
  const all = markers(key);
  const record = changesHere(key, level);
  const open = window && STATE.changesOpen === key && record !== undefined;
  const snapshot = isSnapshot(key);
  return `<div class="app-level" data-band="${key}">
    <div class="app-level-now"><span class="app-level-label">Level</span><span class="app-level-number">${level}</span></div>
    ${levelSteps(all.filter(marker => marker < level).at(-1), all.find(marker => marker > level), record, open, snapshot)}
    <div class="app-level-track" data-action="level-track" style="width:${LEVEL_TRACK_WIDTH}px">
      <span class="app-level-line"></span>
      ${snapshot ? '<span class="app-level-note">A snapshot: the same at every level</span>' : ""}
      ${all.map(marker => `<span class="app-level-marker" style="left:${levelX(marker, range)}px" title="${markerTitle(key, marker)}"></span>`).join("")}
      <span class="app-level-cursor ${STATE.landing === key ? "is-landing" : ""}" style="left:${levelX(level, range)}px"></span>
      <span class="app-level-end app-number" style="left:0">${range[0]}</span><span class="app-level-end app-number" style="left:${LEVEL_TRACK_WIDTH}px">${range[1]}</span>
    </div>
    ${open ? changesWindow(record, level, { opening: STATE.changesOpening }) : ""}
  </div>`;
}

const bandOf = element => element.closest("[data-band]")?.dataset.band;

ACTIONS["level-go"] = element => {
  const key = bandOf(element);
  if (element.dataset.level === "" || key === undefined) return false;
  setBandLevel(key, Number(element.dataset.level));
  return true;
};
// The level under the pointer on the track of a band.
function levelAt(track, key, clientX) {
  const [low, high] = bandRange(key);
  const box = track.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
  return Math.round(low + ratio * (high - low));
}
ACTIONS["level-track"] = (element, event) => {
  const key = bandOf(element);
  if (key === undefined) return false;
  setBandLevel(key, levelAt(element, key, event.clientX));
  return true;
};

// Dragging the cursor (2g2): its ghost stays grey where it was, the cursor follows the pointer from
// level to level, lifted, and the level counts in its box; ◀ ▶ and « N changes », still those of
// the level left, fade; the page draws again once it is set down, the cursor landing with a small
// motion.
STATE.landing = false;
AFTER_RENDER.push(() => { STATE.landing = false; });
// The click that ends a drag isn't a click on the track.
let droppedAt = -Infinity;
document.addEventListener("click", event => {
  if (performance.now() - droppedAt < 100) event.stopPropagation();
}, true);

document.getElementById("sheet").addEventListener("pointerdown", event => {
  const cursor = event.target.closest(".app-level-cursor");
  const key = cursor && bandOf(cursor);
  if (!key || event.button !== 0) return;
  event.preventDefault();
  const track = cursor.parentElement;
  const number = cursor.closest(".app-level").querySelector(".app-level-number");
  let level = bandLevel(key);
  cursor.insertAdjacentHTML("beforebegin", `<span class="app-level-ghost" style="left:${cursor.style.left}"></span>`);
  cursor.classList.add("is-dragged");
  cursor.closest(".app-level").classList.add("is-dragging");
  cursor.setPointerCapture(event.pointerId);
  const move = moved => {
    level = levelAt(track, key, moved.clientX);
    cursor.style.left = `${levelX(level, bandRange(key))}px`;
    number.textContent = level;
  };
  const drop = () => {
    cursor.removeEventListener("pointermove", move);
    droppedAt = performance.now();
    setBandLevel(key, level);
    STATE.landing = key;
    renderSheet();
  };
  cursor.addEventListener("pointermove", move);
  cursor.addEventListener("pointerup", drop, { once: true });
  cursor.addEventListener("pointercancel", drop, { once: true });
});
