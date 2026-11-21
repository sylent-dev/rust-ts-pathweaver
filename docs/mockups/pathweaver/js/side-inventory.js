// The inventory of the right column of the Overview, for one weapon set at a time.
//
// N2 of twelve variants (2j3, the owner, 2026-11-20; the others in the history of Git): the slots as
// in the game, the real image of each item in its box (from RePoE, BUILDS.items, written by
// tools/make-data.py), square corners on every box; an empty slot its name in the weak grey. A hint
// that names no item of the game data (a free text of its author, « Any Belt ») has no image: its
// words stand in for it. The slots the drawing has no place for (an unknown id; Trinket1 and Flask2 drawn where they belong,
// drawnSlot in js/levels.js) in a
// short list under it. Each box darker than the column with a line (B4 at 25 %, css/side-inventory.css).
// A hinted slot, or a line of the list, shows the card of its item under the pointer (js/slot-hover.js).

STATE.inventorySet = 1;

// The slots as in the game, in cells of 24 units on a grid of 216 × 216 (the staff, 1 × 4 cells, in
// a slot of 2 × 4): [id, x, y, width, height, cell]. Flask1 holds the two flasks (its cells 0 and 1:
// Lavianga's Spirits, a mana flask, is in cell 1), Charm1 the three charms; Weapon and Offhand
// follow the weapon set.
const INVENTORY_LAYOUT = [
  ["Weapon", 0, 0, 48, 96], ["Helm1", 84, 0, 48, 48], ["Offhand", 168, 0, 48, 96],
  ["Amulet1", 138, 24, 24, 24], ["Ring1", 54, 66, 24, 24], ["BodyArmour1", 84, 54, 48, 72], ["Ring2", 138, 66, 24, 24],
  ["Gloves1", 12, 108, 48, 48], ["Belt1", 84, 132, 48, 24], ["Boots1", 156, 108, 48, 48],
  ["Flask1", 32, 168, 24, 48, 0], ["Charm1", 68, 180, 24, 24, 0], ["Charm1", 96, 180, 24, 24, 1], ["Charm1", 124, 180, 24, 24, 2],
  ["Flask1", 160, 168, 24, 48, 1],
];
// A cell of the game drawn 32 px wide: the drawing fills the 288 px inside the column.
const INVENTORY_CELL = 32;
const INVENTORY_NAMES = { ...SLOT_NAMES, Trinket1: "Trinket", Flask2: "Flask 2" };
const cellId = (base, set) => (base === "Weapon" || base === "Offhand" ? `${base}${set}` : base);
const inLayout = id => INVENTORY_LAYOUT.some(([base]) => [cellId(base, 1), cellId(base, 2)].includes(id));

// What a hint names: its item, its image when the game data know it, its slot in words.
function hintItem(hint) {
  const name = hint.unique || withoutBase(hint.base) || "A hint without text";
  return { name, art: hint.unknown ? "" : BUILDS.items[name]?.art ?? "", unique: Boolean(hint.unique), unknown: Boolean(hint.unknown), slot: INVENTORY_NAMES[hint.id] ?? hint.id };
}

const itemArt = item => item.art ? `<img class="app-item-art" src="pathweaver/img/items/${item.art}" alt="">` : "";
// What the card of a hinted slot reads (js/slot-hover.js): its item, its slot, its levels, the note of
// its author, at the level shown.
const hintAttributes = (hint, item, level) => `data-item="${escapeHtml(item.name)}" data-slot="${escapeHtml(item.slot)}" data-levels="${hint.levels}" data-level="${level}" data-note="${escapeHtml(hint.note ?? "")}"${item.unknown ? " data-unknown" : ""}`;
const UNKNOWN_MARK = `<span class="app-unknown" title="${NOT_IN_GAME_DATA}">?</span>`;

// The mark of a free text of its author in a box too small for its words (a small slot, a thumbnail): it
// names no item, so has no image (2k2c, the owner, 2026-11-21: an empty box read as an image not loaded). F5 of
// five: a grey sticky note with lines, turned, a light shadow under it, as the « ? » of an unknown id but never
// its yellow, which warns: the author stuck a word where the item would be. Set aside: « … », as the small slots
// had; the bubble of the mark of a note (it says a note besides the item, not in its place); the grey note
// straight; a pale one. Its words in a native tooltip where nothing opens on hover, the Inventory tab
// (`said`; the owner, 2026-11-21): elsewhere the card of the slot would open under it.
const FREE_TEXT_WORDS = "A text of the author, not an item of the game";
const freeTextMark = (said = false) => `<span class="app-free-text"${said ? ` title="${FREE_TEXT_WORDS}"` : ""}><svg class="app-free-note" viewBox="0 0 14 14" aria-hidden="true"><rect width="14" height="14"/><path d="M3 4.5H11M3 7.5H11M3 10.5H8"/></svg></span>`;
// The thumbnail of an item: its image, the « ? » of an unknown id, the mark of a free text.
const thumbInner = (item, said) => (item.art ? itemArt(item) : item.unknown ? UNKNOWN_MARK : freeTextMark(said));

