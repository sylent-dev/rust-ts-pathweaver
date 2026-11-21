// The box of the item chosen in the Inventory tab (2k2), on the pane at the right of the cut: what the card of
// a slot says (slotCardParts, js/slot-hover.js), then every hint of its slot along the levels. P5, kept of six
// (the owner, 2026-11-21, to work on again; the others in the history of Git): no background, the words on
// the graph paper of the pane, thin lines between the parts; the card on hover, the width of the box, its
// image in its head or at its own cells, the card at 320 px with the hints beside it, four corners in the
// accent set aside.

// The hints of its slot, along the levels: the one at the level in the accent.
const itHistory = (shown, state) => `<h3 class="it-title app-title">On this slot</h3><ul class="it-rows">${state.all.filter(hint => sameCell(hint, shown)).map(hint =>
  `<li class="it-row${appliesAt(hint.levels, state.level) ? " is-now" : ""}" ${itAbout(hint, state.level)}><span class="it-span app-number">${hint.levels[0]}–${hint.levels[1]}</span>${itThumb(hint)}${itName(hint)}</li>`).join("")}</ul>`;

// The box of the hint shown: its name; under it its kind, its weapon set and its levels on one line
// (« Staff · Set I · From level 16 », the owner, 2026-11-21: the words of the switch, not « Weapon · I »);
// the stats of a unique; the text of its author; the hints of its slot. An item the game data don't know
// has its slot in words for its kind (« Weapon · Set I »).
function inventoryDetail(hint, state) {
  if (!hint) return '<p class="it-none app-weak">No hint in this build.</p>';
  const parts = slotCardParts({ name: hint.item.name, slot: hint.label, note: hint.note, unknown: hint.item.unknown, levels: hint.levels, level: state.level });
  const known = !hint.item.unknown && BUILDS.items[hint.item.name];
  const set = slotSet(hint.id) === "0" || !known ? "" : `Set ${slotSet(hint.id) === "1" ? "I" : "II"}`;
  const subtitle = [parts.subtitle, set, escapeHtml(levelsWords(hint, state.level))].filter(Boolean).join(" · ");
  return `<div class="it-bare">
      <div class="it-bare-head"><strong>${parts.title}</strong><div class="it-bare-sub">${subtitle}</div></div>
      ${parts.stats.trim() ? `<div class="it-bare-part">${parts.stats}</div>` : ""}
      ${parts.note ? `<div class="it-bare-part">${fromAuthor()}${parts.note}</div>` : ""}
      <div class="it-bare-part">${itHistory(hint, state)}</div>
    </div>`;
}
