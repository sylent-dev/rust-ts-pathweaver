// « N changes » and its window (2g, the owner, 2026-11-18): the band says how many things
// change at the level, a link; the window lists them all, by category, without choosing which
// matter most. It hangs under the band, in the language of the menu of « +N ▾ », and stays open
// while ◀ ▶ and the track move the level, so that a build is read from marker to marker.
// The changes come from tools/make-data.py (BUILDS.changes): what the build holds at the level and
// didn't hold at the one before, and the reverse.

STATE.changesOpen = false;

// A note of the author on an entry: a mark, not a change of its own.
ICONS.note = '<path d="M3.5 2.5h9v11h-9z"/><path d="M5.8 5.5h4.4M5.8 8h4.4M5.8 10.5h2.4"/>';
const noteMark = has => has ? `<span class="app-changes-note" title="The author left a note">${icon(12, ICONS.note)}</span>` : "";
const GEM_COLOURS = { r: "var(--gem-str)", g: "var(--gem-dex)", b: "var(--gem-int)" };
const gemColour = colour => GEM_COLOURS[colour] ?? "var(--gem-none)";
const gemSquare = colour => `<i class="app-changes-gem" style="background:${gemColour(colour)}"></i>`;

// « N changes », the block between ◀ and ▶, or « 0 changes » in grey when there is none, the block
// kept so that ◀ and ▶ never move; no chevron, since it opens a window, not a menu (the owner,
// 2026-11-18).
function changesLink(record, open) {
  if (!record) return `<span class="app-level-block app-changes-here app-changes-none">0 changes</span>`;
  return `<button type="button" class="app-level-block app-changes-here app-changes-link ${open ? "is-open" : ""}" data-action="changes-toggle" aria-expanded="${open}">${plural(record.count, "change")}</button>`;
}

// `style` places the window under what opened it, when that isn't the right end of the band.
function changesWindow(record, level, { opening = false, style = "" } = {}) {
  const row = (sign, body) => `<li class="app-changes-row ${sign === "−" ? "is-removed" : ""}"><span class="app-changes-sign">${sign}</span><span class="app-changes-body">${body}</span></li>`;
  const part = (title, rows) => rows.length === 0 ? "" : `<section class="app-changes-part"><h3 class="app-changes-title">${title}<span>${rows.length}</span></h3><ul>${rows.join("")}</ul></section>`;
  const { skills, supports, passives, gear, notes } = record;
  const slot = id => escapeHtml(SLOT_NAMES[id] ?? id);
  // A note set again with other words: on a gem, the note of its author; on a hint, its text.
  const noteOf = entry => entry.kind === "gear" ? `${slot(entry.on)} · new text` : entry.kind === "support" ? `on ${escapeHtml(entry.on)} · new note` : "new note";
  const itemName = entry => `${escapeHtml(entry.item || "a hint")}${entry.unique ? ' <span class="app-changes-tag">unique</span>' : ""}`;
  const passiveRows = [
    passives.taken > 0 ? row("+", plural(passives.taken, "passive")) : "",
    passives.set1 > 0 ? row("+", `${plural(passives.set1, "passive")} of weapon set I`) : "",
    passives.set2 > 0 ? row("+", `${plural(passives.set2, "passive")} of weapon set II`) : "",
    passives.ascendancy > 0 ? row("+", plural(passives.ascendancy, "ascendancy passive")) : "",
    passives.givenBack > 0 ? row("−", `${plural(passives.givenBack, "passive")} given back`) : "",
  ].filter(Boolean);
  return `<div class="app-changes-window ${opening ? "is-opening" : ""}" style="${style}" role="dialog" aria-label="What changes at ${level}">
    ${part("Skills", [
      ...skills.added.map(skill => row("+", `${gemSquare(skill.colour)}<b>${escapeHtml(skill.name)}</b>${noteMark(skill.note)}${skill.supports.length > 0
        ? `<span class="app-changes-with">with ${skill.supports.map(s => `${gemSquare(s.colour)}${escapeHtml(s.name)}${noteMark(s.note)}`).join(", ")}</span>` : ""}`)),
      ...skills.removed.map(skill => row("−", `${gemSquare(skill.colour)}${escapeHtml(skill.name)}`)),
    ])}
    ${part("Supports", [
      ...supports.added.map(s => row("+", `${gemSquare(s.colour)}${escapeHtml(s.name)}${noteMark(s.note)} <span class="app-changes-on">on ${escapeHtml(s.skill)}</span>`)),
      ...supports.removed.map(s => row("−", `${gemSquare(s.colour)}${escapeHtml(s.name)} <span class="app-changes-on">off ${escapeHtml(s.skill)}</span>`)),
    ])}
    ${part("Passives", passiveRows)}
    ${passives.notes > 0 && passiveRows.length > 0 ? `<p class="app-changes-foot">${noteMark(true)}${plural(passives.notes, "passive")} with a note of the author</p>` : ""}
    ${part("Gear", [
      ...gear.added.map(entry => row("+", `<span class="app-changes-slot">${slot(entry.slot)}</span><span class="app-changes-item">${itemName(entry)}</span>`)),
      ...gear.replaced.map(entry => row("⇄", `<span class="app-changes-slot">${slot(entry.slot)}</span><span class="app-changes-item">${itemName(entry)} <span class="app-changes-on">for ${escapeHtml(entry.before || "a hint")}</span></span>`)),
      ...gear.removed.map(entry => row("−", `<span class="app-changes-slot">${slot(entry.slot)}</span><span class="app-changes-item">${itemName(entry)}</span>`)),
    ])}
    ${part("Notes", notes.map(entry => row(icon(12, ICONS.note), `${escapeHtml(entry.name)} <span class="app-changes-on">${noteOf(entry)}</span>`)))}
  </div>`;
}

// STATE.changesOpen: the key of the band whose window is open, or false.
ACTIONS["changes-toggle"] = element => {
  const key = element.closest("[data-band]")?.dataset.band;
  if (key === undefined) return false;
  STATE.changesOpen = STATE.changesOpen === key ? false : key;
  STATE.changesOpening = STATE.changesOpen !== false;
  return true;
};
// The window grows out of its link when it opens, not each time the level moves under it.
AFTER_RENDER.push(() => { STATE.changesOpening = false; });

// Esc, or a click outside the band and the window, closes it.
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && STATE.changesOpen) {
    STATE.changesOpen = false;
    renderSheet();
  }
});
document.addEventListener("click", event => {
  if (!STATE.changesOpen || event.target.closest(".app-level, .app-changes-window")) return;
  STATE.changesOpen = false;
  renderSheet();
});
