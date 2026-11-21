// The box of the item chosen in the Inventory tab (2k2), on the pane at the right of the cut: what the card of
// a slot says (slotCardParts, js/slot-hover.js). P5, kept of six (the owner, 2026-11-21; the others in the
// history of Git): no background, the words on the pane, no line nor frame between the parts; the card on
// hover the width of the box, its image in its head or at its own cells, the card at 320 px with the hints
// beside it, four corners in the accent set aside; « On this slot », the hints of the slot along the levels,
// set aside for the line of its levels.

// The line of the levels of the hint and its weapon set, under the name (the owner, 2026-11-21: in place of
// « On this slot », R2 of three): its levels in a sentence in the accent, in the words of the cards on hover
// (levelsWords: « From level 16 », « From the start, until 64 », « New at level 59 »), and the tag of its weapon
// set, for a weapon or an offhand, in the look of the switch of the set. The levels in figures, and in figures
// before a bar of the levels 1 to 100, set aside.
const setTag = hint => (slotSet(hint.id) === "0" ? "" : `<span class="it-set-tag is-set${slotSet(hint.id)}">Set ${slotSet(hint.id) === "1" ? "I" : "II"}</span>`);
const rangeLine = (hint, level) => `<div class="it-range"><span class="it-range-words">${escapeHtml(levelsWords(hint, level))}</span>${setTag(hint)}</div>`;

// The box of the hint shown: its name; under it its kind, then the line of its levels and its weapon set;
// the stats of a unique; the text of its author. An item the game data don't know has its slot in words for
// its kind (« Weapon », « Ring · left »).
function inventoryDetail(hint, state) {
  if (!hint) return '<p class="it-none app-weak">No hint in this build.</p>';
  const slot = slotSet(hint.id) === "0" ? hint.label : SLOT_NAMES[hint.id];
  const parts = slotCardParts({ name: hint.item.name, slot, note: hint.note, unknown: hint.item.unknown, levels: hint.levels, level: state.level });
  return `<div class="it-bare">
      <div class="it-bare-head"><strong>${parts.title}</strong><div class="it-bare-sub">${parts.subtitle}</div>${rangeLine(hint, state.level)}</div>
      ${parts.stats.trim() ? `<div class="it-bare-part">${parts.stats}</div>` : ""}
      ${parts.note ? `<div class="it-bare-part">${fromAuthor()}${parts.note}</div>` : ""}
    </div>`;
}
