// The hints to come in the Inventory tab (2k2), under the drawing: twelve variants, three at each of four
// temperatures (normal, high, explosive, free), chosen with the tabs « To come » (VARIANTS.toCome, js/page.js).
// Every variant draws the hints that come after the level, by the level they come at, each with the hint it
// replaces on its cell; a click on one shows it in the box on the right, the one shown marked. The cases: the
// build shown (three to come at 59) and an Amazon at 40 (seventeen, all at 65).

const TO_COME = {
  n1: { title: "N1 · As it was", text: "A line per hint: its level in the accent, its thumbnail, its slot in capitals, its name." },
  n2: { title: "N2 · The words of the box", text: "Its thumbnail, its name over its slot, the tag of its weapon set, « Level 70 » at the right, as the box says it." },
  n3: { title: "N3 · By level", text: "A small title per level, « At level 80 », its hints under it without their level again." },
  h1: { title: "H1 · What it replaces", text: "Under each hint, what it takes the place of, faded, or « Body · empty until then »." },
  h2: { title: "H2 · Tiles in two columns", text: "Tiles in two columns, its level and its slot under its name: seventeen hints in nine rows." },
  h3: { title: "H3 · A timeline", text: "A line down from the level of the band, a dot per level to come with « in 11 levels », its hints beside it." },
  e1: { title: "E1 · What comes next", text: "The next level in a card, its hints large, « in 11 levels »; the later ones in short lines under it." },
  e2: { title: "E2 · Thumbnails", text: "The thumbnails alone, large, the level in their corner; the name in the tooltip and in the box at a click." },
  e3: { title: "E3 · On the drawing", text: "The level a slot changes at in its corner, the item faded in an empty slot; only what the drawing has no place for in a list." },
  f1: { title: "F1 · In words", text: "A sentence per level: « At level 80, an Ancestral Tiara (helmet) and Sekhema Sandals (boots). »" },
  f2: { title: "F2 · A countdown", text: "The levels to go, large, before each hint: « 11 levels »." },
  f3: { title: "F3 · The road ahead", text: "A ruler from the level of the band to 100, the thumbnails of each level standing at their place on it." },
};

// What a click shows: the hint, in the box; the one shown marked.
const laterPick = (hint, shown) => `data-action="it-choose" data-pick="${hintKey(hint)}"${shown && hintKey(hint) === hintKey(shown) ? ' data-shown=""' : ""}`;
const laterGroups = later => [...new Set(later.map(hint => hint.levels[0]))].map(at => [at, later.filter(hint => hint.levels[0] === at)]);
const toGo = (state, at) => plural(at - state.level, "level");
const slotWord = hint => hint.label.replace(/^\w+/, word => word.toLowerCase());
const replacedWords = hint => (hint.replaces ? `in place of ${escapeHtml(hint.replaces.item.name)}` : `${escapeHtml(hint.label)} · empty until then`);

