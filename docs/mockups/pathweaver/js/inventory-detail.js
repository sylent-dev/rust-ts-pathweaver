// The box of the item chosen in the Inventory tab (2k2), on the right of the drawing: what the card of a
// slot says (slotCardParts, js/slot-hover.js), then every hint of its slot along the levels. Six variants,
// chosen with the tabs « Item box » (VARIANTS.invPanel, js/page.js): four in the construction of the cards
// on hover (css/hover-card.css), as the card of a gem on the Overview, two without a background, on the
// graph paper (the owner, 2026-11-21).

const INVENTORY_PANELS = {
  p1: "P1 · The card on hover, the width of the box: the hints of the slot as a fourth part",
  p2: "P2 · The same card, the image of the item in the square of its head",
  p3: "P3 · The same card, the image of the item at its own cells beside the stats",
  p4: "P4 · The card at its width on hover, 320 px, the hints of the slot beside it",
  p5: "P5 · No background: the words on the graph paper, thin lines between the parts",
  p6: "P6 · No background, four corners in the accent around the box",
};

// The parts of the card of the hint chosen, its slot in the words of the tab (« Weapon · I »).
const itParts = (hint, level) => slotCardParts({ name: hint.item.name, slot: hint.label, note: hint.note, unknown: hint.item.unknown, levels: hint.levels, level });
// The image of the item, at its own cells of the game (P3: 32 px a cell).
function itCellsArt(hint) {
  const size = BUILDS.items[hint.item.name];
  if (!hint.item.art || !size) return "";
  return `<span class="it-cells-art" style="width:${size.w * 32}px;height:${size.h * 32}px">${itemArt(hint.item)}</span>`;
}
// The hints of its slot, along the levels: the one at the level in the accent.
const itHistory = (shown, state) => `<h3 class="it-title app-title">On this slot</h3><ul class="it-rows">${state.all.filter(hint => sameCell(hint, shown)).map(hint =>
  `<li class="it-row${appliesAt(hint.levels, state.level) ? " is-now" : ""}" ${itAbout(hint, state.level)}><span class="it-span app-number">${hint.levels[0]}–${hint.levels[1]}</span>${itThumb(hint)}${itName(hint)}</li>`).join("")}</ul>`;
const itStatic = (className, html) => `<div class="app-hover is-hover-card is-static it-panel ${className}">${html}</div>`;
const itStateLine = parts => `<div class="app-hover-state">${parts.state}</div>`;

// The box of the hint chosen, in the variant chosen.
function inventoryDetail(hint, state) {
  if (!hint) return '<p class="it-none app-weak">No hint in this build.</p>';
  // The text of the author titled as theirs (the owner, 2026-11-21): the stats they aim for, written as lines of
  // their text since the format has no field for them, would read as the stats of the item.
  const found = itParts(hint, state.level);
  const parts = { ...found, note: found.note ? `<div class="it-from">From the author</div>${found.note}` : "" };
  const history = itHistory(hint, state);
  const card = (art = "", body = `${parts.stats}${itStateLine(parts)}`) => hoverCardHtml({ ...parts, art, body });
  // On the graph paper: the head, then the parts between thin lines.
  const bare = className => `<div class="it-bare ${className}">${className === "it-p6" ? '<span class="it-corners" aria-hidden="true"></span>' : ""}
      <div class="it-bare-head"><strong>${parts.title}</strong><div class="it-bare-sub">${parts.subtitle}</div></div>
      <div class="it-bare-part">${parts.stats}${itStateLine(parts)}</div>
      ${parts.note ? `<div class="it-bare-part it-bare-note">${parts.note}</div>` : ""}
      <div class="it-bare-part">${history}</div>
    </div>`;
  switch (chosen.invPanel) {
    case "p2": return itStatic("it-p2", `${card(hint.item.art ? itemArt(hint.item) : hint.item.unknown ? UNKNOWN_MARK : "")}<div class="hc-body it-history">${history}</div>`);
    case "p3": return itStatic("it-p3", `${card("", `<div class="it-p3-row">${itCellsArt(hint)}<div class="it-p3-words">${parts.stats}${itStateLine(parts)}</div></div>`)}<div class="hc-body it-history">${history}</div>`);
    case "p4": return `<div class="it-p4">${itStatic("it-p4-card", card())}<div class="it-p4-history">${history}</div></div>`;
    case "p5": return bare("it-p5");
    case "p6": return bare("it-p6");
    default: return itStatic("it-p1", `${card()}<div class="hc-body it-history">${history}</div>`);
  }
}
