// The Inventory tab (2k2, the owner, 2026-11-21): the slots as in the game, where the right column of the
// Overview only has room for the drawing (js/side-inventory.js). H1, kept of twelve variants at four
// temperatures (the others in the history of Git), cut in two: the drawing on the left, a click on a slot
// shows its hint on the right, written out: its item, its levels and its weapon set, its stats, its note
// (js/inventory-detail.js); the hints to come under the drawing, by the level they come at. No card on hover
// in the tab. The tab is as high as the Overview (668 px) and scrolls inside.

// The hints of the build shown, or of a case of the corpus (`source`, a key of BUILDS.inventories).
const itHints = source => (source ? BUILDS.inventories[source] : SHOWN.slots);

// The order of the slots in the lists: the weapons of each set, the armour, the jewellery, the flasks and
// the charms, then the slots the drawing has no place for.
const IT_ORDER = ["Weapon1", "Offhand1", "Weapon2", "Offhand2", "Helm1", "BodyArmour1", "Gloves1", "Boots1", "Belt1",
  "Amulet1", "Ring1", "Ring2", "Flask1", "Flask2", "Charm1", "Trinket1"];
const itRank = hint => (IT_ORDER.includes(hint.id) ? IT_ORDER.indexOf(hint.id) : IT_ORDER.length) * 10 + hint.x;
const sameCell = (a, b) => a.id === b.id && a.x === b.x;
// A cell of the inventory: a slot, or a cell of the flasks and the charms; a hint, its cell and the level it
// comes at.
const cellKey = ({ id, x }) => `${id}:${x}`;
const hintKey = hint => `${cellKey(hint)}:${hint.levels[0]}`;

// A slot in words, with its weapon set, its side or its cell where the game has several.
function itLabel(hint) {
  const set = slotSet(hint.id);
  if (set !== "0") return `${SLOT_NAMES[hint.id]} · Set ${set === "1" ? "I" : "II"}`;
  if (hint.id === "Ring1" || hint.id === "Ring2") return `Ring · ${hint.id === "Ring1" ? "left" : "right"}`;
  if (hint.id === "Flask1") return `Flask · ${hint.x ? "mana" : "life"}`;
  if (hint.id === "Charm1") return `Charm · ${hint.x + 1}`;
  return INVENTORY_NAMES[hint.id] ?? hint.id;
}

// What the tab reads at a level: every hint with its item and its slot in words, in the order of the
// slots; those that apply (`now`); those to come, by the level they come at, each with the hint it replaces
// on its cell (of those that apply, the last to end before it comes: a campaign of the corpus gives a weapon
// 1–32, another 32–45, a third from 46).
function itState(level, source) {
  const all = itHints(source).map(hint => ({ ...hint, item: hintItem(hint), label: itLabel(hint) }))
    .sort((a, b) => itRank(a) - itRank(b));
  const now = all.filter(hint => appliesAt(hint.levels, level));
  const later = all.filter(hint => hint.levels[0] > level).sort((a, b) => a.levels[0] - b.levels[0])
    .map(hint => ({ ...hint, replaces: now.filter(other => sameCell(other, hint) && other.levels[1] < hint.levels[0])
      .sort((a, b) => b.levels[1] - a.levels[1])[0] }));
  return { all, now, later, level, source };
}

// The pieces of the tab.
const itThumb = (hint, className = "") => `<span class="app-item-thumb it-thumb${className && ` ${className}`}">${thumbInner(hint.item, true)}</span>`;
const itName = hint => `<span class="it-name${hint.item.unique ? " is-unique" : ""}">${escapeHtml(hint.item.name)}</span>`;
const itSlot = hint => `<span class="it-slot">${escapeHtml(hint.label)}</span>`;
const itAt = level => `<span class="it-at app-number">${level}</span>`;
const itTitle = (text, className = "") => `<h3 class="it-title app-title ${className}">${text}</h3>`;
// The hint shown on the right, chosen by a click: on a slot, the hint it holds at the level (its cell); on a
// line of « To come », that hint. By default the first new at the level, or the first
// of the drawing. No card on hover in the tab (the owner, 2026-11-21): the box says it beside, and a card
// would hide the slots around; nor does the box follow the pointer, which crosses other slots on its way to
// it. A new choice flashes the edge of its slot once (S3), not a drawing again for another reason (the level,
// the weapon set).
ACTIONS["it-choose"] = element => {
  STATE.itFlash = STATE.itChosen !== element.dataset.pick;
  STATE.itChosen = element.dataset.pick;
  return true;
};
AFTER_RENDER.push(() => { STATE.itFlash = false; });

// The Inventory tab at a level, of the build shown or of a case; `middle`, the hints upcoming in a column of
// their own between the drawing and the box, and `cell`, the width of a cell of the drawing (2k4, ways to use
// 1,920 px).
function inventoryTab(level = STATE.level, source, { middle = false, cell = 44 } = {}) {
  const state = itState(level, source);
  const hints = [...state.now, ...state.later];
  const shown = state.all.find(hint => hintKey(hint) === STATE.itChosen) ?? hints.find(hint => cellKey(hint) === STATE.itChosen)
    ?? state.now.find(hint => startsAt(hint.levels, level)) ?? hints[0];
  // The slot drawing the hint shown has its edge; none when the hint shown is an upcoming one (its tile is marked).
  const drawn = shown && state.now.includes(shown);
  const extra = (id, x) => ({ attributes: `data-action="it-choose" data-pick="${cellKey({ id, x })}"`,
    className: drawn && cellKey({ id, x }) === cellKey(shown) ? `is-chosen${STATE.itFlash ? " is-flash" : ""}` : "" });
  return `<div class="app-inventory-tab"><div class="app-it graph-paper" data-level="${level}"${source ? ` data-source="${source}"` : ""}>
      <div class="it-left"><div class="it-head">${inventorySetSwitch()}</div>${inventoryDrawing(level, state.now, { cell, extra, said: true, choosable: true })}
        ${inventoryOthers(level, state.now, true)}${middle ? "" : inventoryLater(state, shown)}</div>
      ${middle ? `<div class="it-mid">${inventoryLater(state, shown)}</div>` : ""}
      <div class="it-side">${inventoryDetail(shown, state)}</div>
    </div></div>`;
}