// The variants: the HTML under the drawing.
const LATER_DRAW = {
  n1: (state, shown) => `<ul class="it-rows">${state.later.map(hint =>
    `<li class="it-row" ${laterPick(hint, shown)}>${itAt(hint.levels[0])}${itThumb(hint)}${itSlot(hint)}${itName(hint)}</li>`).join("")}</ul>`,
  n2: (state, shown) => `<ul class="it-rows">${state.later.map(hint =>
    `<li class="it-row up-n2" ${laterPick(hint, shown)}>${itThumb(hint)}<span class="up-words">${itName(hint)}<span class="up-sub">${escapeHtml(SLOT_NAMES[hint.id] ?? hint.label)}</span></span>${setTag(hint)}<span class="up-level">Level ${hint.levels[0]}</span></li>`).join("")}</ul>`,
  n3: (state, shown) => laterGroups(state.later).map(([at, hints]) => `<h4 class="up-group">At level ${at}</h4><ul class="it-rows">${hints.map(hint =>
    `<li class="it-row" ${laterPick(hint, shown)}>${itThumb(hint)}${itSlot(hint)}${itName(hint)}</li>`).join("")}</ul>`).join(""),
  h1: (state, shown) => `<ul class="it-rows">${state.later.map(hint =>
    `<li class="it-row up-h1" ${laterPick(hint, shown)}>${itAt(hint.levels[0])}${itThumb(hint)}<span class="up-words">${itName(hint)}<span class="up-sub">${replacedWords(hint)}</span></span></li>`).join("")}</ul>`,
  h2: (state, shown) => `<div class="up-tiles">${state.later.map(hint =>
    `<div class="up-tile" ${laterPick(hint, shown)}>${itThumb(hint)}<span class="up-words">${itName(hint)}<span class="up-sub"><b>${hint.levels[0]}</b> · ${escapeHtml(hint.label)}</span></span></div>`).join("")}</div>`,
  h3: (state, shown) => `<div class="up-line"><div class="up-stop is-now"><span class="up-dot"></span><span class="up-stop-level">Level ${state.level}</span><span class="up-sub">now</span></div>
    ${laterGroups(state.later).map(([at, hints], index) => `<div class="up-stop${index === 0 ? " is-next" : ""}"><span class="up-dot"></span><span class="up-stop-level">Level ${at}</span><span class="up-sub">in ${toGo(state, at)}</span>
      <ul class="it-rows">${hints.map(hint => `<li class="it-row" ${laterPick(hint, shown)}>${itThumb(hint)}${itName(hint)}</li>`).join("")}</ul></div>`).join("")}</div>`,
  e1: (state, shown) => {
    const [[at, hints], ...rest] = laterGroups(state.later);
    return `<div class="up-next"><div class="up-next-head"><span>Next · level ${at}</span><span class="up-sub">in ${toGo(state, at)}</span></div>
      ${hints.map(hint => `<div class="up-next-item" ${laterPick(hint, shown)}>${itThumb(hint)}<span class="up-words">${itName(hint)}<span class="up-sub">${escapeHtml(hint.label)}</span></span></div>`).join("")}</div>
      ${rest.length ? `<ul class="it-rows up-after">${rest.flatMap(([, group]) => group).map(hint =>
        `<li class="it-row" ${laterPick(hint, shown)}>${itAt(hint.levels[0])}${itName(hint)}</li>`).join("")}</ul>` : ""}`;
  },
  e2: (state, shown) => `<div class="up-thumbs">${state.later.map(hint =>
    `<span class="up-thumb" ${laterPick(hint, shown)} title="${escapeHtml(`${hint.item.name} · ${hint.label} · level ${hint.levels[0]}`)}">${itThumb(hint)}<span class="up-badge">${hint.levels[0]}</span></span>`).join("")}</div>`,
  e3: (state, shown) => {
    const off = state.later.filter(hint => !laterOnDrawing(hint));
    return `<p class="up-legend app-weak">The number on a slot: the level its next hint comes at.</p>
      ${off.length ? `<ul class="it-rows">${off.map(hint => `<li class="it-row" ${laterPick(hint, shown)}>${itAt(hint.levels[0])}${itThumb(hint)}${itSlot(hint)}${itName(hint)}</li>`).join("")}</ul>` : ""}`;
  },
  f1: (state, shown) => laterGroups(state.later).map(([at, hints]) => {
    const words = hints.map(hint => `<span class="up-word" ${laterPick(hint, shown)}>${itName(hint)}</span> <span class="app-weak">(${escapeHtml(slotWord(hint))}${hint.replaces ? `, in place of ${escapeHtml(hint.replaces.item.name)}` : ""})</span>`);
    return `<p class="up-sentence"><b>At level ${at}</b>, ${words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words.at(-1)}` : words[0]}.</p>`;
  }).join(""),
  f2: (state, shown) => `<ul class="it-rows">${state.later.map(hint =>
    `<li class="it-row up-f2" ${laterPick(hint, shown)}><span class="up-count app-number">${hint.levels[0] - state.level}<small>${hint.levels[0] - state.level === 1 ? "level" : "levels"}</small></span>${itThumb(hint)}<span class="up-words">${itName(hint)}<span class="up-sub">${escapeHtml(hint.label)} · level ${hint.levels[0]}</span></span></li>`).join("")}</ul>`,
  f3: (state, shown) => {
    const span = Math.max(1, MAX_LEVEL - state.level);
    const x = at => ((at - state.level) / span) * 100;
    return `<div class="up-road">${laterGroups(state.later).map(([at, hints]) =>
      `<div class="up-road-stack" style="left:${x(at)}%">${hints.map(hint => `<span class="up-thumb" ${laterPick(hint, shown)} title="${escapeHtml(`${hint.item.name} · ${hint.label}`)}">${itThumb(hint)}</span>`).join("")}</div>`).join("")}
      <div class="up-ruler"><span class="up-ruler-mark is-now" style="left:0">${state.level}</span>${laterGroups(state.later).map(([at]) => `<span class="up-ruler-mark" style="left:${x(at)}%">${at}</span>`).join("")}<span class="up-ruler-mark is-end" style="left:100%">100</span></div></div>`;
  },
};

// E3: a hint to come on a slot of the drawing, for the weapon set shown.
const laterOnDrawing = hint => inLayout(hint.id) && slotSet(hint.id) !== otherSet(STATE.inventorySet);
function laterOnSlot(state, id, x) {
  if (chosen.toCome !== "e3") return {};
  const hint = state.later.find(other => other.id === id && other.x === x);
  if (!hint) return {};
  const badge = `<span class="up-soon" data-action="it-choose" data-pick="${hintKey(hint)}" title="${escapeHtml(`${hint.item.name} · level ${hint.levels[0]}`)}">${hint.levels[0]}</span>`;
  const empty = !state.now.some(other => other.id === id && other.x === x);
  return empty ? { className: "up-ghost-slot", html: `${hint.item.art ? `<span class="up-ghost">${itemArt(hint.item)}</span>` : ""}${badge}` } : { html: badge };
}

// The hints to come under the drawing, in the variant chosen.
function inventoryLater(state, shown) {
  if (!state.later.length) return `${itTitle("To come", "is-next")}<p class="it-none app-weak">Nothing more to come.</p>`;
  const draw = LATER_DRAW[chosen.toCome] ?? LATER_DRAW.n1;
  return `<div class="up up-${chosen.toCome}">${itTitle("To come", "is-next")}${draw(state, shown)}</div>`;
}
