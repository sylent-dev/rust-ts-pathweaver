// The inventory of the right column of the Overview, for one weapon set at a time.
//
// N2 of twelve variants (2j3, the owner, 2026-11-20; the others in the history of Git): the slots as
// in the game, the real image of each item in its box (from RePoE, BUILDS.items, written by
// tools/make-data.py), square corners on every box; an empty slot its name in the weak grey. A hint
// that names no item of the game data (a free text of its author, « Any Belt ») has no image: its
// words stand in for it. The slots the drawing has no place for (Trinket1, Flask2, an unknown id) in a
// short list under it. The look of the boxes is open (VARIANTS.invBox and invBoxStrength).

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
const UNKNOWN_MARK = '<span class="app-unknown" title="Not in the game data of 0.5.2">?</span>';

// What a slot holds: the image; the words of a free text or of an unknown id (a mark alone in a small
// slot); the name of the slot, weak, when it is empty and large enough.
function slotInner(item, id, small) {
  if (!item) return small ? "" : `<span class="app-slot-empty">${INVENTORY_NAMES[id]}</span>`;
  if (item.art) return itemArt(item);
  if (small) return item.unknown ? UNKNOWN_MARK : '<span class="app-slot-text">…</span>';
  return `<span class="app-slot-text">${escapeHtml(item.name)}</span>${item.unknown ? UNKNOWN_MARK : ""}`;
}

// The switch of the weapon set, in the language of Set I and Set II under the tree: buttons without
// a box, in the weak grey, the set shown in its colour.
const inventorySetSwitch = () => `<span class="app-inventory-sets">${[1, 2].map(set =>
  `<button type="button" class="is-set${set}" data-action="inventory-set" data-set="${set}" aria-pressed="${STATE.inventorySet === set}">Set ${set === 1 ? "I" : "II"}</button>`).join("")}</span>`;

// The inventory at a level, from the hints of the build (or given ones, for a case of the mock-up).
function inventoryBox(level, hints = slotsAt(level, STATE.inventorySet)) {
  const set = STATE.inventorySet, scale = INVENTORY_CELL / 24;
  const px = value => `${Math.round(value * scale)}px`;
  const slots = INVENTORY_LAYOUT.map(([base, x, y, w, h, cell]) => {
    const id = cellId(base, set);
    const hint = hints.find(slot => slot.id === id && (cell === undefined || slot.x === cell));
    const item = hint && hintItem(hint);
    const state = item ? `is-hinted${item.unknown ? " is-unknown" : ""}${item.art ? "" : " is-text"}` : "is-empty";
    const title = item ? `${item.slot}: ${item.name}${item.unknown ? " · unknown" : ""}` : `${INVENTORY_NAMES[id]}: nothing`;
    return `<div class="app-slot ${state}" style="left:${px(x)};top:${px(y)};width:${px(w)};height:${px(h)}" title="${escapeHtml(title)}">${slotInner(item, id, w < 48)}</div>`;
  }).join("");
  const others = hints.filter(hint => !inLayout(hint.id)).map(hintItem);
  return `<div class="app-inventory-head"><h2 class="app-side-title app-title">Inventory</h2>${inventorySetSwitch()}</div>
    <div class="app-inventory" style="width:${px(216)};height:${px(216)}">${slots}</div>
    ${others.length ? `<ul class="app-inventory-others">${others.map(item =>
      `<li><span class="app-item-thumb">${item.art ? itemArt(item) : item.unknown ? UNKNOWN_MARK : ""}</span><span class="app-inventory-slot">${escapeHtml(item.slot)}</span><span class="app-inventory-name ${item.unknown ? "is-unknown" : ""}">${escapeHtml(item.name)}</span>${item.unknown ? '<span class="app-unknown-word">unknown</span>' : ""}</li>`).join("")}</ul>` : ""}`;
}

ACTIONS["inventory-set"] = element => {
  STATE.inventorySet = Number(element.dataset.set);
  return true;
};
