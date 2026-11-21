// The card of a slot of the inventory (2j3, specs.md, Inventory): the item a hint names, in gold for
// a unique, and its kind (its slot when the game data don't know it); for a unique, its base, its
// implicits and its stats (from Path of Building, BUILDS.items, written by tools/make-data.py); the
// levels of the hint, then the note of its author with the markup of the game (markupHtml,
// js/tree-hover.js), without the numbers at the start of its lines (« 1. 88% increased Spell Damage »:
// 555 lines of 215 hints of the corpus; the owner, 2026-11-20). Fixed on the page as the card of a gem,
// just left of the column, over the tree, centred on the slot.
// On a hinted slot of the drawing of the right column, and on a line of the list under it; a tap on a touch screen gives
// the same card (the browser sends the pointer there first).

// The text of a hint without the numbers at the start of its lines, behind the tags of the markup
// that open a line too (« <s>{1. Adds… »), here and in the card of a note set again (js/note-hover.js).
const withoutNumbers = text => text.replace(/^((?:<[^<>{}]*>\{)*)\d+\.\s+/gm, "$1");

const ITEM_MISSING = {
  unknown: NOT_IN_GAME_DATA,
  stats: "Its stats are not in the data yet",
};

// What the card of a slot says, in parts, so that the card on hover and the detail of the Inventory tab
// (js/inventory-detail.js) read one rule: its title, the name of the item, in gold for a unique; its
// subtitle, its kind, and the base of a unique after it; its stats, the implicits and the stats of a
// unique and what the data lack; its state, its slot and its levels; the text of its author, under its title
// « From the author » (fromAuthor, js/hover-card.js): the format has no field for the stats of an item, so
// authors write those they aim for as numbered lines of their text (590 lines in 217 hints of 326, the sample
// of Grinding Gear Games too), which would read as the stats of the item without it.
function slotCardParts({ name, slot, note, unknown, levels, level }) {
  const item = unknown ? undefined : BUILDS.items[name];
  const kind = !item ? slot : item.unique ? `Unique ${item.kind.toLowerCase()}` : item.kind;
  const lines = list => list?.length ? `<ul class="app-hover-stats">${list.map(line => `<li>${escapeHtml(line)}</li>`).join("")}</ul>` : "";
  const missing = unknown ? ITEM_MISSING.unknown : item?.unique && !item.stats ? ITEM_MISSING.stats : "";
  return {
    title: item?.unique ? `<span class="is-unique">${escapeHtml(name)}</span>` : escapeHtml(name),
    subtitle: escapeHtml(item?.unique && item.base ? `${kind} · ${item.base}` : kind),
    stats: `${item?.implicits?.length ? `<div class="app-item-implicits">${lines(item.implicits)}</div>` : ""}
      ${lines(item?.stats)}
      ${missing ? `<p class="app-hover-missing${unknown ? " is-unknown" : ""}">${missing}</p>` : ""}`,
    state: `${item ? `${escapeHtml(slot)} · ` : ""}${levelsWords({ levels }, level)}`,
    note: note ? markupHtml(withoutNumbers(note.replace(/\r/g, ""))) : "",
  };
}

// In the construction of every card on hover (2k, the owner, 2026-11-20; js/hover-card.js), without art:
// the image of an item doesn't fit its square (a staff is two cells by four).
function slotHoverHtml(element) {
  const { item: name, slot, note, levels, level } = element.dataset;
  const parts = slotCardParts({ name, slot, note, unknown: "unknown" in element.dataset, levels: levels.split(",").map(Number), level: Number(level) });
  return hoverCardHtml({ ...parts, body: `${parts.stats}<div class="app-hover-state">${parts.state}</div>` });
}

const slotCard = document.createElement("div");
slotCard.className = "app-hover app-pinned-card app-slot-hover";
document.body.append(slotCard);
function showSlotHover(element) {
  slotCard.innerHTML = slotHoverHtml(element);
  titleIfCut(slotCard);
  slotCard.classList.add("is-shown");
  const box = element.getBoundingClientRect();
  const column = element.closest(".app-side")?.getBoundingClientRect() ?? box;
  const [w, h] = [slotCard.offsetWidth, slotCard.offsetHeight];
  // Left of the column; right of it when the window has no room on its left (the inventory alone).
  slotCard.style.left = `${column.left - w - 8 >= 8 ? column.left - w - 8 : column.right + 8}px`;
  slotCard.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, box.top + box.height / 2 - h / 2))}px`;
}
// Not in the Inventory tab (the owner, 2026-11-21): its box says it beside the drawing.
openOnHover(slotCard, ".app-side .app-inventory [data-item], .app-side .app-inventory-others [data-item]", showSlotHover);
