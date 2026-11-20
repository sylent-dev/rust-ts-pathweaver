// « New at N », at the top of the right column of the Overview: what is new at the level.
//
// N2 of twelve variants (2j, the owner, 2026-11-20; the others in the history of Git): no box, a
// title like Skills and Inventory, the lines of the window of « N changes » under it without their
// category, which the mark of a gem, « passives » and the slot at the right already say; a box
// weighed down a column that holds the skills and the inventory too. Six lines, then « and N more
// changes » (2j4: told from « and N more skills »), which opens the window.

const NEW_LINES = 6;

// A line of the window (W1) without its category: its sign, its name, what it hangs on at the right.
// Not a link (the owner, 2026-11-20): the Overview shows already what it says, the gem in its row,
// the slot, the passives ringed on the tree; leading to a tab would leave a view that holds it all.
// The window of « N changes », shown on every tab, keeps its links. A gem that comes carries its name
// and the skill it comes onto, so that its row lights it on hover (litFromNewAt, js/side-skills.js).
const newLineGem = change => change.sign === "+" && (change.category === "skill" || change.category === "support")
  ? ` data-gem="${escapeHtml(change.name)}" data-on="${escapeHtml(change.skill ?? change.name)}"` : "";
const newLine = change => `<li class="${CHANGE_KINDS[change.sign]}"${newLineGem(change)}>
  <span class="app-changes-sign">${changeSign(change)}</span>
  <span class="app-changes-name">${changeName(change)}</span>
  <span class="app-changes-right"><span class="app-changes-detail">${changeDetail(change)}</span></span></li>`;

// What is new at the level of the build shown, or of a case of the mock-up (`record`, a level of BUILDS.changes).
function newAtBox(level, record = BUILDS.changes.shown.levels[level]) {
  const list = record ? changeList(record) : [];
  if (list.length === 0) return `<h2 class="app-side-title app-title app-new-title is-empty">Nothing new at ${level}</h2>`;
  const more = list.length > NEW_LINES
    ? `<button type="button" class="app-new-more" data-action="new-more" title="Opens the window of « N changes »">and ${plural(list.length - NEW_LINES, "more change", "more changes")}</button>` : "";
  return `<h2 class="app-side-title app-title app-new-title">New at ${level}</h2>
    <div class="app-new"><ul class="app-changes-lines app-new-lines">${list.slice(0, NEW_LINES).map(newLine).join("")}</ul>${more}</div>`;
}

// « and N more changes » opens the window of « N changes » of the band of its page.
ACTIONS["new-more"] = element => {
  const instance = element.closest(".app-window")?.querySelector(".app-level[data-instance]")?.dataset.instance;
  if (instance === undefined) return false;
  STATE.changesOpen = Number(instance);
  STATE.changesOpening = true;
  STATE.buildsMenu = false;
  return true;
};

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
