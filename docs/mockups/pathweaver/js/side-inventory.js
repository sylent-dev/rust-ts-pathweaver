// The inventory of the right column of the Overview, for one weapon set at a time.

STATE.inventorySet = 1;

// The inventory as in the game, in a box of 216 × 216 pixels: [id, x, y, width, height].
const INVENTORY_LAYOUT = [
  ["Weapon", 0, 0, 48, 96], ["Helm1", 84, 0, 48, 48], ["Offhand", 168, 0, 48, 96],
  ["Amulet1", 138, 24, 24, 24], ["Ring1", 54, 66, 24, 24], ["BodyArmour1", 84, 54, 48, 72], ["Ring2", 138, 66, 24, 24],
  ["Gloves1", 12, 108, 48, 48], ["Belt1", 84, 132, 48, 24], ["Boots1", 156, 108, 48, 48],
  ["Flask1", 54, 168, 24, 48], ["Charm1", 84, 178, 14, 24, 0], ["Charm1", 101, 178, 14, 24, 1], ["Charm1", 118, 178, 14, 24, 2],
  ["Flask2", 138, 168, 24, 48],
];

function weaponSetSwitch(action, current) {
  return `<span class="app-switch"><span class="app-switch-label">Weapon set</span>${[1, 2].map(set =>
    `<button type="button" data-action="${action}" data-set="${set}" aria-pressed="${current === set}">${set === 1 ? "I" : "II"}</button>`).join("")}</span>`;
}

function inventoryBox(level) {
  const set = STATE.inventorySet;
  const slots = slotsAt(level, set);
  const hinted = (id, cell) => slots.some(slot => slot.id === id && (cell === undefined || slot.x === cell));
  return `<h2 class="app-side-title app-title">Inventory · ${plural(slotsAt(level).length, "hint")}</h2>
    ${weaponSetSwitch("inventory-set", set)}
    <div class="app-inventory">${INVENTORY_LAYOUT.map(([base, x, y, width, height, cell]) => {
      const id = base === "Weapon" || base === "Offhand" ? `${base}${set}` : base;
      const has = hinted(id, cell);
      const name = width >= 48 ? `<span>${SLOT_NAMES[id]}</span>` : "";
      return `<div class="app-slot ${has ? "is-hinted" : ""}" style="left:${x}px;top:${y}px;width:${width}px;height:${height}px" title="${SLOT_NAMES[id]}">${name}</div>`;
    }).join("")}</div>`;
}

ACTIONS["inventory-set"] = element => {
  STATE.inventorySet = Number(element.dataset.set);
  return true;
};
