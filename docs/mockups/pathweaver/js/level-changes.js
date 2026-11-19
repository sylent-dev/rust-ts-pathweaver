// « N changes » and its window (2g, the owner, 2026-11-18): the band says how many things
// change at the level, a link; the window lists them all, without choosing which matter most. It
// hangs under the band, in the language of the menu of « +N ▾ », and stays open while ◀ ▶ and the
// track move the level, so that a build is read from marker to marker.
// The changes come from tools/make-data.py (BUILDS.changes): what the build holds at the level and
// didn't hold at the one before, and the reverse.
//
// Its layout (2g3, the owner, 2026-11-19; W1 of twelve, the others in the history of Git): a line
// per change, a summary: its sign, its category, its name, what it hangs on at the right. The +,
// the − and the ⇄ in the colours of a change; each line leads to the tab that shows its change.

// The number of the level band whose window is open (nextInstance), or false.
STATE.changesOpen = false;

// A note of the author (N2 of twelve marks, the owner, 2026-11-19): a filled speech bubble, simple
// enough to read at 12 px; on an entry, a mark rather than a change of its own.
ICONS.note = '<path d="M2 3h12v8.2H7.2L3.4 14.2V11.2H2z" fill="currentColor" stroke="none"/>';
const noteMark = (has, title = "The author left a note") => has ? `<span class="app-changes-note" title="${title}">${icon(12, ICONS.note)}</span>` : "";

// « N changes », the block between ◀ and ▶, or « 0 changes » in grey when there is none, the block
// kept so that ◀ and ▶ never move; no chevron, since it opens a window, not a menu (the owner,
// 2026-11-18).
function changesLink(record, open) {
  if (!record) return `<span class="app-level-block app-changes-here app-changes-none">0 changes</span>`;
  return `<button type="button" class="app-level-block app-changes-here app-changes-link ${open ? "is-open" : ""}" data-action="changes-toggle" aria-expanded="${open}">${plural(record.count, "change")}</button>`;
}

// The changes of a level as one list, in the order of the categories, each with its sign.
const CHANGE_CATEGORIES = { skill: "Skill", support: "Support", passives: "Passive", gear: "Gear", note: "Note" };
const PASSIVE_GROUPS = { taken: "", set1: "of weapon set I", set2: "of weapon set II", ascendancy: "of the ascendancy" };

function changeList(record) {
  const { skills, supports, passives, gear, notes } = record;
  // An item without the base its author wrote after its name, and the one it replaces.
  const item = entry => ({ ...entry, name: withoutBase(entry.item), before: entry.before && withoutBase(entry.before) });
  const taken = Object.entries(PASSIVE_GROUPS).filter(([group]) => passives[group] > 0);
  return [
    ...skills.added.map(skill => ({ category: "skill", sign: "+", ...skill })),
    ...skills.removed.map(skill => ({ category: "skill", sign: "−", ...skill, supports: [] })),
    ...supports.added.map(support => ({ category: "support", sign: "+", ...support })),
    ...supports.removed.map(support => ({ category: "support", sign: "−", ...support })),
    // The notes of the passives taken mark their first group.
    ...taken.map(([group, label], index) => ({ category: "passives", sign: "+", count: passives[group], label, notes: index === 0 ? passives.notes : 0 })),
    ...(passives.givenBack > 0 ? [{ category: "passives", sign: "−", count: passives.givenBack, label: "" }] : []),
    ...gear.added.map(entry => ({ category: "gear", sign: "+", ...item(entry) })),
    ...gear.replaced.map(entry => ({ category: "gear", sign: "⇄", ...item(entry) })),
    ...gear.removed.map(entry => ({ category: "gear", sign: "−", ...item(entry) })),
    ...notes.map(entry => ({ category: "note", sign: "note", ...entry, name: entry.kind === "gear" ? withoutBase(entry.name) : entry.name })),
  ];
}

