// Twelve layouts of the window of what changes (2g3, the owner, 2026-11-19), three at each of four
// temperatures: normal, high, explosive, free. Each draws the same changes, read from
// tools/make-data.py (BUILDS.changes), on the case chosen in the tabs at the top (VARIANTS.changesCase):
// a respec, the swap of a leveling build to its end, or the build of the page at its level. The +
// stays, since things also go (the owner, 2026-11-19). Removed once one is kept (2g4).

// The changes of a level as one list, each with its category and its sign, so that every layout
// sorts them its own way.
const CHANGE_CATEGORIES = { skill: "Skills", support: "Supports", passives: "Passives", gear: "Gear", note: "Notes" };
const PASSIVE_GROUPS = { taken: "", set1: "of weapon set I", set2: "of weapon set II", ascendancy: "of the ascendancy" };

function changeList(record) {
  if (!record) return [];
  const { skills, supports, passives, gear, notes } = record;
  // An item without the base its author wrote after its name, and the one it replaces.
  const item = entry => ({ ...entry, name: withoutBase(entry.item), before: entry.before && withoutBase(entry.before) });
  return [
    ...skills.added.map(skill => ({ category: "skill", sign: "+", ...skill })),
    ...skills.removed.map(skill => ({ category: "skill", sign: "−", ...skill, supports: [] })),
    ...supports.added.map(support => ({ category: "support", sign: "+", ...support })),
    ...supports.removed.map(support => ({ category: "support", sign: "−", ...support })),
    ...Object.entries(PASSIVE_GROUPS).filter(([group]) => passives[group] > 0)
      .map(([group, label]) => ({ category: "passives", sign: "+", count: passives[group], label })),
    ...(passives.givenBack > 0 ? [{ category: "passives", sign: "−", count: passives.givenBack, label: "given back" }] : []),
    ...gear.added.map(entry => ({ category: "gear", sign: "+", ...item(entry) })),
    ...gear.replaced.map(entry => ({ category: "gear", sign: "⇄", ...item(entry) })),
    ...gear.removed.map(entry => ({ category: "gear", sign: "−", ...item(entry) })),
    ...notes.map(entry => ({ category: "note", sign: "note", ...entry, name: entry.kind === "gear" ? withoutBase(entry.name) : entry.name })),
  ];
}
const byCategory = list => Object.keys(CHANGE_CATEGORIES)
  .map(category => [category, list.filter(change => change.category === category)]).filter(([, changes]) => changes.length > 0);

// The words of a change: its name, and what it hangs on, in grey.
const slotName = id => escapeHtml(SLOT_NAMES[id] ?? id);
// The kind of a change, for its colour (C1 to C4 at the top of the page).
const CHANGE_KINDS = { "+": "is-added", "⇄": "is-swapped", "−": "is-gone", note: "is-note" };
const changeClass = change => CHANGE_KINDS[change.sign];
const uniqueTag = change => change.unique ? ' <span class="app-changes-tag">unique</span>' : "";
function changeName(change) {
  if (change.category === "passives") return `<b>${plural(change.count, "passive")}</b>${change.label && change.sign === "+" ? ` ${change.label}` : ""}`;
  if (change.category === "skill" || change.category === "support") return `${gemMark(change.colour, change.category)}<b>${escapeHtml(change.name)}</b>${noteMark(change.note)}`;
  if (change.category === "gear") return `<b>${escapeHtml(change.name || "a hint")}</b>${uniqueTag(change)}`;
  return `<b>${escapeHtml(change.name)}</b>`;
}
function changeDetail(change) {
  if (change.category === "skill") return change.supports.length > 0 ? `with ${change.supports.map(s => `${gemMark(s.colour, "support")}${escapeHtml(s.name)}`).join(", ")}` : "";
  if (change.category === "support") return `${change.sign === "−" ? "off" : "on"} ${escapeHtml(change.skill)}`;
  if (change.category === "passives") return change.sign === "−" ? "given back" : "";
  if (change.category === "gear") return `${slotName(change.slot)}${change.sign === "⇄" ? ` · for ${escapeHtml(change.before || "a hint")}` : ""}`;
  return change.kind === "gear" ? `${slotName(change.on)} · new text` : change.kind === "support" ? `on ${escapeHtml(change.on)} · new note` : "new note";
}
const signOf = change => change.sign === "note" ? icon(12, ICONS.note) : change.sign;
const isGone = change => change.sign === "−";
const nothingHere = level => `<p class="app-wv-nothing">Nothing changes at ${level}.</p>`;

