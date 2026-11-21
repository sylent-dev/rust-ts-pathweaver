// The Inventory tab (2k2): the slots as in the game, beside them the hints at the level, then those to
// come, where the right column of the Overview only has room for the drawing (js/side-inventory.js).
// Twelve variants, three at each of four temperatures (normal, high, explosive, free), chosen with the
// tabs « Inventory tab » (VARIANTS.inventoryTab, js/page.js). Every variant draws the same data: the
// hints of the file, each on its cell (a slot, or a cell of the flasks and the charms); those that apply
// at the level; those to come, by the level they come at, each with the hint it replaces on its cell;
// those worn before; the card of a slot on hover of its drawing, its thumbnail or its line
// (js/slot-hover.js). The tab is as high as the Overview (668 px) and scrolls inside.

// The hints and the portrait of the build shown, or of a case of the corpus (`source`, a key of
// BUILDS.inventories).
const itCase = source => (source ? BUILDS.inventories[source] : SHOWN);

// The order of the slots in the lists: the weapons of each set, the armour, the jewellery, the flasks and
// the charms, then the slots the drawing has no place for.
const IT_ORDER = ["Weapon1", "Offhand1", "Weapon2", "Offhand2", "Helm1", "BodyArmour1", "Gloves1", "Boots1", "Belt1",
  "Amulet1", "Ring1", "Ring2", "Flask1", "Flask2", "Charm1", "Trinket1"];
const itRank = hint => (IT_ORDER.includes(hint.id) ? IT_ORDER.indexOf(hint.id) : IT_ORDER.length) * 10 + hint.x;
const sameCell = (a, b) => a.id === b.id && a.x === b.x;
const cellKey = hint => `${hint.id}:${hint.x}`;

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
// slots; those that apply (`now`); those to come by the level they come at, each with the one it
// replaces on its cell (of those that apply, the last to end before it comes: a campaign of the corpus
// gives a weapon 1–32, another 32–45, a third from 46); those worn before; the levels where the gear
// changes (`steps`).
function itState(level, source) {
  const all = itCase(source).slots.map(hint => ({ ...hint, item: hintItem(hint), label: itLabel(hint) }))
    .sort((a, b) => itRank(a) - itRank(b));
  const now = all.filter(hint => appliesAt(hint.levels, level));
  const later = all.filter(hint => hint.levels[0] > level).sort((a, b) => a.levels[0] - b.levels[0])
    .map(hint => ({ ...hint, replaces: now.filter(other => sameCell(other, hint) && other.levels[1] < hint.levels[0])
      .sort((a, b) => b.levels[1] - a.levels[1])[0] }));
  const before = all.filter(hint => hint.levels[1] < level);
  const steps = [...new Set(all.map(hint => hint.levels[0]))].sort((a, b) => a - b);
  return { all, now, later, before, steps, level, source };
}

// The pieces of every variant.
const itAbout = (hint, level) => hintAttributes(hint, hint.item, level);
const itThumb = hint => `<span class="app-item-thumb it-thumb">${hint.item.art ? itemArt(hint.item) : hint.item.unknown ? UNKNOWN_MARK : ""}</span>`;
const itName = hint => `<span class="it-name${hint.item.unique ? " is-unique" : ""}">${escapeHtml(hint.item.name)}</span>`;
const itSlot = hint => `<span class="it-slot">${escapeHtml(hint.label)}</span>`;
const itNew = (hint, level) => (startsAt(hint.levels, level) ? '<span class="st-new">new</span>' : "");
const itAt = level => `<span class="it-at app-number">${level}</span>`;
const itStep = step => (step === 1 ? "From the start" : `At ${step}`);
const itTitle = (text, className = "") => `<h3 class="it-title app-title ${className}">${text}</h3>`;
const itNone = text => `<p class="it-none app-weak">${text}</p>`;
// The note of its author written out, without the numbers of its lines, with the markup of the game;
// its first line in plain words, for a short label.
const itNote = hint => (hint.note ? `<div class="it-note">${markupHtml(withoutNumbers(hint.note.replace(/\r/g, "")))}</div>` : "");
const itFirstLine = hint => escapeHtml(withoutNumbers(hint.note.replace(/\r/g, "")).split("\n")[0].replace(/<[^<>{}]*>\{|\}/g, ""));
const itReplaces = hint => (hint.replaces ? `<span class="it-replaces app-weak">in place of ${escapeHtml(hint.replaces.item.name)}</span>` : "");

