// The inventory of the right column of the Overview, twelve variants (2j3), three at each of four
// temperatures: normal, high, explosive, free. Every variant follows the two rules of the owner
// (2026-11-20): square corners on every box of the inventory, and the real images of the items,
// from RePoE (BUILDS.items, written by tools/make-data.py). A hint that names no item of the game
// data (a free text of its author, « Any Belt ») has no image: its words stand in for it. Each shows
// the « unknown » mark (an id the game data don't know, specs.md, Unknown and invalid entries) and
// the switch of the weapon set in the language of Set I and Set II under the tree. Removed once one
// is kept.

// The slots as in the game, in cells of 24 units on a grid of 216 × 216 (a cell of the game is 24
// units: the staff 1 × 4 cells in a slot of 2 × 4): [id, x, y, width, height, cell]. Flask1 holds the
// two flasks (its cells 0 and 1: Lavianga's Spirits, a mana flask, is in cell 1), Charm1 the three
// charms; Weapon and Offhand follow the weapon set.
const INV_CELLS = [
  ["Weapon", 0, 0, 48, 96], ["Helm1", 84, 0, 48, 48], ["Offhand", 168, 0, 48, 96],
  ["Amulet1", 138, 24, 24, 24], ["Ring1", 54, 66, 24, 24], ["BodyArmour1", 84, 54, 48, 72], ["Ring2", 138, 66, 24, 24],
  ["Gloves1", 12, 108, 48, 48], ["Belt1", 84, 132, 48, 24], ["Boots1", 156, 108, 48, 48],
  ["Flask1", 32, 168, 24, 48, 0], ["Charm1", 68, 180, 24, 24, 0], ["Charm1", 96, 180, 24, 24, 1], ["Charm1", 124, 180, 24, 24, 2],
  ["Flask1", 160, 168, 24, 48, 1],
];
const INV_NAMES = { ...SLOT_NAMES, Trinket1: "Trinket", Flask2: "Flask 2" };
const cellId = (base, set) => (base === "Weapon" || base === "Offhand" ? `${base}${set}` : base);
const inDoll = id => INV_CELLS.some(([base]) => [cellId(base, 1), cellId(base, 2)].includes(id));

// The case of the other slots (a sample): a free text of the corpus on the belt (« Any Belt », no
// image), a charm in Trinket1 as Maxroll writes it (7 entries of the corpus; where the game shows it
// is open), and two ids the game data don't know, invented: a unique on the second ring, and a slot.
const INV_SAMPLE = [
  { id: "Belt1", x: 0, y: 0, levels: [1, 100], unique: "", base: "Any Belt" },
  { id: "Ring2", x: 0, y: 0, levels: [1, 100], unique: "Ashen Covenant", base: "", unknown: true },
  { id: "Trinket1", x: 2, y: 0, levels: [1, 100], unique: "", base: "Thawing Charm" },
  { id: "Trinket2", x: 0, y: 0, levels: [1, 100], unique: "", base: "Golden Charm", unknown: true },
];

function invHints(level, sample, set = STATE.inventorySet) {
  const hints = slotsAt(level, set);
  if (!sample) return hints;
  const replaced = new Set(INV_SAMPLE.map(hint => hint.id));
  return [...hints.filter(hint => !replaced.has(hint.id)), ...INV_SAMPLE];
}

// What a hint names: its item, its image when the game data know it, its slot in words.
function invItem(hint) {
  const name = hint.unique || withoutBase(hint.base) || "A hint without text";
  return { name, art: hint.unknown ? "" : BUILDS.items[name]?.art ?? "", unique: Boolean(hint.unique), unknown: Boolean(hint.unknown), slot: INV_NAMES[hint.id] ?? hint.id };
}
const invCells = (hints, set = STATE.inventorySet) => INV_CELLS.map(([base, x, y, w, h, cell]) => {
  const id = cellId(base, set);
  const hint = hints.find(slot => slot.id === id && (cell === undefined || slot.x === cell));
  return { id, x, y, w, h, small: w < 48, item: hint && invItem(hint) };
});
// The hints of the slots the drawing of the game has no place for: Trinket1, Flask2, an unknown id.
const invOthers = hints => hints.filter(hint => !inDoll(hint.id)).map(hint => ({ id: hint.id, item: invItem(hint) }));
const invFilled = hints => [...invCells(hints).filter(cell => cell.item), ...invOthers(hints)];
const invEmpty = hints => [...new Set(invCells(hints).filter(cell => !cell.item).map(cell => INV_NAMES[cell.id]))];

