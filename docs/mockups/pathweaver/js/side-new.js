// « New at N », the box at the top of the right column of the Overview: what is new at the level.

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

// Twelve variants of the box (2j, the owner asked to see them first), three at each of four
// temperatures: normal, high, explosive, free. The box says what the window of « N changes » says
// too: each variant reads the same changes (BUILDS.changes, changeList of js/level-changes.js), and
// one of them goes without the box. Removed once one is kept.

// What is new at a level of a build: its record and its changes as one list, empty when nothing
// changes there.
function newAt(key, level) {
  const record = BUILDS.changes[key].levels[level];
  return { key, level, record, list: record ? changeList(record) : [] };
}
// The lines a box shows before « and N more », which opens the window of « N changes ».
const NEW_LINES = 6;
const moreLink = (list, shown = NEW_LINES) => list.length > shown
  ? `<button type="button" class="app-sn-more" title="Opens the window of « N changes »">and ${list.length - shown} more</button>` : "";

// A line of the window (W1): its sign, its category, its name and what it hangs on, a link to its
// tab; `category: false` leaves its category out.
const newLine = (change, { category = true } = {}) => `<li class="${CHANGE_KINDS[change.sign]}" data-action="changes-go" data-tab="${changeTab(change)}" title="Show it in ${CHANGE_TABS[changeTab(change)]}">
  <span class="app-changes-sign">${changeSign(change)}</span>${category ? `<span class="app-changes-category">${CHANGE_CATEGORIES[change.category]}</span>` : ""}
  <span class="app-changes-name">${changeName(change)}</span>
  <span class="app-changes-right"><span class="app-changes-leads">${CHANGE_TABS[changeTab(change)]}</span><span class="app-changes-detail">${changeDetail(change)}</span></span></li>`;
const newLines = (list, options, shown = NEW_LINES) => `<ul class="app-changes-lines app-sn-lines">${list.slice(0, shown).map(change => newLine(change, options)).join("")}</ul>${moreLink(list, shown)}`;

// The markers of the build around a level, for the variants that move to them.
const markerAround = (key, level, direction) => {
  const all = markers(key);
  return direction === "previous" ? all.filter(marker => marker < level).at(-1) : all.find(marker => marker > level);
};
const goButton = (key, target, words) => target === undefined ? ""
  : `<button type="button" class="app-sn-go" data-action="side-new-go" data-key="${key}" data-level="${target}">${words}</button>`;
ACTIONS["side-new-go"] = element => {
  if (element.dataset.key !== "shown") return false;   // the other builds show one level
  setBandLevel("shown", Number(element.dataset.level));
  return true;
};
STATE.sideNewOpen = {};
ACTIONS["side-new-fold"] = element => {
  STATE.sideNewOpen[element.dataset.case] = !STATE.sideNewOpen[element.dataset.case];
  return true;
};

// The counts of a level by the tab that shows them: the skills, the tree, the inventory.
function countsByTab(list) {
  const counts = { skills: { "+": 0, "⇄": 0, "−": 0, note: 0 }, tree: { "+": 0, "⇄": 0, "−": 0, note: 0 }, inventory: { "+": 0, "⇄": 0, "−": 0, note: 0 } };
  for (const change of list) counts[changeTab(change)][change.sign] += change.category === "passives" ? change.count : 1;
  return counts;
}

// The changes of a level said as a sentence, one clause per category.
function newSentence({ record, list }) {
  if (!record) return "";
  const names = items => items.map(item => `<b>${escapeHtml(item.name)}</b>`);
  const and = words => words.length <= 1 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
  const { skills, supports, passives, gear, notes } = record;
  const taken = passives.taken + passives.set1 + passives.set2 + passives.ascendancy;
  const bySupport = Object.groupBy(supports.added, support => support.name);
  const clauses = [
    skills.added.length > 0 ? `${and(skills.added.map(skill => `<b>${escapeHtml(skill.name)}</b>${skill.supports.length > 0 ? ` with ${plural(skill.supports.length, "support")}` : ""}`))} ${skills.added.length === 1 ? "comes" : "come"}` : "",
    skills.removed.length > 0 ? `${and(names(skills.removed))} ${skills.removed.length === 1 ? "goes" : "go"}` : "",
    ...Object.entries(bySupport).map(([name, on]) => `<b>${escapeHtml(name)}</b> goes on ${and(on.map(support => escapeHtml(support.skill)))}`),
    supports.removed.length > 0 ? `${and(names(supports.removed))} ${supports.removed.length === 1 ? "comes off" : "come off"}` : "",
    taken > 0 ? `${plural(taken, "passive")} ${taken === 1 ? "is" : "are"} taken` : "",
    passives.givenBack > 0 ? `${passives.givenBack} given back` : "",
    gear.added.length === 1 ? `<b>${escapeHtml(withoutBase(gear.added[0].item))}</b> comes in the ${slotName(gear.added[0].slot).toLowerCase()}` : gear.added.length > 1 ? `${gear.added.length} items come` : "",
    gear.replaced.length > 0 ? `${plural(gear.replaced.length, "item")} ${gear.replaced.length === 1 ? "replaces another" : "replace others"}` : "",
    gear.removed.length > 0 ? `${plural(gear.removed.length, "item")} ${gear.removed.length === 1 ? "goes" : "go"}` : "",
    notes.length > 0 ? `${plural(notes.length, "note")} of the author ${notes.length === 1 ? "changes" : "change"}` : "",
  ].filter(Boolean);
  return `${and(clauses)}.`;
}