// The drawing of the slots at the level, for the weapon set chosen, under its title and the switch of the
// set; the slots it has no place for under it.
const itDrawing = (state, cell, extra, title = `At level ${state.level}`) => `<div class="it-drawing">
    <div class="app-inventory-head">${itTitle(title)}${inventorySetSwitch()}</div>
    ${inventoryDrawing(state.level, state.now, { cell, extra })}${inventoryOthers(state.level, state.now)}
  </div>`;

// A line of a list: the thumbnail, the slot, the item, « NEW »; a hint to come with its level first and
// the hint it replaces.
const itRow = (hint, level) => `<li class="it-row" ${itAbout(hint, level)}>${itThumb(hint)}${itSlot(hint)}${itName(hint)}${itNew(hint, level)}</li>`;
const itLaterRow = (hint, level) => `<li class="it-row is-later" ${itAbout(hint, level)}>${itAt(hint.levels[0])}${itThumb(hint)}${itSlot(hint)}${itName(hint)}${itReplaces(hint)}</li>`;
const itLists = state => `${itTitle(`Hints at level ${state.level}`)}
  ${state.now.length ? `<ul class="it-rows">${state.now.map(hint => itRow(hint, state.level)).join("")}</ul>` : itNone("No hint at this level.")}
  ${itTitle("To come", "is-next")}
  ${state.later.length ? `<ul class="it-rows">${state.later.map(hint => itLaterRow(hint, state.level)).join("")}</ul>` : itNone("Nothing more to come.")}`;

// The tab: its variant, its level and its case, read back by the actions.
const itTab = (state, className, body) =>
  `<div class="app-it ${className}" data-level="${state.level}"${state.source ? ` data-source="${state.source}"` : ""}>${body}</div>`;

// A card of a hint (N2): its slot and its item in a head in the deep shade, its thumbnail as a badge, its
// note written out in the darker body.
const itCard = (hint, level, later = false) => `<div class="it-card${later ? " is-later" : ""}">
    <div class="it-card-head" ${itAbout(hint, level)}>${later ? itAt(hint.levels[0]) : ""}<span class="it-card-words">${itSlot(hint)}${itName(hint)}</span>${later ? "" : itNew(hint, level)}<span class="it-badge">${itThumb(hint)}</span></div>
    ${hint.note || hint.replaces ? `<div class="it-card-body">${later && hint.replaces ? `<p class="it-card-replaces">${itReplaces(hint)}</p>` : ""}${itNote(hint)}</div>` : ""}
  </div>`;

// The cells of the hints, each once, in the order of the slots (N3, H2).
const itCells = state => state.all.filter((hint, index) => state.all.findIndex(other => sameCell(other, hint)) === index);
const itOfCell = (hints, cell) => hints.filter(hint => sameCell(hint, cell));

// What a cell holds at a level, by its key (H3).
const itAtLevel = (state, level) => new Map(state.all.filter(hint => appliesAt(hint.levels, level)).map(hint => [cellKey(hint), hint]));

// The cell of the drawing a layout entry draws, for the weapon set shown.
const layoutKey = (id, index) => `${id}:${index}`;

