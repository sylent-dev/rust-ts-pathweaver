// The Overview tab: the tree, and beside it what is new at the level, the skills and the inventory.

STATE.inventorySet = 1;

// The inventory as in the game, in a box of 216 × 216 pixels: [id, x, y, width, height].
const INVENTORY_LAYOUT = [
  ["Weapon", 0, 0, 48, 96], ["Helm1", 84, 0, 48, 48], ["Offhand", 168, 0, 48, 96],
  ["Amulet1", 138, 24, 24, 24], ["Ring1", 54, 66, 24, 24], ["BodyArmour1", 84, 54, 48, 72], ["Ring2", 138, 66, 24, 24],
  ["Gloves1", 12, 108, 48, 48], ["Belt1", 84, 132, 48, 24], ["Boots1", 156, 108, 48, 48],
  ["Flask1", 54, 168, 24, 48], ["Charm1", 84, 178, 14, 24, 0], ["Charm1", 101, 178, 14, 24, 1], ["Charm1", 118, 178, 14, 24, 2],
  ["Flask2", 138, 168, 24, 48],
];

function newAtBox(level) {
  const changes = changesAt(level);
  const lines = [
    ...changes.skills.map(skill => {
      const supports = skill.supports.filter(support => appliesAt(support.levels, level));
      const skillsWith = supports.filter(gem => gem.kind !== "support");
      const with_ = [...skillsWith.map(gem => escapeHtml(gem.name)), supports.length > skillsWith.length ? plural(supports.length - skillsWith.length, "support") : ""].filter(Boolean);
      return `+ ${escapeHtml(skill.name)}${with_.length > 0 ? `, with ${with_.join(" and ")}` : ""}`;
    }),
    ...changes.supports.map(support => `+ ${escapeHtml(support.name)} on ${escapeHtml(support.skill)}`),
    ...changes.slots.map(slot => `+ a hint on the ${SLOT_NAMES[slot.id].toLowerCase()}`),
    changes.passives > 0 ? `+ ${plural(changes.passives, "passive")}, ringed on the tree` : "",
    changes.removedPassives > 0 ? `− ${plural(changes.removedPassives, "passive")}` : "",
  ].filter(Boolean);
  if (lines.length === 0) return `<div class="app-new is-empty app-weak">Nothing new at ${level}</div>`;
  return `<div class="app-new"><span class="app-accent">New at ${level}</span>${lines.map(line => `<span class="app-new-line">${line}</span>`).join("")}</div>`;
}

function skillList(level) {
  const skills = skillsAt(level);
  return `<h2 class="app-side-title app-title">Skills · ${skills.length}</h2>
    <ul class="app-skills">${skills.map(skill => {
      const isNew = startsAt(skill.levels, level) || skill.supports.some(support => startsAt(support.levels, level));
      return `<li class="app-skill"><span class="app-gem is-${skill.colour} ${skill.kind === "spirit" ? "is-spirit" : ""}" title="${skill.kind} gem"></span><span class="app-skill-name">${escapeHtml(skill.name)}</span>${isNew ? '<span class="app-accent app-skill-new">new</span>' : ""}<span class="app-weak app-skill-supports">${plural(skill.supports.length, "support")}</span></li>`;
    }).join("")}</ul>`;
}

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

function treePanel(level) {
  const set = STATE.set;
  const ascendancy = TREE.ascendancyTaken.filter(([, low, high]) => appliesAt([low, high], level)).length;
  return `<div class="app-tree">
    <canvas class="app-tree-canvas" data-tree="main" aria-label="Passive tree"></canvas>
    <div class="app-tree-top">${weaponSetSwitch("tree-set", set)}
      <span class="app-number">${plural(passivesAt(level, 0).length, "pt")} · asc. ${ascendancy} / ${ASCENDANCY_POINTS} · I ${passivesAt(level, 1).length} · II ${passivesAt(level, 2).length}</span></div>
    <div class="app-ascendancy">
      <span>${escapeHtml(SHOWN.ascendancy)} · <span class="app-number">${ascendancy} / ${ASCENDANCY_POINTS}</span></span>
      <canvas class="app-ascendancy-canvas" data-tree="ascendancy" aria-label="Ascendancy passives"></canvas>
    </div>
    <div class="app-tree-zoom">
      <button type="button" data-action="tree-zoom" data-zoom="in" aria-label="Zoom in">${icon(14, ICONS.plus)}</button>
      <button type="button" data-action="tree-zoom" data-zoom="out" aria-label="Zoom out">${icon(14, ICONS.minus)}</button>
    </div>
    <div class="app-tree-legend app-weak">
      <span><i class="app-dot is-taken"></i>taken</span><span><i class="app-dot is-later"></i>taken later</span>
      <span><i class="app-dot"></i>not taken</span><span><i class="app-dot is-new"></i>new here</span>
    </div>
  </div>`;
}

function overview() {
  const level = STATE.level;
  return `<div class="app-overview">
    ${treePanel(level)}
    <aside class="app-side">${newAtBox(level)}${skillList(level)}${inventoryBox(level)}</aside>
  </div>`;
}

ACTIONS["inventory-set"] = element => {
  STATE.inventorySet = Number(element.dataset.set);
  return true;
};
