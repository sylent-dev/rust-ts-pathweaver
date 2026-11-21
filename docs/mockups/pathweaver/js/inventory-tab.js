// The Inventory tab (2k2, the owner, 2026-11-21): the slots as in the game, where the right column of the
// Overview only has room for the drawing (js/side-inventory.js). H1, kept of twelve variants at four
// temperatures (the others in the history of Git): the drawing on the left, a click on a slot shows its hint
// on the right, written out: its item, its stats, its note, and every hint of the slot along the levels
// (js/inventory-detail.js);
// the hints to come under the drawing, by the level they come at. The card of a slot on hover of its
// drawing or its line (js/slot-hover.js). The tab is as high as the Overview (668 px) and scrolls inside.

// The hints of the build shown, or of a case of the corpus (`source`, a key of BUILDS.inventories).
const itHints = source => (source ? BUILDS.inventories[source] : SHOWN.slots);

// The order of the slots in the lists: the weapons of each set, the armour, the jewellery, the flasks and
// the charms, then the slots the drawing has no place for.
const IT_ORDER = ["Weapon1", "Offhand1", "Weapon2", "Offhand2", "Helm1", "BodyArmour1", "Gloves1", "Boots1", "Belt1",
  "Amulet1", "Ring1", "Ring2", "Flask1", "Flask2", "Charm1", "Trinket1"];
const itRank = hint => (IT_ORDER.includes(hint.id) ? IT_ORDER.indexOf(hint.id) : IT_ORDER.length) * 10 + hint.x;
const sameCell = (a, b) => a.id === b.id && a.x === b.x;
// A cell of the inventory: a slot, or a cell of the flasks and the charms.
const cellKey = ({ id, x }) => `${id}:${x}`;

// A slot in words, with its weapon set, its side or its cell where the game has several.
function itLabel(hint) {
  const set = slotSet(hint.id);
  if (set !== "0") return `${SLOT_NAMES[hint.id]} · ${set === "1" ? "I" : "II"}`;
  if (hint.id === "Ring1" || hint.id === "Ring2") return `Ring · ${hint.id === "Ring1" ? "left" : "right"}`;
  if (hint.id === "Flask1") return `Flask · ${hint.x ? "mana" : "life"}`;
  if (hint.id === "Charm1") return `Charm · ${hint.x + 1}`;
  return INVENTORY_NAMES[hint.id] ?? hint.id;
}

// What the tab reads at a level: every hint with its item and its slot in words, in the order of the
// slots; those that apply (`now`); those to come, by the level they come at.
function itState(level, source) {
  const all = itHints(source).map(hint => ({ ...hint, item: hintItem(hint), label: itLabel(hint) }))
    .sort((a, b) => itRank(a) - itRank(b));
  const now = all.filter(hint => appliesAt(hint.levels, level));
  const later = all.filter(hint => hint.levels[0] > level).sort((a, b) => a.levels[0] - b.levels[0]);
  return { all, now, later, level, source };
}

// The pieces of the tab.
const itAbout = (hint, level) => hintAttributes(hint, hint.item, level);
const itThumb = hint => `<span class="app-item-thumb it-thumb">${hint.item.art ? itemArt(hint.item) : hint.item.unknown ? UNKNOWN_MARK : ""}</span>`;
const itName = hint => `<span class="it-name${hint.item.unique ? " is-unique" : ""}">${escapeHtml(hint.item.name)}</span>`;
const itSlot = hint => `<span class="it-slot">${escapeHtml(hint.label)}</span>`;
const itAt = level => `<span class="it-at app-number">${level}</span>`;
const itTitle = (text, className = "") => `<h3 class="it-title app-title ${className}">${text}</h3>`;
// The slot shown on the right, chosen by a click on it or on its line; by default the first new at the
// level, or the first of the drawing. A new choice flashes the edge of its slot once (S3, S4 of « Chosen
// slot »), not a drawing again for another reason (the level, the weapon set).
ACTIONS["it-choose"] = element => {
  STATE.itFlash = STATE.itChosen !== element.dataset.cell;
  STATE.itChosen = element.dataset.cell;
  return true;
};
AFTER_RENDER.push(() => { STATE.itFlash = false; });

// The head of the drawing, chosen with the tabs « Inventory head »: the title « At level N » (T1), none (T2:
// the band above says the level), the level large behind the drawing, filled (T3) or outlined (T4), its
// opacity on the slider « Level mark ».
const INVENTORY_CHOSEN = { s1: "S1 · 2 px", s2: "S2 · 1 px", s3: "S3 · 1 px, a flash when chosen", s4: "S4 · 1 px, a light around when chosen" };
const INVENTORY_HEADS = { t1: "T1 · The title", t2: "T2 · No title", t3: "T3 · The level behind, filled", t4: "T4 · The level behind, outlined" };
const itHead = level => `<div class="app-inventory-head">${chosen.invHead === "t1" ? itTitle(`At level ${level}`) : ""}${inventorySetSwitch()}</div>`;
const itMark = level => (["t3", "t4"].includes(chosen.invHead)
  ? `<span class="it-mark app-number${chosen.invHead === "t4" ? " is-outlined" : ""}${String(level).length > 2 ? " is-long" : ""}" aria-hidden="true">${level}</span>` : "");

// The Inventory tab at a level, of the build shown or of a case.
function inventoryTab(level = STATE.level, source) {
  const state = itState(level, source);
  const hints = [...state.now, ...state.later];
  const shown = hints.find(hint => cellKey(hint) === STATE.itChosen) ?? state.now.find(hint => startsAt(hint.levels, level)) ?? hints[0];
  const extra = (id, x) => ({ attributes: `data-action="it-choose" data-cell="${cellKey({ id, x })}"`,
    className: shown && cellKey({ id, x }) === cellKey(shown) ? `is-chosen${STATE.itFlash ? " is-flash" : ""}` : "" });
  const later = state.later.length ? `${itTitle("To come", "is-next")}<ul class="it-rows">${state.later.map(hint =>
    `<li class="it-row is-later" data-action="it-choose" data-cell="${cellKey(hint)}" ${itAbout(hint, level)}>${itAt(hint.levels[0])}${itThumb(hint)}${itSlot(hint)}${itName(hint)}</li>`).join("")}</ul>` : "";
  return `<div class="app-inventory-tab"><div class="app-it" data-level="${level}"${source ? ` data-source="${source}"` : ""}>
      <div class="it-left">${itHead(level)}<div class="it-figure">${itMark(level)}${inventoryDrawing(level, state.now, { cell: 44, extra })}</div>
        ${inventoryOthers(level, state.now)}${later}</div>
      <div class="it-side">${inventoryDetail(shown, state)}</div>
    </div></div>`;
}