// E1: the labels of the slots of the drawing, on its left and its right, each joined to its slot by a line.
const E1 = { cell: 44, label: 236, gap: 26, height: 44, space: 4 };
function itAnnotated(state) {
  const scale = E1.cell / 24, set = STATE.inventorySet, size = 216 * scale;
  const placed = INVENTORY_LAYOUT.map(([base, x, y, w, h, index]) => {
    const hint = state.now.find(other => other.id === cellId(base, set) && other.x === (index ?? 0));
    const centre = x + w / 2;
    // The column of the middle (the helmet, the body, the belt, a charm) shares itself between the sides.
    const left = centre < 108 || (centre === 108 && ["BodyArmour1", "Belt1"].includes(base));
    return hint && { hint, left, y: (y + h / 2) * scale, edge: (left ? x : x + w) * scale };
  }).filter(Boolean);
  const side = left => {
    const labels = placed.filter(entry => entry.left === left).sort((a, b) => a.y - b.y);
    let bottom = -E1.space;
    for (const entry of labels) bottom = (entry.top = Math.max(entry.y - E1.height / 2, bottom + E1.space)) + E1.height;
    // Pushed back up from the bottom when the last label falls under the drawing.
    let limit = size;
    for (const entry of [...labels].reverse()) limit = (entry.top = Math.min(entry.top, limit - E1.height)) - E1.space;
    return labels;
  };
  const drawingLeft = E1.label + E1.gap;
  const lines = [...side(true), ...side(false)].map(entry => {
    const from = entry.left ? E1.label : drawingLeft + size + E1.gap;
    const to = drawingLeft + entry.edge;
    return `<path d="M${from} ${entry.top + E1.height / 2} H${entry.left ? from + 8 : from - 8} L${entry.left ? to - 6 : to + 6} ${entry.y} H${to}"/><circle cx="${to}" cy="${entry.y}" r="2.5"/>`;
  }).join("");
  const label = entry => `<div class="it-e1-label${entry.left ? " is-left" : ""}" style="top:${entry.top}px" ${itAbout(entry.hint, state.level)}>
      <span class="it-e1-line">${itSlot(entry.hint)}${itNew(entry.hint, state.level)}</span>${itName(entry.hint)}${entry.hint.note ? `<span class="it-e1-first app-weak">${itFirstLine(entry.hint)}</span>` : ""}</div>`;
  return `<div class="it-e1-board" style="height:${size}px">
      <svg class="it-e1-lines" width="${2 * (E1.label + E1.gap) + size}" height="${size}" aria-hidden="true">${lines}</svg>
      <div class="it-e1-side">${placed.filter(entry => entry.left).map(label).join("")}</div>
      <div class="it-e1-drawing">${inventoryDrawing(state.level, state.now, { cell: E1.cell })}</div>
      <div class="it-e1-side is-right">${placed.filter(entry => !entry.left).map(label).join("")}</div>
    </div>`;
}

// F2: the hints packed as in a stash of the game, each on its own cells (a staff two by four), first fit
// row by row on a grid of 40 px.
const STASH = { cell: 40, columns: 23 };
function itStash(hints, level, className) {
  const taken = [];
  const free = (column, row, w, h) => {
    for (let y = row; y < row + h; y += 1) for (let x = column; x < column + w; x += 1) if (taken[y]?.[x]) return false;
    return column + w <= STASH.columns;
  };
  const items = hints.map(hint => {
    const size = BUILDS.items[hint.item.name];
    const [w, h] = hint.item.art && size ? [size.w, size.h] : [2, 1];
    for (let row = 0; ; row += 1) for (let column = 0; column < STASH.columns; column += 1) {
      if (!free(column, row, w, h)) continue;
      for (let y = row; y < row + h; y += 1) for (let x = column; x < column + w; x += 1) (taken[y] ??= [])[x] = true;
      return { hint, column, row, w, h };
    }
  });
  const rows = Math.max(1, taken.length);
  return `<div class="it-stash ${className}" style="height:${rows * STASH.cell}px">${items.map(({ hint, column, row, w, h }) =>
    `<div class="it-stash-item${hint.item.art ? "" : " is-text"}" style="left:${column * STASH.cell}px;top:${row * STASH.cell}px;width:${w * STASH.cell}px;height:${h * STASH.cell}px" ${itAbout(hint, level)}>${hint.item.art ? itemArt(hint.item) : `<span>${escapeHtml(hint.item.name)}</span>`}${hint.levels[0] > level ? itAt(hint.levels[0]) : ""}${itNew(hint, level)}</div>`).join("")}</div>`;
}

