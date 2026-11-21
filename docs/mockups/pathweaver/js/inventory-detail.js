// The box of the item chosen in the Inventory tab (2k2), on the pane at the right of the cut: what the card of
// a slot says (slotCardParts, js/slot-hover.js), then every hint of its slot along the levels. P5, kept of six
// (the owner, 2026-11-21, to work on again; the others in the history of Git): no background, the words on
// the graph paper of the pane, thin lines between the parts; the card on hover, the width of the box, its
// image in its head or at its own cells, the card at 320 px with the hints beside it, four corners in the
// accent set aside.

// The hints of its slot, along the levels: the one at the level in the accent, the one shown in the box in
// the colour of the text; a click on one shows it (the owner, 2026-11-21: the hint of 65–100 read at 40).
const itHistory = (shown, state) => `<h3 class="it-title app-title">On this slot</h3><ul class="it-rows">${state.all.filter(hint => sameCell(hint, shown)).map(hint =>
  `<li class="it-row${appliesAt(hint.levels, state.level) ? " is-now" : ""}${hint === shown ? " is-shown" : ""}" data-action="it-choose" data-pick="${hintKey(hint)}"><span class="it-span app-number">${hint.levels[0]}–${hint.levels[1]}</span>${itThumb(hint)}${itName(hint)}</li>`).join("")}</ul>`;

// The line of the levels of the hint and its weapon set, under the name (the owner, 2026-11-21: in place of
// « On this slot »), in three variants chosen with the tabs « Range line » (VARIANTS.rangeLine), R0 the box
// as it was: R1 the levels in figures in the accent (« 16–100 »), R2 in a sentence (« From level 16 to level
// 100 »), R3 in figures before a bar of the levels 1 to 100, the level of the band a tick; each with a tag of its weapon set,
// for a weapon or an offhand, in the look of the switch of the set.
const RANGE_LINES = {
  r0: "R0 · As it was: « Staff · Set I · From level 16 » under the name, « On this slot » at the end",
  r1: "R1 · The levels in figures in the accent, the tag of the set beside",
  r2: "R2 · The levels in a sentence in the accent, the tag of the set beside",
  r3: "R3 · The tag of the set, the levels in figures, then a bar of the levels 1 to 100, the level of the band a tick",
};
const setTag = hint => (slotSet(hint.id) === "0" ? "" : `<span class="it-set-tag is-set${slotSet(hint.id)}">Set ${slotSet(hint.id) === "1" ? "I" : "II"}</span>`);
function rangeLine(hint, level) {
  const [low, high] = hint.levels;
  switch (chosen.rangeLine) {
    case "r2": return `<div class="it-range"><span class="it-range-words">From level ${low} to level ${high}</span>${setTag(hint)}</div>`;
    case "r3": return `<div class="it-range">${setTag(hint)}<span class="it-range-figures app-number">${low}–${high}</span><span class="it-range-track" title="Levels 1 to 100"><span class="it-range-fill" style="left:${low - 1}%;width:${high - low + 1}%"></span><span class="it-range-now" style="left:${level - 0.5}%" title="Level ${level}"></span></span></div>`;
    default: return `<div class="it-range"><span class="it-range-figures app-number">${low}–${high}</span>${setTag(hint)}</div>`;
  }
}

// The box of the hint shown: its name; under it its kind (R0: its weapon set and its levels too, « Staff ·
// Set I · From level 16 », the words of the switch, not « Weapon · I »); the line of its levels (R1 to R3); the
// stats of a unique; the text of its author; the hints of its slot (R0). An item the game data don't know has
// its slot in words for its kind (« Weapon »).
function inventoryDetail(hint, state) {
  if (!hint) return '<p class="it-none app-weak">No hint in this build.</p>';
  const asWas = chosen.rangeLine === "r0";
  const slot = asWas || slotSet(hint.id) === "0" ? hint.label : SLOT_NAMES[hint.id];
  const parts = slotCardParts({ name: hint.item.name, slot, note: hint.note, unknown: hint.item.unknown, levels: hint.levels, level: state.level });
  const known = !hint.item.unknown && BUILDS.items[hint.item.name];
  const set = slotSet(hint.id) === "0" || !known ? "" : `Set ${slotSet(hint.id) === "1" ? "I" : "II"}`;
  const subtitle = asWas ? [parts.subtitle, set, escapeHtml(levelsWords(hint, state.level))].filter(Boolean).join(" · ") : parts.subtitle;
  return `<div class="it-bare">
      <div class="it-bare-head"><strong>${parts.title}</strong><div class="it-bare-sub">${subtitle}</div>${asWas ? "" : rangeLine(hint, state.level)}</div>
      ${parts.stats.trim() ? `<div class="it-bare-part">${parts.stats}</div>` : ""}
      ${parts.note ? `<div class="it-bare-part">${fromAuthor()}${parts.note}</div>` : ""}
      ${asWas ? `<div class="it-bare-part">${itHistory(hint, state)}</div>` : ""}
    </div>`;
}