// Where a click on a row leads (the owner, 2026-11-19): the tab that shows the change.
const leadsTo = change => change.category === "passives" ? "Tree"
  : change.category === "gear" || (change.category === "note" && change.kind === "gear") ? "Inventory" : "Skills";

// W1 · normal: one line each, a tag for its category, as dense as the list can be.
function changesW1(list, level, record) {
  return `<p class="app-wv-head">${plural(record?.count ?? 0, "change")} at ${level}</p>
    <ul class="app-wv-lines app-wv-links">${list.map(change => `<li class="${changeClass(change)}" title="Show it in ${leadsTo(change)}"><span class="app-wv-sign">${signOf(change)}</span>
      <span class="app-wv-tag">${CHANGE_CATEGORIES[change.category].replace(/s$/, "")}</span><span class="app-wv-name">${changeName(change)}</span>
      <span class="app-wv-detail">${change.category === "skill" ? "" : changeDetail(change)}</span><span class="app-wv-leads">${leadsTo(change)} →</span></li>`).join("") || nothingHere(level)}</ul>`;
}

// W2 · normal: what comes, what is replaced, what goes, one under the other: the title says the sign.
function changesW2(list, level) {
  const block = (title, changes) => changes.length === 0 ? "" : `<section class="app-wv-block"><h3 class="app-changes-title">${title}<span>${changes.length}</span></h3>
    <ul>${changes.map(change => `<li class="${isGone(change) ? "is-gone" : ""}"><span class="app-wv-name">${changeName(change)}</span> <span class="app-wv-detail">${changeDetail(change)}</span></li>`).join("")}</ul></section>`;
  return list.length === 0 ? nothingHere(level) : [
    block("+ Comes", list.filter(change => change.sign === "+")),
    block("⇄ Replaced", list.filter(change => change.sign === "⇄")),
    block("− Goes", list.filter(isGone)),
    block("Notes", list.filter(change => change.sign === "note")),
  ].join("");
}

// W3 · normal: the category in a column on the left; the supports under the skill they join.
function changesW3(list, level) {
  const rows = changes => changes.map(change => `<li class="${changeClass(change)}"><span class="app-wv-sign">${signOf(change)}</span><span>${changeName(change)} <span class="app-wv-detail">${changeDetail(change)}</span></span></li>`).join("");
  const supportsBySkill = changes => Object.entries(Object.groupBy(changes, change => change.skill)).map(([skill, supports]) =>
    `<li class="app-wv-skill"><span class="app-wv-sign"></span><span>${escapeHtml(skill)}</span></li>${supports.map(change =>
      `<li class="app-wv-under ${changeClass(change)}"><span class="app-wv-sign">${change.sign}</span><span>${gemMark(change.colour, "support")}${escapeHtml(change.name)}${noteMark(change.note)}</span></li>`).join("")}`).join("");
  return list.length === 0 ? nothingHere(level) : `<dl class="app-wv-gutter">${byCategory(list).map(([category, changes]) =>
    `<dt>${CHANGE_CATEGORIES[category]}<span>${changes.length}</span></dt><dd><ul>${category === "support" ? supportsBySkill(changes) : rows(changes)}</ul></dd>`).join("")}</dl>`;
}

// W4 · high: two columns, what comes and what goes; a replaced piece on one row, the new on the
// left, the old on the right.
function changesW4(list, level) {
  const cell = (change, side) => change ? `<span class="app-wv-cell ${side}">${side === "is-before" ? `<b>${escapeHtml(change.before || "a hint")}</b>` : changeName(change)} <span class="app-wv-detail">${
    change.sign === "⇄" ? slotName(change.slot) : changeDetail(change)}</span></span>` : '<span class="app-wv-cell"></span>';
  const rows = byCategory(list.filter(change => change.sign !== "note")).map(([category, changes]) => {
    const pairs = [
      ...changes.filter(change => change.sign === "⇄").map(change => [cell(change, "is-after"), "⇄", cell(change, "is-before")]),
      ...changes.filter(change => change.sign === "+").map(change => [cell(change), "", cell()]),
      ...changes.filter(isGone).map(change => [cell(), "", cell(change, "is-gone")]),
    ];
    return `<h3 class="app-changes-title">${CHANGE_CATEGORIES[category]}</h3>${pairs.map(([left, swap, right]) => `<div class="app-wv-pair">${left}<span class="app-wv-swap">${swap}</span>${right}</div>`).join("")}`;
  }).join("");
  const notes = list.filter(change => change.sign === "note");
  return list.length === 0 ? nothingHere(level) : `<div class="app-wv-pair app-wv-columns"><span>+ Comes</span><span></span><span>− Goes</span></div>${rows}${
    notes.length > 0 ? `<p class="app-changes-foot">${noteMark(true)}${notes.map(change => escapeHtml(change.name)).join(", ")}: new notes</p>` : ""}`;
}

