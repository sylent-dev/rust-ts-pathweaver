// The hints to come in the Inventory tab (2k2), under the drawing: H2 of twelve (the owner, 2026-11-21), tiles in
// two columns, the thumbnail the whole height of its tile, without its edge; its name, then its level and its
// slot. A click on one shows it in the box on the right, the one shown marked. Its heading in eight variants,
// chosen with the tabs « Heading » (VARIANTS.laterHeading, js/page.js): « To come » found too cold. The cases:
// the build shown (three to come at 59) and an Amazon at 40 (seventeen, all at 65).

const later = state => ({ count: state.later.length, next: state.later[0].levels[0], toGo: state.later[0].levels[0] - state.level });
const laterWeak = text => `<span class="up-head-weak">${text}</span>`;

const LATER_HEADINGS = {
  t1: { title: "T1 · To come", text: "As it was.",
    html: () => itTitle("To come", "is-next") },
  t2: { title: "T2 · What's next", text: "The words of a question the player asks, the same title.",
    html: () => itTitle("What's next", "is-next") },
  t3: { title: "T3 · Coming up · 17", text: "« Coming up », the number of hints after it, faded.",
    html: state => itTitle(`Coming up${laterWeak(`· ${later(state).count}`)}`, "is-next") },
  t4: { title: "T4 · Up next, its level", text: "« Up next », and at the right the level of the first, in the accent.",
    html: state => `<div class="up-head is-split">${itTitle("Up next")}<span class="up-head-level">from level ${later(state).next}</span></div>` },
  t5: { title: "T5 · In 6 levels", text: "« Next upgrades », and how many levels to go before the first, faded.",
    html: state => itTitle(`Next upgrades${laterWeak(`· in ${plural(later(state).toGo, "level")}`)}`, "is-next") },
  t6: { title: "T6 · A sentence", text: "Not a title but a sentence: « Next, at level 65 », the level in the accent.",
    html: state => `<h3 class="up-head is-sentence">Next, at level <b>${later(state).next}</b></h3>` },
  t7: { title: "T7 · A rule", text: "« What's next » small in the accent, a thin line after it to the edge of the drawing.",
    html: () => `<h3 class="up-head is-rule"><span>What's next</span></h3>` },
  t8: { title: "T8 · Later in the build", text: "The words of the author's plan, a line under them: what the build becomes.",
    html: state => `<div class="up-head is-plan">${itTitle("Later in the build")}<span class="up-head-weak">${plural(later(state).count, "change")} from level ${later(state).next}</span></div>` },
};

// What a click shows: the hint, in the box; the one shown marked.
const laterPick = (hint, shown) => `data-action="it-choose" data-pick="${hintKey(hint)}"${shown && hintKey(hint) === hintKey(shown) ? ' data-shown=""' : ""}`;

// The hints to come under the drawing: its heading, then the tiles.
function inventoryLater(state, shown) {
  if (!state.later.length) return `${itTitle("To come", "is-next")}<p class="it-none app-weak">Nothing more to come.</p>`;
  const heading = (LATER_HEADINGS[chosen.laterHeading] ?? LATER_HEADINGS.t1).html(state);
  return `<div class="up">${heading}<div class="up-tiles">${state.later.map(hint =>
    `<div class="up-tile" ${laterPick(hint, shown)}>${itThumb(hint)}<span class="up-words">${itName(hint)}<span class="up-sub"><b>${hint.levels[0]}</b> · ${escapeHtml(hint.label)}</span></span></div>`).join("")}</div></div>`;
}
