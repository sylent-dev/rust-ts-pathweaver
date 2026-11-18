// « N changes » and its window (2g, the owner, 2026-11-18): the band says how many things
// change at the level, a link; the window lists them all, by category, without choosing which
// matter most. It hangs under the band, in the language of the menu of « +N ▾ », and stays open
// while ◀ ▶ and the track move the level, so that a build is read from marker to marker.
// The changes come from tools/make-data.py (BUILDS.changes): what the build holds at the level and
// didn't hold at the one before, and the reverse.

STATE.changesOpen = false;

// A note of the author on an entry: a mark, not a change of its own.
ICONS.note = '<path d="M3.5 2.5h9v11h-9z"/><path d="M5.8 5.5h4.4M5.8 8h4.4M5.8 10.5h2.4"/>';
const noteMark = has => has ? `<span class="lvc-note" title="The author left a note">${icon(12, ICONS.note)}</span>` : "";
const gemSquare = colour => `<i class="lvc-gem" style="background:${gemColour(colour)}"></i>`;

// « N changes », the block between ◀ and ▶, or « No change » in grey when there is none; no
// chevron, since it opens a window, not a menu (the owner, 2026-11-18).
function changesLink(record, open) {
  if (!record) return `<span class="lv6-block lvc-here lvc-none">No change</span>`;
  return `<button type="button" class="lv6-block lvc-here lvc-link ${open ? "is-open" : ""}" data-action="changes-toggle" aria-expanded="${open}">${plural(record.count, "change")}</button>`;
}

// `style` places the window under what opened it, when that isn't the right end of the band.
function changesWindow(record, level, { opening = false, style = "" } = {}) {
  const row = (sign, body) => `<li class="lvc-row ${sign === "−" ? "is-removed" : ""}"><span class="lvc-sign">${sign}</span><span class="lvc-body">${body}</span></li>`;
  const part = (title, rows) => rows.length === 0 ? "" : `<section class="lvc-part"><h3 class="lvc-title">${title}<span>${rows.length}</span></h3><ul>${rows.join("")}</ul></section>`;
  const { skills, supports, passives, gear, notes } = record;
  const slot = id => escapeHtml(SLOT_NAMES[id] ?? id);
  // A note set again with other words: on a gem, the note of its author; on a hint, its text.
  const noteOf = entry => entry.kind === "gear" ? `${slot(entry.on)} · new text` : entry.kind === "support" ? `on ${escapeHtml(entry.on)} · new note` : "new note";
  const itemName = entry => `${escapeHtml(entry.item || "a hint")}${entry.unique ? ' <span class="lvc-tag">unique</span>' : ""}`;
  const passiveRows = [
    passives.taken > 0 ? row("+", plural(passives.taken, "passive")) : "",
    passives.set1 > 0 ? row("+", `${plural(passives.set1, "passive")} of weapon set I`) : "",
    passives.set2 > 0 ? row("+", `${plural(passives.set2, "passive")} of weapon set II`) : "",
    passives.ascendancy > 0 ? row("+", plural(passives.ascendancy, "ascendancy passive")) : "",
    passives.givenBack > 0 ? row("−", `${plural(passives.givenBack, "passive")} given back`) : "",
  ].filter(Boolean);
  return `<div class="lvc-window ${opening ? "is-opening" : ""}" style="${style}" role="dialog" aria-label="What changes at ${level}">
    ${part("Skills", [
      ...skills.added.map(skill => row("+", `${gemSquare(skill.colour)}<b>${escapeHtml(skill.name)}</b>${noteMark(skill.note)}${skill.supports.length > 0
        ? `<span class="lvc-with">with ${skill.supports.map(s => `${gemSquare(s.colour)}${escapeHtml(s.name)}${noteMark(s.note)}`).join(", ")}</span>` : ""}`)),
      ...skills.removed.map(skill => row("−", `${gemSquare(skill.colour)}${escapeHtml(skill.name)}`)),
    ])}
    ${part("Supports", [
      ...supports.added.map(s => row("+", `${gemSquare(s.colour)}${escapeHtml(s.name)}${noteMark(s.note)} <span class="lvc-on">on ${escapeHtml(s.skill)}</span>`)),
      ...supports.removed.map(s => row("−", `${gemSquare(s.colour)}${escapeHtml(s.name)} <span class="lvc-on">off ${escapeHtml(s.skill)}</span>`)),
    ])}
    ${part("Passives", passiveRows)}
    ${passives.notes > 0 && passiveRows.length > 0 ? `<p class="lvc-foot">${noteMark(true)}${plural(passives.notes, "passive")} with a note of the author</p>` : ""}
    ${part("Gear", [
      ...gear.added.map(entry => row("+", `<span class="lvc-slot">${slot(entry.slot)}</span><span class="lvc-item">${itemName(entry)}</span>`)),
      ...gear.replaced.map(entry => row("⇄", `<span class="lvc-slot">${slot(entry.slot)}</span><span class="lvc-item">${itemName(entry)} <span class="lvc-on">for ${escapeHtml(entry.before || "a hint")}</span></span>`)),
      ...gear.removed.map(entry => row("−", `<span class="lvc-slot">${slot(entry.slot)}</span><span class="lvc-item">${itemName(entry)}</span>`)),
    ])}
    ${part("Notes", notes.map(entry => row(icon(12, ICONS.note), `${escapeHtml(entry.name)} <span class="lvc-on">${noteOf(entry)}</span>`)))}
  </div>`;
}

// A count of the changes at a marker (27): goes to its level and opens its window.
ACTIONS["level-open"] = element => {
  STATE.level = Number(element.dataset.level);
  STATE.changesOpening = !STATE.changesOpen;
  STATE.changesOpen = true;
  return true;
};
ACTIONS["changes-toggle"] = () => {
  STATE.changesOpen = !STATE.changesOpen;
  STATE.changesOpening = STATE.changesOpen;
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
  if (!STATE.changesOpen || event.target.closest(".lv6, .lvc-window")) return;
  STATE.changesOpen = false;
  renderSheet();
});