// W5 · high: a line of counts per category, each opening its list under it.
STATE.changesW5 = "gear";
ACTIONS["changes-w5"] = element => { STATE.changesW5 = STATE.changesW5 === element.dataset.category ? "" : element.dataset.category; return true; };
function changesW5(list, level) {
  const counts = changes => ["+", "⇄", "−", "note"].map(sign => [sign, changes.filter(change => change.sign === sign)
    .reduce((sum, change) => sum + (change.count ?? 1), 0)]).filter(([, count]) => count > 0);
  const groups = byCategory(list);
  const open = groups.find(([category]) => category === STATE.changesW5) ?? (STATE.changesW5 === "" ? undefined : groups[0]);
  return list.length === 0 ? nothingHere(level) : `<div class="app-wv-counts">${groups.map(([category, changes]) =>
    `<button type="button" class="app-wv-count ${open?.[0] === category ? "is-open" : ""}" data-action="changes-w5" data-category="${category}">
      <span class="app-wv-figures">${counts(changes).map(([sign, count]) => `<span class="${sign === "−" ? "is-gone" : ""}">${sign === "note" ? "" : sign}${count}</span>`).join("")}</span>
      <span class="app-wv-label">${CHANGE_CATEGORIES[category]}</span></button>`).join("")}</div>
    ${open ? `<ul class="app-wv-lines">${open[1].map(change => `<li class="${isGone(change) ? "is-gone" : ""}"><span class="app-wv-sign">${signOf(change)}</span><span class="app-wv-name">${changeName(change)}</span><span class="app-wv-detail">${changeDetail(change)}</span></li>`).join("")}</ul>` : ""}`;
}

// W6 · high: its own ◀ ▶ at its top, so that the build is read from marker to marker in the window.
function changesW6(list, level, record, key) {
  const step = (direction, target) => `<button type="button" class="app-wv-step" data-action="level-go" data-level="${target ?? ""}" ${target === undefined ? "disabled" : ""}>${direction === "previous" ? icon(14, ICONS.previous) : ""}<span>${target ?? "–"}</span>${direction === "next" ? icon(14, ICONS.next) : ""}</button>`;
  return `<div class="app-wv-nav">${step("previous", markerBeside(key, level, "previous"))}<span class="app-wv-here"><b>Level ${level}</b>${plural(record?.count ?? 0, "change")}</span>${step("next", markerBeside(key, level, "next"))}</div>
    ${list.length === 0 ? nothingHere(level) : byCategory(list).map(([category, changes]) => `<section class="app-changes-part"><h3 class="app-changes-title">${CHANGE_CATEGORIES[category]}<span>${changes.length}</span></h3>
      <ul>${changes.map(change => `<li class="app-changes-row ${isGone(change) ? "is-removed" : ""}"><span class="app-changes-sign">${signOf(change)}</span><span class="app-changes-body">${changeName(change)} <span class="app-wv-detail">${changeDetail(change)}</span></span></li>`).join("")}</ul></section>`).join("")}`;
}

// W7 · explosive: a tile per category, its big count over its list.
function changesW7(list, level) {
  const total = changes => changes.reduce((sum, change) => sum + (change.count ?? 1), 0);
  return list.length === 0 ? nothingHere(level) : `<div class="app-wv-tiles">${byCategory(list).map(([category, changes]) => {
    const comes = total(changes.filter(change => change.sign !== "−"));
    const goes = total(changes.filter(isGone));
    return `<section class="app-wv-tile"><p class="app-wv-big">${comes > 0 ? `<span>${category === "note" ? "" : "+"}${comes}</span>` : ""}${goes > 0 ? `<span class="is-gone">−${goes}</span>` : ""}</p>
      <h3 class="app-changes-title">${CHANGE_CATEGORIES[category]}</h3>
      <ul>${changes.map(change => `<li class="${isGone(change) ? "is-gone" : ""}">${change.category === "passives" ? `${change.sign} ${change.count} ${change.label || "passives"}` : `${change.sign === "⇄" ? "⇄ " : ""}${changeName(change)}`}</li>`).join("")}</ul></section>`;
  }).join("")}</div>`;
}