// The words of a change: its name, and what it hangs on, in grey at the right.
const slotName = id => escapeHtml(SLOT_NAMES[id] ?? id);
function changeName(change) {
  if (change.category === "passives") return `<b>${plural(change.count, "passive")}</b>${change.label ? ` ${change.label}` : ""}${
    noteMark(change.notes > 0, `${plural(change.notes, "passive")} with a note of the author`)}`;
  if (change.category === "skill" || change.category === "support") return `${gemMark(change.colour, change.category)}<b>${escapeHtml(change.name)}</b>${noteMark(change.note)}`;
  if (change.category === "gear") return `<b>${escapeHtml(change.name || "a hint")}</b>${change.unique ? ' <span class="app-changes-tag">unique</span>' : ""}`;
  return `<b>${escapeHtml(change.name)}</b>`;
}
function changeDetail(change) {
  if (change.category === "skill") return change.supports.length > 0 ? `with ${plural(change.supports.length, "support")}` : "";
  if (change.category === "support") return `${change.sign === "−" ? "off" : "on"} ${escapeHtml(change.skill)}`;
  if (change.category === "passives") return change.sign === "−" ? "given back" : "";
  if (change.category === "gear") return `${slotName(change.slot)}${change.sign === "⇄" ? ` · for ${escapeHtml(change.before || "a hint")}` : ""}`;
  // A note set again with other words: on a gem, the note of its author; on a hint, its text.
  return change.kind === "gear" ? `${slotName(change.on)} · new text` : change.kind === "support" ? `on ${escapeHtml(change.on)} · new note` : "new note";
}
const CHANGE_KINDS = { "+": "is-added", "⇄": "is-swapped", "−": "is-gone", note: "is-note" };
const changeSign = change => change.sign === "note" ? icon(12, ICONS.note) : change.sign;

// Where a click on a line leads (the owner, 2026-11-19): the tab that shows its change, the hint of
// a note in Inventory, the gem of a note in Skills; the passives in the tree, which the Overview
// shows already.
const CHANGE_TABS = { skills: "Skills", inventory: "Inventory", tree: "Tree" };
const changeTab = change => change.category === "passives" ? "tree"
  : change.category === "gear" || (change.category === "note" && change.kind === "gear") ? "inventory" : "skills";

// The window: « N changes at N », then a line per change. On hover a line is lighter and says where
// it leads in place of its detail (H4 of six hovers, the owner, 2026-11-19: no arrow, no chevron).
function changesWindow(record, level, { opening = false } = {}) {
  const line = change => `<li class="${CHANGE_KINDS[change.sign]}" data-action="changes-go" data-tab="${changeTab(change)}" title="Show it in ${CHANGE_TABS[changeTab(change)]}">
    <span class="app-changes-sign">${changeSign(change)}</span><span class="app-changes-category">${CHANGE_CATEGORIES[change.category]}</span>
    <span class="app-changes-name">${changeName(change)}</span>
    <span class="app-changes-right"><span class="app-changes-leads">${CHANGE_TABS[changeTab(change)]}</span><span class="app-changes-detail">${changeDetail(change)}</span></span></li>`;
  return `<div class="app-changes-window ${opening ? "is-opening" : ""}" role="dialog" aria-label="What changes at ${level}">
    <p class="app-changes-head">${plural(record.count, "change")} at ${level}</p>
    <ul class="app-changes-lines">${changeList(record).map(line).join("")}</ul>
  </div>`;
}

// « N changes » opens the window of its own band, and closes the menu of « +N ▾ »: one at a time.
ACTIONS["changes-toggle"] = element => {
  const instance = element.closest(".app-level[data-instance]")?.dataset.instance;
  if (instance === undefined) return false;
  STATE.changesOpen = STATE.changesOpen === Number(instance) ? false : Number(instance);
  STATE.changesOpening = STATE.changesOpen !== false;
  STATE.buildsMenu = false;
  return true;
};
// A line shows its tab and closes the window, which would hide it; the tree stays on the Overview,
// which shows it already. The mock-up only marks the tab, its bar sliding to it: the views of the
// tabs come with 2k.
ACTIONS["changes-go"] = element => {
  const tab = element.dataset.tab;
  if (!(tab === "tree" && STATE.tab === "overview")) showTab(tab);
  STATE.changesOpen = false;
  return true;
};
// The window grows out of its link when it opens, not each time the level moves under it.
AFTER_RENDER.push(() => { STATE.changesOpening = false; });

// Esc, or a click outside the band and the window, closes it.
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && STATE.changesOpen !== false) {
    STATE.changesOpen = false;
    renderSheet();
  }
});
document.addEventListener("click", event => {
  if (STATE.changesOpen === false || event.target.closest(".app-level, .app-changes-window")) return;
  STATE.changesOpen = false;
  renderSheet();
});
