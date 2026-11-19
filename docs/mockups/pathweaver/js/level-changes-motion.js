// The motion of the window of what changes (2g4, the owner, 2026-11-19): how it opens (O1 to O3), and
// how its lines change when ◀ ▶, the track or the keys move the level while it is open (M1 to M4),
// the two lists at the top of the page. Nothing moves when the system asks for less motion. The
// variants go once one of each is kept.

// The band of the section of the motion: the build of the page, on a band of its own, so that its
// window opens alone.
BUILDS.changes.motion = BUILDS.changes.shown;
STATE.bandLevels.motion = 59;

// The level each open window showed when the page was last drawn: its lines move when it changes.
const shownChanges = {};
AFTER_RENDER.push(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const box of document.querySelectorAll(".app-level[data-band] > .app-changes-window")) {
    const key = box.closest(".app-level[data-band]").dataset.band;
    const level = bandLevel(key);
    const before = shownChanges[key];
    shownChanges[key] = level;
    if (still || before === undefined || before === level || box.classList.contains("is-opening")) continue;
    const towards = Math.sign(level - before);
    const lines = [...box.querySelectorAll(".app-changes-head, .app-changes-lines li")];
    if (chosen.linesChange === "fade") lines.forEach((line, index) => line.animate([{ opacity: 0 }, { opacity: 1 }],
      { duration: 160, delay: Math.min(index, 12) * 18, easing: "ease-out", fill: "backwards" }));
    if (chosen.linesChange === "slide") lines.forEach((line, index) => line.animate([{ opacity: 0, transform: `translateX(${towards * 14}px)` }, { opacity: 1, transform: "none" }],
      { duration: 200, delay: Math.min(index, 12) * 14, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "backwards" }));
    if (chosen.linesChange === "cross") box.animate([{ opacity: .25 }, { opacity: 1 }], { duration: 140, easing: "ease-out" });
  }
  // A window closed forgets its level: it opens again without its lines moving.
  for (const key of Object.keys(shownChanges)) {
    if (!document.querySelector(`.app-level[data-band="${key}"] > .app-changes-window`)) delete shownChanges[key];
  }
});