// The portrait of the ascendancy of the case, large for the build shown (F3).
const itPortrait = source => (source ? `pathweaver/img/portraits/${itCase(source).portrait}.webp` : `pathweaver/img/portraits-large/${SHOWN.portrait}.webp`);

// A sentence per level where the gear changes (F1): what comes then, in words.
function itSentence(state, step) {
  const hints = state.all.filter(hint => hint.levels[0] === step);
  const phrase = hint => {
    const replaced = state.all.find(other => sameCell(other, hint) && other.levels[1] === step - 1);
    return `<span class="it-f1-item" ${itAbout(hint, state.level)}>${itThumb(hint)}${itName(hint)}<span class="app-weak"> (${escapeHtml(hint.label.replace(/^\w+/, word => word.toLowerCase()))}${replaced ? `, in place of ${escapeHtml(replaced.item.name)}` : ""})</span></span>`;
  };
  const words = hints.map(phrase);
  const joined = words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words.at(-1)}` : words.join("");
  const when = step <= state.level ? (state.steps.filter(other => other <= state.level).at(-1) === step ? "is-current" : "is-past") : "is-later";
  return `<p class="it-f1-step ${when}"><span class="it-f1-when">${itStep(step)}</span>, ${joined}.</p>`;
}

const INVENTORY_TAB_VARIANTS = {
  n1: {
    title: "N1 · The drawing and two lists",
    text: "The wireframe: the slots as in the game on the left; on the right the hints at the level, a line each, then those to come by the level they come at, with the hint they replace.",
    draw: state => itTab(state, "it-n1", `${itDrawing(state, 40)}<div class="it-side">${itLists(state)}</div>`),
  },
  n2: {
    title: "N2 · The drawing and cards",
    text: "The cards of the Skills tab: a card per hint, its slot and its item in the head, its note written out in the body; those to come after, their level in the head.",
    draw: state => itTab(state, "it-n2", `${itDrawing(state, 32)}<div class="it-side">
      ${itTitle(`Hints at level ${state.level}`)}<div class="it-cards">${state.now.map(hint => itCard(hint, state.level)).join("") || itNone("No hint at this level.")}</div>
      ${itTitle("To come", "is-next")}<div class="it-cards">${state.later.map(hint => itCard(hint, state.level, true)).join("") || itNone("Nothing more to come.")}</div></div>`),
  },
  n3: {
    title: "N3 · A table by slot",
    text: "A line per slot of the file: what it held before (when a hint of the file ended before the level), what it holds at the level, what comes after with its level; the drawing small on the left.",
    draw: state => {
      const before = state.before.length > 0;
      const entries = (hints, past = false) => hints.map(hint => `<span class="it-cell-item" ${itAbout(hint, state.level)}>${past || hint.levels[0] > state.level ? itAt(past ? `–${hint.levels[1]}` : hint.levels[0]) : ""}${itThumb(hint)}${itName(hint)}</span>`).join("");
      return itTab(state, "it-n3", `${itDrawing(state, 28)}<div class="it-side"><table class="it-table">
        <thead><tr><th>Slot</th>${before ? "<th>Before</th>" : ""}<th>At ${state.level}</th><th>Later</th></tr></thead>
        <tbody>${itCells(state).map(cell => `<tr><th>${itSlot(cell)}</th>${before ? `<td class="is-before">${entries(itOfCell(state.before, cell), true)}</td>` : ""}<td class="is-now">${entries(itOfCell(state.now, cell))}</td><td>${entries(itOfCell(state.later, cell))}</td></tr>`).join("")}</tbody></table></div>`);
    },
  },
  h1: {
    title: "H1 · The drawing and its detail",
    text: "A click on a slot shows its hint on the right, written out: its item, its stats, its note, and every hint of the slot along the levels; those to come under the drawing.",
    draw: state => {
      const cells = [...state.now, ...state.later];
      const chosen = cells.find(hint => cellKey(hint) === STATE.itChosen) ?? state.now.find(hint => startsAt(hint.levels, state.level)) ?? cells[0];
      const extra = (id, index) => ({ attributes: `data-action="it-choose" data-cell="${layoutKey(id, index)}"`, className: chosen && layoutKey(id, index) === cellKey(chosen) ? "is-chosen" : "" });
      const item = chosen && BUILDS.items[chosen.item.name];
      const lines = list => (list?.length ? `<ul class="app-hover-stats">${list.map(line => `<li>${escapeHtml(line)}</li>`).join("")}</ul>` : "");
      const detail = chosen ? `<div class="it-detail">
          <div class="it-detail-head"><span class="it-detail-art">${chosen.item.art ? itemArt(chosen.item) : chosen.item.unknown ? UNKNOWN_MARK : ""}</span>
            <div>${itName(chosen)}<div class="it-detail-kind app-weak">${escapeHtml(chosen.label)}${item ? ` · ${escapeHtml(item.unique ? `Unique ${item.kind.toLowerCase()}${item.base ? ` · ${item.base}` : ""}` : item.kind)}` : ""}</div></div></div>
          ${item?.implicits?.length ? `<div class="app-item-implicits">${lines(item.implicits)}</div>` : ""}${lines(item?.stats)}
          ${itNote(chosen)}
          ${itTitle("On this slot")}<ul class="it-rows">${itOfCell(state.all, chosen).map(hint =>
            `<li class="it-row${appliesAt(hint.levels, state.level) ? " is-now" : ""}" ${itAbout(hint, state.level)}><span class="it-span app-number">${hint.levels[0]}–${hint.levels[1]}</span>${itThumb(hint)}${itName(hint)}</li>`).join("")}</ul>
        </div>` : itNone("No hint in this build.");
      return itTab(state, "it-h1", `<div class="it-left">${itDrawing(state, 44, extra)}
        ${state.later.length ? `${itTitle("To come", "is-next")}<ul class="it-rows">${state.later.map(hint =>
          `<li class="it-row is-later" data-action="it-choose" data-cell="${cellKey(hint)}" ${itAbout(hint, state.level)}>${itAt(hint.levels[0])}${itThumb(hint)}${itSlot(hint)}${itName(hint)}</li>`).join("")}</ul>` : ""}</div>
        <div class="it-side">${detail}</div>`);
    },
  },
  h2: {
    title: "H2 · On the levels",
    text: "A line per slot, a bar per hint from the level it comes to the level it goes, the level of the band a line across: the whole gear of the guide at a glance.",
    draw: state => itTab(state, "it-h2", `${itDrawing(state, 24)}<div class="it-side">
      <div class="it-h2-line it-h2-scale app-number app-weak"><span></span><span class="it-h2-track">${[1, 25, 50, 75, 100].map(mark => `<span style="left:${mark - 1}%">${mark}</span>`).join("")}</span></div>
      ${itCells(state).map(cell => `<div class="it-h2-line">${itSlot(cell)}<span class="it-h2-track">${itOfCell(state.all, cell).map(hint => {
        const [low, high] = hint.levels;
        const when = appliesAt(hint.levels, state.level) ? "is-now" : low > state.level ? "is-later" : "is-before";
        return `<span class="it-h2-bar ${when}" style="left:${low - 1}%;width:${high - low + 1}%" ${itAbout(hint, state.level)}>${itThumb(hint)}${itName(hint)}</span>`;
      }).join("")}<span class="it-h2-now" style="left:${state.level - 0.5}%"></span></span></div>`).join("")}</div>`),
  },
  h3: {
    title: "H3 · Now and next",
    text: "The slots at the level beside the slots at a level to come, each new hint outlined in the accent (a Twin Bow for a Twin Bow, its note changed); the levels to come as buttons, what changes listed at the right.",
    draw: state => {
      const coming = state.steps.filter(step => step > state.level);
      const next = coming.includes(STATE.itNext) ? STATE.itNext : coming[0];
      if (next === undefined) return itTab(state, "it-h3", `${itDrawing(state, 34)}<div class="it-side">${itNone("Nothing more to come.")}</div>`);
      const [now, then] = [itAtLevel(state, state.level), itAtLevel(state, next)];
      const changed = [...new Set([...now.keys(), ...then.keys()])].filter(key => now.get(key) !== then.get(key));
      const nextState = { ...state, now: [...then.values()] };
      const extra = (id, index) => ({ className: changed.includes(layoutKey(id, index)) ? "is-changed" : "" });
      const order = key => itRank(now.get(key) ?? then.get(key));
      return itTab(state, "it-h3", `<div class="it-h3-steps"><span class="app-weak">Compare with</span>${coming.map(step =>
        `<button type="button" class="it-h3-step app-number" data-action="it-next" data-step="${step}" aria-pressed="${step === next}">${step}</button>`).join("")}</div>
        <div class="it-h3-row">${itDrawing(state, 34)}${itDrawing(nextState, 34, extra, `At level ${next}`)}
        <div class="it-side">${itTitle(`What changes at ${next}`)}<ul class="it-rows">${changed.sort((a, b) => order(a) - order(b)).map(key => {
          const [old, fresh] = [now.get(key), then.get(key)];
          const hint = fresh ?? old;
          return `<li class="it-h3-change" ${itAbout(hint, next)}>${itSlot(hint)}${old ? `<span class="it-h3-old">${itName(old)}</span>` : ""}<span class="it-h3-new">${fresh ? `${itThumb(fresh)}${itName(fresh)}` : '<span class="app-weak">nothing</span>'}</span></li>`;
        }).join("")}</ul></div></div>`);
    },
  },
  e1: {
    title: "E1 · An annotated drawing",
    text: "The drawing large in the middle, each hint a label on its side, joined to its slot by a line: its slot, its item, the first line of its note; those to come in a strip under it.",
    draw: state => itTab(state, "it-e1", `<div class="app-inventory-head">${itTitle(`At level ${state.level}`)}${inventorySetSwitch()}</div>${itAnnotated(state)}
      ${inventoryOthers(state.level, state.now)}
      ${itTitle("To come", "is-next")}<div class="it-chips">${state.later.map(hint => `<span class="it-chip" ${itAbout(hint, state.level)}>${itAt(hint.levels[0])}${itThumb(hint)}${itName(hint)}</span>`).join("") || itNone("Nothing more to come.")}</div>`),
  },
  e2: {
    title: "E2 · The gear by level",
    text: "A column per level where the gear changes, what comes then in tiles; the columns reached lit, the level of the band a line between them, what was worn before faded.",
    draw: state => {
      const reached = state.steps.filter(step => step <= state.level);
      const column = step => `<div class="it-e2-column${step <= state.level ? " is-reached" : ""}">
          <div class="it-e2-head">${itStep(step)}</div>
          ${state.all.filter(hint => hint.levels[0] === step).map(hint => `<div class="it-e2-tile${hint.levels[1] < state.level ? " is-before" : ""}" ${itAbout(hint, state.level)}>${itThumb(hint)}<span class="it-e2-words">${itName(hint)}${itSlot(hint)}${hint.levels[1] < MAX_LEVEL ? `<span class="it-e2-until app-weak">until ${hint.levels[1]}</span>` : ""}</span></div>`).join("")}
        </div>`;
      const here = `<div class="it-e2-here"><span class="app-number">${state.level}</span></div>`;
      return itTab(state, "it-e2", `<div class="it-e2-columns">${reached.map(column).join("")}${here}${state.steps.filter(step => step > state.level).map(column).join("")}</div>`);
    },
  },
  e3: {
    title: "E3 · What comes, in the drawing",
    text: "The drawing large: on a slot that changes later, the level it changes at in a corner; an empty slot shows its item to come, faded; the hints at the level written out on the right.",
    draw: state => {
      const extra = (id, index) => {
        const hint = state.later.find(other => layoutKey(other.id, other.x) === layoutKey(id, index));
        if (!hint) return {};
        const filled = state.now.some(other => layoutKey(other.id, other.x) === layoutKey(id, index));
        return filled
          ? { html: `<span class="it-soon" ${itAbout(hint, state.level)}>${hint.levels[0]}</span>` }
          : { className: "is-ghost", html: `<span class="it-ghost" ${itAbout(hint, state.level)}>${hint.item.art ? itemArt(hint.item) : ""}<span class="it-soon">${hint.levels[0]}</span></span>` };
      };
      return itTab(state, "it-e3", `${itDrawing(state, 48, extra)}<div class="it-side">${itTitle(`Hints at level ${state.level}`)}
        ${state.now.map(hint => `<div class="it-e3-hint"><div class="it-e3-head" ${itAbout(hint, state.level)}>${itThumb(hint)}${itName(hint)}${itSlot(hint)}${itNew(hint, state.level)}</div>${itNote(hint)}</div>`).join("") || itNone("No hint at this level.")}</div>`);
    },
  },
  f1: {
    title: "F1 · In words",
    text: "The gear told as the guide would say it, a sentence per level where it changes: « At 16, a Pyrophyte Staff (weapon · I). » What is reached in full, the level of the band marked, what comes in grey.",
    draw: state => {
      const sentences = state.steps.map(step => itSentence(state, step));
      const reached = state.steps.filter(step => step <= state.level).length;
      sentences.splice(reached, 0, `<div class="it-f1-here"><span class="app-number">Level ${state.level}</span></div>`);
      return itTab(state, "it-f1", `${itDrawing(state, 32)}<div class="it-side">${sentences.join("")}</div>`);
    },
  },
  f2: {
    title: "F2 · A stash",
    text: "Every hint of the guide as in a stash of the game, each item on its own cells: what is worn at the level lit, what comes with its level, what was worn before faded.",
    draw: state => itTab(state, "it-f2", `${itTitle(`Worn at ${state.level}`)}${state.now.length ? itStash(state.now, state.level, "is-now") : itNone("No hint at this level.")}
      ${itTitle("To come", "is-next")}${state.later.length ? itStash(state.later, state.level, "is-later") : itNone("Nothing more to come.")}
      ${state.before.length ? `${itTitle("Worn before", "is-next")}${itStash(state.before, state.level, "is-before")}` : ""}`),
  },
  f3: {
    title: "F3 · The character",
    text: "The slots laid over the portrait of the ascendancy, as a sheet of a character, the lists of N1 beside it.",
    draw: state => itTab(state, "it-f3", `<div class="it-f3-figure"><img class="it-f3-portrait" src="${itPortrait(state.source)}" alt="">${itDrawing(state, 40)}</div><div class="it-side">${itLists(state)}</div>`),
  },
};

// The slot shown on the right of H1, chosen by a click on it; the level compared in H3.
ACTIONS["it-choose"] = element => { STATE.itChosen = element.dataset.cell; return true; };
ACTIONS["it-next"] = element => { STATE.itNext = Number(element.dataset.step); return true; };

// The Inventory tab at a level, of the build shown or of a case, in the variant chosen.
function inventoryTab(level = STATE.level, source) {
  const variant = INVENTORY_TAB_VARIANTS[chosen.inventoryTab] ?? INVENTORY_TAB_VARIANTS.n1;
  return `<div class="app-inventory-tab">${variant.draw(itState(level, source))}</div>`;
}
