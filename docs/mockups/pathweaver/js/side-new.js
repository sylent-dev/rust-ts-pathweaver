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
    <div class="app-new"><ul class="app-changes-lines app-new-lines">${list.slice(0, NEW_LINES).map(newLine).join("")}</ul>${more}</div>`;
}

// Its motion when the level changes (M3 of three, the owner, 2026-11-20: a fade, and a rise of the
// lines one after the other, set aside): the lines replaced at once, as in the window, and the title
// lighting up to white, the white of the cursor of the level, and back to the accent in 400 ms. The
// column is beside the band, where the eye isn't: the flash draws it there, and nothing of the
// column moves. Only when something is new; a dragged cursor changes the level once set down, so the
// flashes never pile up; none when the system asks for less motion.
const newLevelBefore = new Map();
function flashNewTitle(column, index) {
  const title = column.querySelector(".app-new-title");
  if (!title) return;
  const before = newLevelBefore.get(index);
  newLevelBefore.set(index, title.textContent);
  if (before === undefined || before === title.textContent || title.classList.contains("is-empty") || lessMotion()) return;
  title.animate([{ color: "#ffffff", textShadow: "0 0 10px color-mix(in srgb, var(--accent) 80%, transparent)" }, { color: getComputedStyle(title).color, textShadow: "none" }],
    { duration: 400, easing: "ease-out" });
}
AFTER_RENDER.push(() => document.querySelectorAll(".app-side").forEach(flashNewTitle));