// What a slot holds: the image; the words of a free text or of an unknown id (a mark alone in a small
// slot); the name of the slot, weak, when it is empty and large enough.
function slotInner(item, id, small, said) {
  if (!item) return small ? "" : `<span class="app-slot-empty">${INVENTORY_NAMES[id]}</span>`;
  if (item.art) return itemArt(item);
  if (small) return item.unknown ? UNKNOWN_MARK : freeTextMark(said);
  return `<span class="app-slot-text">${escapeHtml(item.name)}</span>${item.unknown ? UNKNOWN_MARK : ""}`;
}

// The switch of the weapon set, in the right column, its drawer and the Inventory tab (2k2b, N2 of twelve
// variants, the owner, 2026-11-21; the words without a box, two trapezoids from the top, hanging tags and
// eight others set aside): a box in two halves, the set shown filled with its colour, which fades in once
// when the set changes (STATE.setMoved).
const inventorySetSwitch = () => `<span class="app-inventory-sets${STATE.setMoved ? " is-moved" : ""}">${[1, 2].map(set =>
  `<button type="button" class="is-set${set}" data-action="inventory-set" data-set="${set}" aria-pressed="${STATE.inventorySet === set}">Set ${set === 1 ? "I" : "II"}</button>`).join("")}</span>`;

// The drawing of the slots at a level, for a weapon set, a cell of the game drawn `cell` px wide; `extra`
// adds to a slot a class, attributes and some HTML (the Inventory tab, js/inventory-tab.js: what comes later,
// the slot chosen); `said`, the tooltip of the mark of a free text, where no card opens on hover.
function inventoryDrawing(level, hints, { set = STATE.inventorySet, cell = INVENTORY_CELL, extra, said = false } = {}) {
  const scale = cell / 24;
  const px = value => `${Math.round(value * scale)}px`;
  const slots = INVENTORY_LAYOUT.map(([base, x, y, w, h, index]) => {
    const id = cellId(base, set);
    const hint = hints.find(slot => slot.id === id && (index === undefined || slot.x === index));
    const item = hint && hintItem(hint);
    const state = item ? `is-hinted${item.unknown ? " is-unknown" : ""}${item.art ? "" : " is-text"}` : "is-empty";
    const more = { className: "", attributes: "", html: "", ...extra?.(id, index ?? 0) };
    // An empty slot says which it is in its title (a small one shows no name); a hinted one has its card.
    const about = item ? hintAttributes(hint, item, level) : `title="${escapeHtml(INVENTORY_NAMES[id])}: nothing"`;
    return `<div class="app-slot ${state} ${more.className}" style="left:${px(x)};top:${px(y)};width:${px(w)};height:${px(h)}" ${about} ${more.attributes}>${slotInner(item, id, w < 48, said)}${more.html}</div>`;
  }).join("");
  return `<div class="app-inventory" style="width:${px(216)};height:${px(216)}">${slots}</div>`;
}

// The slots the drawing has no place for, under it: a thumbnail, the slot, the name.
function inventoryOthers(level, hints, said = false) {
  const others = hints.filter(hint => !inLayout(hint.id));
  return others.length ? `<ul class="app-inventory-others">${others.map(hint => [hint, hintItem(hint)]).map(([hint, item]) =>
    `<li ${hintAttributes(hint, item, level)}><span class="app-item-thumb">${thumbInner(item, said)}</span><span class="app-inventory-slot">${escapeHtml(item.slot)}</span><span class="app-inventory-name">${escapeHtml(item.name)}</span>${item.unknown ? '<span class="app-unknown-word">unknown</span>' : ""}</li>`).join("")}</ul>` : "";
}

// The inventory at a level, from the hints of the build (or given ones, for a case of the mock-up).
const inventoryBox = (level, hints = slotsAt(level, STATE.inventorySet)) =>
  `<div class="app-inventory-head"><h2 class="app-side-title app-title">Inventory</h2>${inventorySetSwitch()}</div>
    ${inventoryDrawing(level, hints)}${inventoryOthers(level, hints)}`;

ACTIONS["inventory-set"] = element => {
  // A change of set fades the colour of the switch in once.
  STATE.setMoved = STATE.inventorySet !== Number(element.dataset.set);
  STATE.inventorySet = Number(element.dataset.set);
  return true;
};
AFTER_RENDER.push(() => { STATE.setMoved = false; });