const invArt = (item, cls = "") => item.art ? `<img class="inv-art ${cls}" src="pathweaver/img/items/${item.art}" alt="">` : "";
const INV_UNKNOWN = '<span class="inv-unknown" title="Not in the game data of 0.5.2">?</span>';
const INV_UNKNOWN_WORD = '<span class="inv-unknown-word">unknown</span>';
const invTitle = cell => escapeHtml(cell.item ? `${cell.item.slot}: ${cell.item.name}${cell.item.unknown ? " · unknown" : ""}` : `${INV_NAMES[cell.id]}: nothing`);
const invState = cell => cell.item
  ? `is-hinted${cell.item.unique ? " is-unique" : ""}${cell.item.unknown ? " is-unknown" : ""}${cell.item.art ? "" : " is-text"}`
  : "is-empty";
const invName = item => `<span class="inv-name ${item.unique ? "is-unique" : ""} ${item.unknown ? "is-unknown" : ""}">${escapeHtml(item.name)}</span>${item.unknown ? INV_UNKNOWN_WORD : ""}`;
// A thumbnail: the image, or for a free text a line, for an unknown id the mark.
const invThumb = (item, size) => `<span class="inv-thumb ${item.unique ? "is-unique" : ""}" style="width:${size}px;height:${size}px">${
  item.art ? invArt(item) : item.unknown ? INV_UNKNOWN : '<span class="inv-thumb-text">Aa</span>'}</span>`;

// What a slot of the drawing holds: the image; the words of a free text or of an unknown id (a mark
// alone in a small slot); the name of the slot, weak, when it is empty and large enough.
function invInner(cell) {
  if (!cell.item) return cell.small ? "" : `<span class="inv-empty-name">${INV_NAMES[cell.id]}</span>`;
  if (cell.item.art) return invArt(cell.item);
  if (cell.small) return cell.item.unknown ? INV_UNKNOWN : '<span class="inv-text">…</span>';
  return `<span class="inv-text">${escapeHtml(cell.item.name)}</span>${cell.item.unknown ? INV_UNKNOWN : ""}`;
}

// The drawing of the game, its cells `cell` pixels wide; `inner` draws what a slot holds.
function invDoll(hints, { cell = 32, cls = "", inner = invInner, set } = {}) {
  const scale = cell / 24;
  const px = value => `${Math.round(value * scale)}px`;
  return `<div class="inv-doll ${cls}" style="width:${px(216)};height:${px(216)}">${invCells(hints, set).map(slot =>
    `<div class="inv-cell ${invState(slot)} ${/^(Weapon|Offhand)/.test(slot.id) ? `is-weapon is-set${slotSet(slot.id)}` : ""}" style="left:${px(slot.x)};top:${px(slot.y)};width:${px(slot.w)};height:${px(slot.h)}" title="${invTitle(slot)}">${inner(slot)}</div>`).join("")}</div>`;
}

// The slots the drawing has no place for, in a short list under it.
const invOthersList = hints => {
  const others = invOthers(hints);
  return others.length ? `<ul class="inv-others">${others.map(({ item }) =>
    `<li>${invThumb(item, 20)}<span class="inv-slot-word">${escapeHtml(item.slot)}</span>${invName(item)}</li>`).join("")}</ul>` : "";
};

// The switch of the weapon set, in the language of Set I and Set II under the tree: buttons without
// a box, in the weak grey, the set shown in its colour.
const invSetSwitch = (cls = "") => `<span class="inv-sets ${cls}">${[1, 2].map(set =>
  `<button type="button" class="inv-set is-set${set}" data-action="inventory-set" data-set="${set}" aria-pressed="${STATE.inventorySet === set}">Set ${set === 1 ? "I" : "II"}</button>`).join("")}</span>`;
const invHead = (right = invSetSwitch()) => `<div class="inv-head"><h2 class="app-side-title app-title">Inventory</h2>${right}</div>`;
const invNothing = hints => {
  const empty = invEmpty(hints);
  return empty.length ? `<p class="inv-nothing">Nothing for: ${empty.join(", ")}</p>` : "";
};

// The groups of the slots, for the variants that read as words.
const INV_GROUPS = [
  ["Weapons", ["Weapon1", "Offhand1", "Weapon2", "Offhand2"]],
  ["Armour", ["Helm1", "BodyArmour1", "Gloves1", "Boots1", "Belt1"]],
  ["Jewellery", ["Amulet1", "Ring1", "Ring2"]],
  ["Flasks and charms", ["Flask1", "Flask2", "Charm1", "Trinket1"]],
];
const invGroupOf = id => INV_GROUPS.find(([, ids]) => ids.includes(id))?.[0] ?? "Other";

