// « New at N », at the top of the right column of the Overview: what is new at the level.
//
// N2 of twelve variants (2j, the owner, 2026-11-20; the others in the history of Git): no box, a
// title like Skills and Inventory, the lines of the window of « N changes » under it without their
// category, which the mark of a gem, « passives » and the slot at the right already say; a box
// weighed down a column that holds the skills and the inventory too. Six lines, then « and N more »,
// which opens the window.

const NEW_LINES = 6;

// A line of the window (W1) without its category: its sign, its name, what it hangs on at the right,
// a link to the tab that shows it.
const newLine = change => `<li class="${CHANGE_KINDS[change.sign]}" data-action="changes-go" data-tab="${changeTab(change)}" title="Show it in ${CHANGE_TABS[changeTab(change)]}">
  <span class="app-changes-sign">${changeSign(change)}</span>
  <span class="app-changes-name">${changeName(change)}</span>
  <span class="app-changes-right"><span class="app-changes-leads">${CHANGE_TABS[changeTab(change)]}</span><span class="app-changes-detail">${changeDetail(change)}</span></span></li>`;

function newAtBox(level) {
  const record = BUILDS.changes.shown.levels[level];
  const list = record ? changeList(record) : [];
  if (list.length === 0) return `<h2 class="app-side-title app-title app-new-title is-empty">Nothing new at ${level}</h2>`;
  const more = list.length > NEW_LINES
    ? `<button type="button" class="app-new-more" title="Opens the window of « N changes »">and ${list.length - NEW_LINES} more</button>` : "";
  return `<h2 class="app-side-title app-title app-new-title">New at ${level}</h2>
    <div class="app-new" data-level="${level}"><ul class="app-changes-lines app-new-lines">${list.slice(0, NEW_LINES).map(newLine).join("")}</ul>${more}</div>`;
}

// Its motion when the level changes, three to choose (2j), against M0, the lines replaced at once as
// in the window: the column is beside the band, where the eye isn't, so the motion draws it there.
// The page draws the column again at once; the motion runs from what it showed before. A dragged
// cursor changes the level once set down: the motions never pile up. None when the system asks
// for less motion.
const NEW_MOTIONS = {
  M0: { title: "M0 · At once", text: "The lines replaced at once, as in the window of « N changes »." },
  M1: { title: "M1 · A fade", text: "The lines before fade out in 80 ms, then the new ones fade in, in 150 ms." },
  M2: { title: "M2 · A rise, one line after the other", text: "The new lines rise by 4 px as they appear, 30 ms apart, each in 180 ms." },
  M3: { title: "M3 · A flash of the title", text: "The lines at once; « New at N » lights up to white and back to the accent, in 400 ms." },
};
const newShownBefore = new Map();
function playNewMotion(column, index) {
  const block = column.querySelector(".app-new");
  const title = column.querySelector(".app-new-title");
  const level = title.textContent;
  const before = newShownBefore.get(index);
  newShownBefore.set(index, { level, html: block?.innerHTML ?? "" });
  if (!before || before.level === level || lessMotion()) return;
  const motion = column.dataset.motion;
  if (motion === "M1") {
    // The lines before laid over the new ones, which wait under them; to nothing new, they just go.
    const lines = [...(block?.children ?? [])];
    if (block && before.html) {
      const ghost = document.createElement("div");
      ghost.className = "app-new-ghost";
      ghost.innerHTML = before.html;
      block.prepend(ghost);
      ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 80, easing: "ease-out", fill: "forwards" }).finished.then(() => ghost.remove());
    }
    for (const line of lines) line.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: before.html ? 80 : 0, easing: "ease-out", fill: "backwards" });
  } else if (motion === "M2") {
    [...(block?.querySelectorAll("li, .app-new-more") ?? [])].forEach((line, order) =>
      line.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }],
        { duration: 180, delay: order * 30, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "backwards" }));
  } else if (motion === "M3") {
    title.animate([{ color: "#ffffff", textShadow: "0 0 10px color-mix(in srgb, var(--accent) 80%, transparent)" }, { color: getComputedStyle(title).color, textShadow: "none" }],
      { duration: 400, easing: "ease-out" });
  }
}
AFTER_RENDER.push(() => document.querySelectorAll(".app-side[data-motion]").forEach(playNewMotion));
