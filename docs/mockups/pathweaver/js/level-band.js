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
STATE.slides = {};

const bandRange = key => BUILDS.changes[key].range ?? [1, MAX_LEVEL];
const isSnapshot = key => BUILDS.changes[key].range === null;
const bandLevel = key => (key === "shown" ? STATE.level : STATE.bandLevels[key] ?? bandRange(key)[1]);
// `slide`: the cursor slides from the level it leaves (2g2); a dragged one is already there.
function setBandLevel(key, level, { slide = true } = {}) {
  if (slide && level !== bandLevel(key)) STATE.slides[key] = bandLevel(key);
  if (key === "shown") STATE.level = level;
  else STATE.bandLevels[key] = level;
}

// The x of a level on the track, from the lowest level of the build to its highest, in % of the track: the track
// takes the width the band leaves it (2k4, the owner, 2026-11-21: longer on a large screen, 16
// px a level at 1,920 px against 8 at 960), up to 1,600 px. A marker set on a whole pixel (markerX): a line of 1 px on a half
// pixel smears.
const levelX = (level, [low, high]) => ((level - low) / Math.max(1, high - low)) * 100;
const markerX = (level, range) => `round(${levelX(level, range).toFixed(3)}%, 1px)`;

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

// `focusShown` draws the cursor as it looks with the focus, without taking it (the section of the
// focus, sections/level-band.js).
function levelBand({ key = "shown", focusShown = false } = {}) {
  const instance = nextInstance("level-band");
  const level = bandLevel(key);
  const range = bandRange(key);
  const all = markers(key);
  const record = changesHere(key, level);
  const open = STATE.changesOpen === instance && record !== undefined;
  const snapshot = isSnapshot(key);
  return `<div class="app-level" data-band="${key}" data-instance="${instance}">
    <div class="app-level-now"><span class="app-level-label">Level</span><span class="app-level-number">${level}</span></div>
    ${levelSteps(markerBeside(key, level, "previous"), markerBeside(key, level, "next"), record, open, snapshot)}
    <div class="app-level-track" data-action="level-track">
      <span class="app-level-line"></span>
      ${snapshot ? '<span class="app-level-note">A snapshot: the same at every level</span>' : ""}
      ${all.map(marker => `<span class="app-level-marker" style="left:${markerX(marker, range)}" title="${markerTitle(key, marker)}"></span>`).join("")}
      <span class="app-level-cursor ${STATE.landing === key ? "is-landing" : ""} ${focusShown ? "is-focus-shown" : ""}" style="left:${levelX(level, range)}%"
        role="slider" tabindex="0" aria-label="Level" aria-valuemin="${range[0]}" aria-valuemax="${range[1]}" aria-valuenow="${level}"></span>
      <span class="app-level-end app-number" style="left:0">${range[0]}</span><span class="app-level-end app-number" style="left:100%">${range[1]}</span>
    </div>
    ${open ? changesWindow(record, level, { opening: STATE.changesOpening }) : ""}
  </div>`;
}

const bandOf = element => element.closest(".app-level[data-band]")?.dataset.band;
// The marker before or after a level, if any.
function markerBeside(key, level, direction) {
  const all = markers(key);
  return direction === "previous" ? all.filter(marker => marker < level).at(-1) : all.find(marker => marker > level);
}

ACTIONS["level-go"] = element => {
  const key = bandOf(element);
  if (element.dataset.level === "" || key === undefined) return false;
  setBandLevel(key, Number(element.dataset.level));
  STATE.focusCursor = cursorIndexIn(element);
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
  STATE.focusCursor = cursorIndexIn(element);
  return true;
};

// Dragging the cursor (2g2): its ghost stays grey where it was, the cursor follows the pointer from
// level to level, lifted, a short grey tail behind it (T2 of two trails, the owner, 2026-11-19), and
// the level counts in its box; ◀ ▶ and « N changes », still those of
// the level left, fade; the page draws again once it is set down, the cursor landing with a small
// motion.
STATE.landing = false;
AFTER_RENDER.push(() => { STATE.landing = false; });
// The click that ends a drag isn't a click on the track.
let droppedAt = -Infinity;
document.addEventListener("click", event => {
  if (performance.now() - droppedAt < 100) event.stopPropagation();
}, true);

// The tail of the dragged cursor: a grey band from `from` to the cursor at `to`, fading towards
// `from`. A band held from the ghost (T1) veiled the markers it crossed and said again where the
// cursor came from, which the ghost says.
function drawTrail(trail, from, to) {
  trail.style.left = `${Math.min(from, to)}%`;
  trail.style.width = `${Math.abs(to - from)}%`;
  trail.dataset.towards = to < from ? "left" : "right";
}