// The links of the constellation (E2), between the centres of the slots, as the body holds them.
const INV_LINKS = [
  ["Helm1", "Amulet1"], ["Amulet1", "BodyArmour1"], ["Helm1", "BodyArmour1"], ["BodyArmour1", "Belt1"],
  ["BodyArmour1", "Ring1"], ["BodyArmour1", "Ring2"], ["Ring1", "Gloves1"], ["Gloves1", "Weapon"],
  ["Ring2", "Boots1"], ["Ring2", "Offhand"], ["Belt1", "Charm1"], ["Belt1", "Flask1"],
];

// The silhouette behind the floating items (E1): a head, shoulders, a body and legs, in one line.
const INV_FIGURE = '<svg class="inv-figure" viewBox="0 0 216 216" aria-hidden="true"><circle cx="108" cy="24" r="17"/><path d="M78 52 Q108 40 138 52 L150 120 Q108 132 66 120 Z"/><path d="M84 132 L80 210 M132 132 L136 210 M66 60 L36 128 M150 60 L180 128"/></svg>';

const INV_VARIANTS = {
  N1: { title: "N1 · The drawing of the game", text: "The slots as in the game, a cell of 32 px, each a square box, the image of its item in it; an empty slot its name in the weak grey. The other slots in a list under it.",
    render: hints => `${invHead()}${invDoll(hints)}${invOthersList(hints)}` },
  N2: { title: "N2 · The images without boxes", text: "The same drawing, the boxes gone: the images alone on the column, an empty slot a thin line where it is.",
    render: hints => `${invHead()}${invDoll(hints, { cls: "is-bare" })}${invOthersList(hints)}` },
  N3: { title: "N3 · A row per item", text: "As the skills above: a row per hint, its image, its slot in small capitals, its name, the uniques in their gold; the empty slots in one line at the end.",
    render: hints => `${invHead()}<ul class="inv-rows">${invFilled(hints).map(({ item }) =>
      `<li>${invThumb(item, 28)}<span class="inv-slot-word">${escapeHtml(item.slot)}</span>${invName(item)}</li>`).join("")}</ul>${invNothing(hints)}` },
  H1: { title: "H1 · The uniques framed", text: "The drawing, each slot that holds an item framed by a line of 1 px and lit from behind, in gold for a unique; the weapons topped by the line of their set; the switch under the drawing.",
    render: hints => `${invHead("")}${invDoll(hints, { cls: "is-framed" })}<div class="inv-under">${invSetSwitch()}</div>${invOthersList(hints)}` },
  H2: { title: "H2 · A sheet in two columns", text: "A character sheet: the weapons and the armour on the left, the jewellery, the flasks and the charms on the right, each its image over its name.",
    render: hints => {
      const filled = invFilled(hints), left = ["Weapons", "Armour"];
      const column = side => filled.filter(({ id }) => left.includes(invGroupOf(id)) === side).map(({ item }) =>
        `<li>${invThumb(item, 34)}<span><span class="inv-slot-word">${escapeHtml(item.slot)}</span>${invName(item)}</span></li>`).join("");
      return `${invHead()}<div class="inv-sheet"><ul>${column(true)}</ul><ul>${column(false)}</ul></div>${invNothing(hints)}`;
    } },
  H3: { title: "H3 · Both sets on the weapons", text: "No switch: the weapon of the other set lies behind the one shown, shifted, dimmed, its number in the colour of its set; a click on it brings it to the front.",
    render: (hints, level, sample) => {
      const other = STATE.inventorySet === 1 ? 2 : 1;
      const behind = invCells(invHints(level, sample, other), other).filter(cell => /^(Weapon|Offhand)/.test(cell.id));
      const scale = 32 / 24;
      const back = behind.map(cell => `<button type="button" class="inv-cell inv-behind ${invState(cell)} is-set${other}" data-action="inventory-set" data-set="${other}" title="Set ${other === 1 ? "I" : "II"} · ${invTitle(cell)}" style="left:${Math.round(cell.x * scale) + 7}px;top:${Math.round(cell.y * scale) - 7}px;width:${Math.round(cell.w * scale)}px;height:${Math.round(cell.h * scale)}px">${invInner(cell)}<span class="inv-set-tag">${other === 1 ? "I" : "II"}</span></button>`).join("");
      const front = invDoll(hints, { cls: "is-stacked", inner: cell => `${invInner(cell)}${/^(Weapon|Offhand)/.test(cell.id) ? `<span class="inv-set-tag">${STATE.inventorySet === 1 ? "I" : "II"}</span>` : ""}` });
      return `${invHead("")}<div class="inv-stack">${back}${front}</div>${invOthersList(hints)}`;
    } },
  E1: { title: "E1 · Floating on a silhouette", text: "No slot at all: the items float over the line of a body, larger, with a shadow; what the build says nothing about isn't drawn.",
    render: hints => `${invHead()}<div class="inv-float-wrap">${INV_FIGURE}${invDoll(hints, { cell: 32, cls: "is-float" })}</div>${invOthersList(hints)}` },
  E2: { title: "E2 · A constellation, as the tree", text: "The slots as nodes in thin square frames, linked as the body holds them; a link lit in white between two slots that hold an item, as the passives taken; an empty slot a small dim square.",
    render: hints => {
      const scale = 32 / 24, cells = invCells(hints);
      const centre = id => { const cell = cells.find(c => c.id === cellId(id, STATE.inventorySet) || c.id === id); return [(cell.x + cell.w / 2) * scale, (cell.y + cell.h / 2) * scale, Boolean(cell.item)]; };
      const lines = INV_LINKS.map(([a, b]) => { const [x1, y1, la] = centre(a), [x2, y2, lb] = centre(b);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${la && lb ? "is-lit" : ""}"/>`; }).join("");
      return `${invHead()}<div class="inv-constellation"><svg class="inv-links" viewBox="0 0 288 288" aria-hidden="true">${lines}</svg>${invDoll(hints, { cls: "is-nodes" })}</div>${invOthersList(hints)}`;
    } },
  E3: { title: "E3 · The shelves", text: "The items on two shelves at their real proportions, each under a spot of light, set on a line: the weapons and the armour, then the belt, the jewellery, the flasks and the charms; names on hover.",
    render: hints => {
      const filled = invFilled(hints), top = ["Weapons", "Armour"];
      const shelf = side => `<div class="inv-shelf">${filled.filter(({ id }) => top.includes(invGroupOf(id)) === side && id !== "Belt1" || (!side && id === "Belt1")).map(({ id, item }) => {
        const size = BUILDS.items[item.name] ?? { w: 1, h: 1 };
        return `<span class="inv-shelf-item ${item.unique ? "is-unique" : ""}" title="${escapeHtml(`${item.slot}: ${item.name}`)}" style="width:${item.art ? size.w * 22 : 44}px;height:${item.art ? size.h * 22 : 22}px">${item.art ? invArt(item) : item.unknown ? INV_UNKNOWN : `<span class="inv-text">${escapeHtml(item.name)}</span>`}</span>`;
      }).join("")}</div>`;
      return `${invHead()}${shelf(true)}${shelf(false)}`;
    } },
  F1: { title: "F1 · A strip of thumbnails", text: "The fifteen slots in one line of thumbnails of 16 px, as the supports at the right of a row, grouped by their kind; an empty slot a thin square; the names on hover.",
    render: hints => {
      const cells = invCells(hints), order = INV_GROUPS.map(([, ids]) => cells.filter(cell => ids.includes(cell.id)));
      return `${invHead()}<div class="inv-strip">${order.map(group => `<span class="inv-strip-group">${group.map(cell =>
        `<span class="inv-strip-cell ${invState(cell)}" title="${invTitle(cell)}">${cell.item ? cell.item.art ? invArt(cell.item) : cell.item.unknown ? INV_UNKNOWN : "" : ""}</span>`).join("")}</span>`).join("")}</div>${invOthersList(hints)}`;
    } },
  F2: { title: "F2 · A line per kind", text: "A line of words per kind of slot, each item a small image before its name, joined by « · »; « nothing » in the weak grey for a kind without hint.",
    render: hints => {
      const filled = invFilled(hints);
      return `${invHead()}<div class="inv-prose">${INV_GROUPS.map(([group]) => {
        const items = filled.filter(({ id }) => invGroupOf(id) === group);
        return `<p><span class="inv-slot-word">${group}</span>${items.length ? items.map(({ item }) => `<span class="inv-prose-item">${invThumb(item, 16)}${invName(item)}</span>`).join('<span class="app-weak"> · </span>') : '<span class="app-weak">nothing</span>'}</p>`;
      }).join("")}${filled.some(({ id }) => invGroupOf(id) === "Other") ? `<p><span class="inv-slot-word">Other</span>${filled.filter(({ id }) => invGroupOf(id) === "Other").map(({ item }) => `<span class="inv-prose-item">${invThumb(item, 16)}${invName(item)}</span>`).join("")}</p>` : ""}</div>`;
    } },
  F3: { title: "F3 · Tiles", text: "A tile per item, two by row, its image on the left, its slot over its name; the empty slots in one line at the end.",
    render: hints => `${invHead()}<ul class="inv-tiles">${invFilled(hints).map(({ item }) =>
      `<li class="${item.unique ? "is-unique" : ""}">${invThumb(item, 36)}<span><span class="inv-slot-word">${escapeHtml(item.slot)}</span>${invName(item)}</span></li>`).join("")}</ul>${invNothing(hints)}` },
};