// W8 · explosive: a diff, a line per change, a replaced piece as the old line and the new.
function changesW8(list, level) {
  const line = (sign, body, detail) => `<li class="app-wv-diff-${sign === "+" ? "plus" : sign === "−" ? "minus" : "note"}"><span class="app-wv-sign">${sign === "note" ? icon(12, ICONS.note) : sign}</span><span class="app-wv-name">${body}</span><span class="app-wv-detail">${detail}</span></li>`;
  return list.length === 0 ? nothingHere(level) : byCategory(list).map(([category, changes]) => `<p class="app-wv-hunk">@@ ${CHANGE_CATEGORIES[category].toLowerCase()} @@</p><ul class="app-wv-diff">${changes.map(change =>
    change.sign === "⇄"
      ? line("−", `<b>${escapeHtml(change.before || "a hint")}</b>`, slotName(change.slot)) + line("+", changeName(change), slotName(change.slot))
      : line(change.sign, changeName(change), changeDetail(change))).join("")}</ul>`).join("");
}

// W9 · explosive: a drawer the width of the band, the categories side by side.
function changesW9(list, level, record) {
  return list.length === 0 ? nothingHere(level) : `<div class="app-wv-drawer"><p class="app-wv-drawer-head"><b>Level ${level}</b>${plural(record.count, "change")}</p>${byCategory(list).map(([category, changes]) =>
    `<section><h3 class="app-changes-title">${CHANGE_CATEGORIES[category]}<span>${changes.length}</span></h3><ul>${changes.map(change =>
      `<li class="${isGone(change) ? "is-gone" : ""}"><span class="app-wv-sign">${signOf(change)}</span><span>${changeName(change)}<span class="app-wv-detail">${changeDetail(change)}</span></span></li>`).join("")}</ul></section>`).join("")}</div>`;
}

// W10 · free: the changes told in sentences, the names in white.
function changesW10(list, level) {
  const names = changes => {
    const items = changes.map(change => `<b>${escapeHtml(change.name || "a hint")}</b>`);
    return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
  };
  const pick = (category, sign) => list.filter(change => change.category === category && change.sign === sign);
  const passives = list.filter(change => change.category === "passives");
  const taken = passives.filter(change => change.sign === "+");
  const sentences = [
    ...pick("skill", "+").map(skill => `${gemMark(skill.colour)}<b>${escapeHtml(skill.name)}</b> comes${skill.supports.length > 0 ? `, with ${names(skill.supports)}` : ""}.`),
    pick("skill", "−").length > 0 ? `${names(pick("skill", "−"))} ${pick("skill", "−").length === 1 ? "goes" : "go"}.` : "",
    ...Object.entries(Object.groupBy(pick("support", "+"), change => change.skill)).map(([skill, supports]) => `<b>${escapeHtml(skill)}</b> takes ${names(supports)}.`),
    ...Object.entries(Object.groupBy(pick("support", "−"), change => change.skill)).map(([skill, supports]) => `<b>${escapeHtml(skill)}</b> drops ${names(supports)}.`),
    passives.length > 0 ? `${passives.some(isGone) ? `The tree gives back <b>${passives.find(isGone).count}</b> passives${taken.length > 0 ? " and takes " : "."}` : "The tree takes "}${
      taken.map(change => `<b>${change.count}</b>${change.label ? ` ${change.label}` : ""}`).join(", ")}${taken.length > 0 ? "." : ""}` : "",
    ...pick("gear", "⇄").map(change => `On the ${slotName(change.slot).toLowerCase()}, <b>${escapeHtml(change.name)}</b> replaces ${escapeHtml(change.before || "a hint")}.`),
    pick("gear", "+").length > 0 ? `In comes ${names(pick("gear", "+"))}.` : "",
    pick("gear", "−").length > 0 ? `Out goes ${names(pick("gear", "−"))}.` : "",
    pick("note", "note").length > 0 ? `${icon(12, ICONS.note)} New words on ${names(pick("note", "note"))}.` : "",
  ].filter(Boolean);
  return sentences.length === 0 ? nothingHere(level) : `<p class="app-wv-kicker">At level ${level}</p>${sentences.map(sentence => `<p class="app-wv-sentence">${sentence}</p>`).join("")}`;
}