document.getElementById("sheet").addEventListener("pointerdown", event => {
  const cursor = event.target.closest(".app-level-cursor");
  const key = cursor && bandOf(cursor);
  if (!key || event.button !== 0) return;
  event.preventDefault();
  const track = cursor.parentElement;
  const number = cursor.closest(".app-level").querySelector(".app-level-number");
  let level = bandLevel(key);
  cursor.insertAdjacentHTML("beforebegin", `<span class="app-level-ghost" style="left:${cursor.style.left}"></span><span class="app-level-trail"></span>`);
  const trail = cursor.previousElementSibling;
  let lastX = levelX(level, bandRange(key));
  let fading;
  cursor.classList.add("is-dragged");
  cursor.closest(".app-level").classList.add("is-dragging");
  cursor.setPointerCapture(event.pointerId);
  const move = moved => {
    level = levelAt(track, key, moved.clientX);
    const x = levelX(level, bandRange(key));
    cursor.style.left = `${x}%`;
    number.textContent = level;
    if (x !== lastX) {
      // The tail as long as the last step was fast, shrinking back to the cursor once it stops.
      trail.classList.remove("is-fading");
      // 72 px at most, in % of the track.
      drawTrail(trail, x - Math.sign(x - lastX) * Math.min((72 / track.clientWidth) * 100, Math.abs(x - lastX) * 3), x);
      clearTimeout(fading);
      fading = setTimeout(() => { trail.classList.add("is-fading"); drawTrail(trail, x, x); }, 40);
    }
    lastX = x;
  };
  const drop = () => {
    cursor.removeEventListener("pointermove", move);
    droppedAt = performance.now();
    setBandLevel(key, level, { slide: false });
    STATE.landing = key;
    STATE.focusCursor = cursorIndexIn(cursor);
    renderSheet();
  };
  cursor.addEventListener("pointermove", move);
  cursor.addEventListener("pointerup", drop, { once: true });
  cursor.addEventListener("pointercancel", drop, { once: true });
});

// The keyboard (2g2, the owner, 2026-11-19): ← and → go to the marker before and after, as ◀ and ▶
// do (specs.md, The level), anywhere on the page but in a field, without aiming at the cursor first.
// The mock-up holds several bands: the arrows move the one that has the focus, or else the last one
// hovered or touched. A click on the cursor, the track or ◀ ▶ gives the cursor the focus, without
// its look in the accent, kept for Tab: the page draws again, and the cursor drawn in the place of
// the one that had the focus takes it back.
const allCursors = () => [...document.querySelectorAll(".app-level-cursor")];
const cursorIndexIn = element => allCursors().indexOf(element.closest(".app-level")?.querySelector(".app-level-cursor"));
let activeCursor = 0;
let tabbed = false;
STATE.focusCursor = -1;

document.addEventListener("keydown", event => { if (event.key === "Tab") tabbed = true; }, true);
document.addEventListener("pointerdown", () => { tabbed = false; }, true);
document.addEventListener("focusin", event => {
  if (event.target.matches?.(".app-level-cursor")) event.target.classList.toggle("is-tabbed", tabbed);
});
for (const type of ["pointerover", "pointerdown"]) {
  document.getElementById("sheet").addEventListener(type, event => {
    const index = cursorIndexIn(event.target);
    if (index >= 0) activeCursor = index;
  });
}
AFTER_RENDER.push(() => {
  allCursors()[STATE.focusCursor]?.focus({ preventScroll: true });
  STATE.focusCursor = -1;
});

document.addEventListener("keydown", event => {
  if ((event.key !== "ArrowLeft" && event.key !== "ArrowRight") || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target.closest?.("input, textarea, select, [contenteditable]")) return;
  const focused = allCursors().indexOf(document.activeElement);
  const index = focused >= 0 ? focused : activeCursor;
  const key = allCursors()[index] && bandOf(allCursors()[index]);
  if (!key) return;
  event.preventDefault();
  const target = markerBeside(key, bandLevel(key), event.key === "ArrowLeft" ? "previous" : "next");
  if (target === undefined) return;
  setBandLevel(key, target);
  STATE.focusCursor = focused;
  renderSheet();
});

// The cursor slides smoothly to its new level on ◀ ▶, a click on the track and the keys (2g2): the
// page draws it there at once, and the motion runs from the level it left; nothing moves when the
// system asks for less motion.
AFTER_RENDER.push(() => {
  for (const [key, from] of Object.entries(STATE.slides)) {
    if (lessMotion()) break;
    for (const cursor of document.querySelectorAll(`.app-level[data-band="${key}"] .app-level-cursor`)) {
      cursor.animate([{ left: `${levelX(from, bandRange(key))}%` }, { left: cursor.style.left }],
        { duration: 280, easing: "cubic-bezier(.2, .8, .2, 1)" });
    }
  }
  STATE.slides = {};
});
