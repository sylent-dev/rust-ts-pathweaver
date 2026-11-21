// The hints to come in the Inventory tab (2k2), under the drawing: H2 of twelve (the owner, 2026-11-21), tiles in
// two columns, the thumbnail the whole height of its tile, without its edge; its name, then its level and its
// slot; in a block of their own; nothing at all when nothing is upcoming (no title, no « nothing »: the owner, 2026-11-21). A click on one shows it in the box on the right, the one shown marked. Its heading « Upcoming » (the
// owner, 2026-11-21: « To come » too cold; « What's next », « Coming up », « Up next », « Next upgrades », a
// sentence, a rule and « Later in the build » set aside). The cases: the build shown (three to come at 59) and
// an Amazon at 40 (seventeen, all at 65).

// What a click shows: the hint, in the box; the one shown marked.
const laterPick = (hint, shown) => `data-action="it-choose" data-pick="${hintKey(hint)}"${shown && hintKey(hint) === hintKey(shown) ? ' data-shown=""' : ""}`;

// The hints to come under the drawing: its heading, then the tiles.
function inventoryLater(state, shown) {
  if (!state.later.length) return "";
  return `<div class="up graph-paper">${itTitle("Upcoming", "is-next")}<div class="up-tiles">${state.later.map(hint =>
    `<div class="up-tile" ${laterPick(hint, shown)}>${itThumb(hint)}<span class="up-words">${itName(hint)}<span class="up-sub"><b>${hint.levels[0]}</b> · ${escapeHtml(hint.label)}</span></span></div>`).join("")}</div></div>`;
}