// W11 · free: a receipt, dotted leaders from the name to where it goes, the total at its foot.
function changesW11(list, level, record) {
  const name = change => change.category === "passives" ? `${change.count} passives${change.label && change.sign === "+" ? ` ${change.label.replace("of the ", "")}` : ""}` : escapeHtml(change.name || "a hint");
  const where = change => change.category === "gear" ? slotName(change.slot) : change.category === "support" ? escapeHtml(change.skill) : change.category === "note" ? "note" : CHANGE_CATEGORIES[change.category].replace(/s$/, "").toLowerCase();
  return `<p class="app-wv-receipt-head">PATHWEAVER<br>LEVEL ${level}</p>${list.length === 0 ? nothingHere(level) : byCategory(list).map(([category, changes]) =>
    `<p class="app-wv-receipt-rule">${CHANGE_CATEGORIES[category].toUpperCase()}</p><ul>${changes.map(change =>
      `<li class="${isGone(change) ? "is-gone" : ""}"><span>${change.sign === "note" ? "✎" : change.sign} ${name(change)}</span><i></i><span>${where(change)}</span></li>`).join("")}</ul>`).join("")}
    <p class="app-wv-receipt-total"><span>TOTAL</span><i></i><span>${plural(record?.count ?? 0, "CHANGE", "CHANGES")}</span></p>`;
}

// W12 · free: the gear on the slots of a character, as the game lays them out, the rest beside it.
const DOLL_SLOTS = { Weapon1: "wpn", Trinket1: "trk", Helm1: "helm", Offhand1: "off", Ring1: "rng1", BodyArmour1: "body", Amulet1: "amu",
  Gloves1: "glo", Ring2: "rng2", Boots1: "boo", Weapon2: "wpn2", Flask1: "fla", Flask2: "fla", Belt1: "belt", Charm1: "cha", Offhand2: "off2" };
function changesW12(list, level) {
  const gear = list.filter(change => change.category === "gear" || (change.category === "note" && change.kind === "gear"));
  const onSlot = area => gear.filter(change => DOLL_SLOTS[change.slot ?? change.on] === area);
  const cell = (area, label) => {
    const changes = onSlot(area);
    const sign = changes.some(change => change.sign === "⇄") ? "⇄" : changes.some(change => change.sign === "+") ? "+" : changes.some(isGone) ? "−" : changes.length > 0 ? "✎" : "";
    return `<span class="app-wv-slot ${changes.length > 0 ? "is-changed" : ""}" style="grid-area:${area}" title="${escapeHtml(changes.map(change => change.name).join(", "))}">${sign ? `<b>${sign}${changes.length > 1 ? changes.length : ""}</b>` : ""}<span>${label}</span></span>`;
  };
  const rest = list.filter(change => !gear.includes(change));
  return list.length === 0 ? nothingHere(level) : `<div class="app-wv-doll-row"><div class="app-wv-doll">${[["wpn", "Weapon"], ["trk", "Trinket"], ["helm", "Helmet"], ["off", "Offhand"],
    ["rng1", "Ring"], ["body", "Body"], ["amu", "Amulet"], ["glo", "Gloves"], ["rng2", "Ring"], ["boo", "Boots"], ["wpn2", "Weapon II"], ["fla", "Flasks"],
    ["belt", "Belt"], ["cha", "Charms"], ["off2", "Offhand II"]].map(([area, label]) => cell(area, label)).join("")}</div>
    <ul class="app-wv-lines">${gear.map(change => `<li class="${isGone(change) ? "is-gone" : ""}"><span class="app-wv-sign">${signOf(change)}</span><span class="app-wv-name">${changeName(change)}</span></li>`).join("") || '<li class="app-wv-detail">No gear changes</li>'}</ul></div>
    ${rest.length > 0 ? `<ul class="app-wv-lines app-wv-doll-rest">${rest.map(change => `<li class="${isGone(change) ? "is-gone" : ""}"><span class="app-wv-sign">${signOf(change)}</span><span class="app-wv-name">${changeName(change)}</span><span class="app-wv-detail">${changeDetail(change)}</span></li>`).join("")}</ul>` : ""}`;
}

// The twelve, numbered once: [temperature, what it tries, the layout, the width of its case].
const CHANGES_VARIANTS = [
  ["Normal", "one line each, a tag for its category", changesW1, 640],
  ["Normal", "what comes, what is replaced, what goes, one under the other", changesW2, 640],
  ["Normal", "the category in a column on the left, the supports under their skill", changesW3, 640],
  ["High", "two columns, what comes and what goes, a replaced piece on one row", changesW4, 760],
  ["High", "a line of counts per category, a click opens its list", changesW5, 640],
  ["High", "its own ◀ ▶ at its top, from marker to marker", changesW6, 640],
  ["Explosive", "a tile per category, its big count over its list", changesW7, 760],
  ["Explosive", "a diff, the old line and the new", changesW8, 640],
  ["Explosive", "a drawer the width of the band, the categories side by side", changesW9, 960],
  ["Free", "the changes told in sentences", changesW10, 640],
  ["Free", "a receipt, its total at its foot", changesW11, 640],
  ["Free", "the gear on the slots of a character", changesW12, 760],
];