const SIDE_NEW_VARIANTS = {
  // Normal: close to what the page has.
  N1: { title: "N1 · The window, in the column", text: "The box as now, its lines those of the window: sign, category, name, detail; six, then « and N more ».",
    box: ({ level, list }) => list.length === 0
      ? `<div class="app-sn-box is-empty">Nothing new at ${level}</div>`
      : `<div class="app-sn-box"><p class="app-sn-head">New at ${level}</p>${newLines(list)}</div>` },
  N2: { title: "N2 · Without a box", text: "A title like Skills and Inventory, the lines under it on the column, without frame nor category.",
    box: ({ level, list }) => list.length === 0
      ? `<h2 class="app-side-title app-title app-sn-plain-title is-empty">Nothing new at ${level}</h2>`
      : `<h2 class="app-side-title app-title app-sn-plain-title">New at ${level}</h2>${newLines(list, { category: false })}` },
  N3: { title: "N3 · No box", text: "The column starts at Skills: « N changes » in the band says what is new, the rows mark it in place.",
    box: () => "" },
  // High: the box takes a role of its own.
  H1: { title: "H1 · Counts by tab", text: "Where to look rather than what: a tile per tab, the count of its changes, a click shows the tab.",
    box: ({ level, list }) => {
      const counts = countsByTab(list);
      const tile = (tab, label) => {
        const c = counts[tab];
        // What comes or replaces another, large; what goes only in the detail under it (a respec gives 42 back).
        const total = c["+"] + c["⇄"] + c.note;
        const parts = [["+", "is-added"], ["⇄", "is-swapped"], ["−", "is-gone"]].filter(([sign]) => c[sign] > 0)
          .map(([sign, kind]) => `<span class="${kind}"><span class="app-changes-sign">${sign}</span>${c[sign]}</span>`).join("");
        return `<button type="button" class="app-sn-tile ${total + c["−"] === 0 ? "is-empty" : ""}" data-action="changes-go" data-tab="${tab}"><span class="app-sn-tile-label">${label}</span><span class="app-sn-tile-count app-number">${total}</span><span class="app-sn-tile-parts app-number">${parts || "&nbsp;"}</span></button>`;
      };
      return `<p class="app-sn-head ${list.length === 0 ? "is-empty" : ""}">${list.length === 0 ? "Nothing new" : "New"} at ${level}</p><div class="app-sn-tiles">${tile("skills", "Skills")}${tile("tree", "Passives")}${tile("inventory", "Gear")}</div>`;
    } },
  H2: { title: "H2 · The gems first", text: "The gems that come or go as marks of 16 px with their names; the passives and the gear in one line under them.",
    box: ({ level, list }) => {
      const gems = list.filter(change => change.category === "skill" || change.category === "support");
      const counts = countsByTab(list);
      const rest = [
        counts.tree["+"] > 0 ? `<span class="is-added"><span class="app-changes-sign">+</span>${plural(counts.tree["+"], "passive")}</span>` : "",
        counts.tree["−"] > 0 ? `<span class="is-gone"><span class="app-changes-sign">−</span>${counts.tree["−"]} given back</span>` : "",
        ...[["+", "is-added"], ["⇄", "is-swapped"], ["−", "is-gone"]].filter(([sign]) => counts.inventory[sign] > 0)
          .map(([sign, kind]) => `<span class="${kind}"><span class="app-changes-sign">${sign}</span>${plural(counts.inventory[sign], "item")}</span>`),
      ].filter(Boolean).join("");
      if (list.length === 0) return `<div class="app-sn-box is-empty">Nothing new at ${level}</div>`;
      return `<div class="app-sn-box"><p class="app-sn-head">New at ${level}</p>
        ${gems.length > 0 ? `<div class="app-sn-gems">${gems.map(gem => `<span class="app-sn-gem ${gem.sign === "−" ? "is-gone" : ""}" data-action="changes-go" data-tab="skills" title="${gem.category === "support" ? `On ${escapeHtml(gem.skill)}` : plural(gem.supports.length, "support")}">${gemMark(gem.colour, gem.category)}${escapeHtml(gem.name)}</span>`).join("")}</div>` : ""}
        ${rest ? `<p class="app-sn-rest">${rest}</p>` : ""}</div>`;
    } },
  H3: { title: "H3 · Now and next", text: "What is new here, four lines, then the marker after and its count: the box leads along the guide.",
    box: ({ key, level, list }) => {
      const next = markerAround(key, level, "next");
      const previous = markerAround(key, level, "previous");
      const count = target => plural(BUILDS.changes[key].levels[target].count, "change");
      const foot = `<div class="app-sn-next">${goButton(key, previous, `◀ ${previous}`)}<span class="app-sn-next-words">${next === undefined ? "No change after" : `Next at <b>${next}</b> · ${count(next)}`}</span>${goButton(key, next, "▶")}</div>`;
      return list.length === 0
        ? `<div class="app-sn-box is-empty">Nothing new at ${level}${foot}</div>`
        : `<div class="app-sn-box"><p class="app-sn-head">New at ${level}</p>${newLines(list, {}, 4)}${foot}</div>`;
    } },
  // Explosive: the box as the loudest thing of the column.
  E1: { title: "E1 · A slab of the accent", text: "The accent filled, the level in Archivo 800 on the left, the lines on it in the dark of the page.",
    box: ({ level, list }) => `<div class="app-sn-slab ${list.length === 0 ? "is-empty" : ""}"><span class="app-sn-slab-level">${level}</span><div class="app-sn-slab-body">${list.length === 0
      ? "<p>Nothing new</p>"
      : `<p class="app-sn-slab-head">New here</p>${list.slice(0, NEW_LINES).map(change => `<p class="app-sn-slab-line">${change.sign === "note" ? "✎" : change.sign} ${changeName(change)}</p>`).join("")}${moreLink(list)}`}</div></div>` },
  E2: { title: "E2 · The count as a stamp", text: "The number of changes large, in the accent, « new at N » under it; the lines beside it without their category.",
    box: ({ level, list }) => `<div class="app-sn-stamp ${list.length === 0 ? "is-empty" : ""}"><div class="app-sn-stamp-count"><span class="app-number">${list.length === 0 ? 0 : `+${list.length}`}</span><span>new at ${level}</span></div>${list.length === 0 ? "" : `<div class="app-sn-stamp-lines">${newLines(list, { category: false }, 4)}</div>`}</div>` },
  E3: { title: "E3 · A card per change", text: "Two columns of cards, each its category, its name, its detail, an edge in the colour of its sign.",
    box: ({ level, list }) => list.length === 0
      ? `<div class="app-sn-box is-empty">Nothing new at ${level}</div>`
      : `<p class="app-sn-head">New at ${level}</p><div class="app-sn-cards">${list.slice(0, NEW_LINES).map(change =>
        `<div class="app-sn-card ${CHANGE_KINDS[change.sign]}" data-action="changes-go" data-tab="${changeTab(change)}"><span class="app-changes-category">${CHANGE_CATEGORIES[change.category]}</span><span class="app-sn-card-name">${changeName(change)}</span><span class="app-sn-card-detail">${changeDetail(change) || "&nbsp;"}</span></div>`).join("")}${list.length > NEW_LINES ? `<div class="app-sn-card is-more">+${list.length - NEW_LINES} more</div>` : ""}</div>` },
  // Free.
  F1: { title: "F1 · A sentence", text: "What changes said in words, one clause per category, the names in bold; no list, no sign.",
    box: ({ level, list, record }) => list.length === 0
      ? `<p class="app-sn-sentence is-empty"><span class="app-sn-head">At ${level}</span> nothing changes.</p>`
      : `<p class="app-sn-sentence"><span class="app-sn-head">At ${level}</span> ${newSentence({ record, list })}</p>` },
  F2: { title: "F2 · Folded", text: "One line, « 3 new at 59 ▾», that unfolds the lines of the window in place: the column keeps its room.",
    box: ({ key, level, list }, caseId) => {
      if (list.length === 0) return `<div class="app-sn-fold is-empty">Nothing new at ${level}</div>`;
      const open = STATE.sideNewOpen[caseId];
      return `<div class="app-sn-fold ${open ? "is-open" : ""}"><button type="button" class="app-sn-fold-head" data-action="side-new-fold" data-case="${caseId}" aria-expanded="${open ? "true" : "false"}">${list.length} new at ${level}<span class="app-sn-chevron">▾</span></button>${open ? newLines(list, {}, list.length) : ""}</div>`;
    } },
  F3: { title: "F3 · A timeline", text: "The markers around the level on a rail, each with its count, a click goes to it; the level here unfolds its lines.",
    box: ({ key, level, list }) => {
      const all = markers(key);
      const index = all.findIndex(marker => marker >= level);
      const at = index === -1 ? all.length : index;
      const around = all.slice(Math.max(0, at - 2), at + 2 + (all[at] === level ? 1 : 0));
      if (!around.includes(level)) around.splice(around.findIndex(marker => marker > level) === -1 ? around.length : around.findIndex(marker => marker > level), 0, level);
      return `<ol class="app-sn-rail">${around.map(marker => marker === level
        ? `<li class="is-here ${list.length === 0 ? "is-empty" : ""}"><span class="app-sn-rail-level app-number">${marker}</span><div><span class="app-sn-rail-count">${list.length === 0 ? "Nothing new here" : `${plural(list.length, "change")} here`}</span>${list.length === 0 ? "" : newLines(list, { category: false }, 4)}</div></li>`
        : `<li data-action="side-new-go" data-key="${key}" data-level="${marker}"><span class="app-sn-rail-level app-number">${marker}</span><span class="app-sn-rail-count">${plural(BUILDS.changes[key].levels[marker].count, "change")}</span></li>`).join("")}</ol>`;
    } },
};
