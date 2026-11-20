// The card of a slot of the inventory (2j3, specs.md, Inventory): the item a hint names, in gold for
// a unique, and its kind (its slot when the game data don't know it); for a unique, its base, its
// implicits and its stats (from Path of Building, BUILDS.items, written by tools/make-data.py); the
// levels of the hint, then the note of its author with the markup of the game (markupHtml,
// js/tree-hover.js), without the numbers at the start of its lines (« 1. 88% increased Spell Damage »:
// 555 lines of 215 hints of the corpus; the owner, 2026-11-20). In the language of the card of a gem
// (css/gem-hover.css): fixed on the page, just left of the column, over the tree, centred on the slot.
// On a hinted slot of the drawing, and on a line of the list under it; a tap on a touch screen gives
// the same card (the browser sends the pointer there first).

const ITEM_MISSING = {
  unknown: "Not in the game data of 0.5.2",
  stats: "Its stats are not in the data yet",
};

function slotHoverHtml(element) {
  const { item: name, slot, note } = element.dataset;
  const unknown = "unknown" in element.dataset;
  const item = unknown ? undefined : BUILDS.items[name];
  const kind = !item ? slot : item.unique ? `Unique ${item.kind.toLowerCase()}` : item.kind;
  const lines = list => list?.length ? `<ul class="app-hover-stats">${list.map(line => `<li>${escapeHtml(line)}</li>`).join("")}</ul>` : "";
  const missing = unknown ? ITEM_MISSING.unknown : item?.unique && !item.stats ? ITEM_MISSING.stats : "";
  return `<div class="app-hover-head"><strong class="${item?.unique ? "is-unique" : ""}">${escapeHtml(name)}</strong><span class="app-weak">${escapeHtml(kind)}</span></div>
    ${item?.unique ? `<div class="app-item-base">${escapeHtml(item.base ?? "")}</div>` : ""}
    ${item?.implicits?.length ? `<div class="app-item-implicits">${lines(item.implicits)}</div>` : ""}
    ${lines(item?.stats)}
    ${missing ? `<p class="app-item-missing">${missing}</p>` : ""}
    <div class="app-hover-state">${item ? `${slot} · ` : ""}${levelsWords({ levels: element.dataset.levels.split(",").map(Number) }, Number(element.dataset.level))}</div>
    ${note ? `<div class="app-hover-hint">${markupHtml(note.replace(/^\d+\.\s+/gm, ""))}</div>` : ""}`;
}

const slotCard = document.createElement("div");
slotCard.className = "app-hover app-gem-hover app-slot-hover";
document.body.append(slotCard);
function showSlotHover(element) {
  slotCard.innerHTML = slotHoverHtml(element);
  slotCard.classList.add("is-shown");
  const box = element.getBoundingClientRect();
  const column = element.closest(".app-side")?.getBoundingClientRect() ?? box;
  const [w, h] = [slotCard.offsetWidth, slotCard.offsetHeight];
  // Left of the column; right of it when the window has no room on its left (the inventory alone).
  slotCard.style.left = `${column.left - w - 8 >= 8 ? column.left - w - 8 : column.right + 8}px`;
  slotCard.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, box.top + box.height / 2 - h / 2))}px`;
}
document.addEventListener("mouseover", event => {
  const element = event.target.closest?.(".app-inventory [data-item], .app-inventory-others [data-item]");
  if (element) showSlotHover(element);
  else slotCard.classList.remove("is-shown");
});
document.addEventListener("scroll", () => slotCard.classList.remove("is-shown"), { capture: true, passive: true });
