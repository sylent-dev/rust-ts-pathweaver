// The cards on hover (2k, the owner, 2026-11-20, from the wireframe docs/wireframes/gem-card.excalidraw),
// all in one construction (js/hover-card.js, css/hover-card.css), drawn in place as they show on hover:
// - skills: Spark, of intelligence, with a note of its author; Cast on Critical, a spirit gem new at 59,
//   with a note; Herald of Ice, of dexterity and intelligence, without a note; Orb of Storms, its nine
//   tags cut by the ellipsis (the pointer on them shows them whole);
// - supports, their icon, a disc, cut to a square: Pinpoint Critical, and Arbiter's Ignition, a lineage
//   support;
// - notes of the author: of Spark, and of Comet, the skill Cast on Critical triggers;
// - passives, without art: a notable with a note of the author, and a notable of the ascendancy;
// - slots: a unique with its stats, a base, and a unique the game data don't know;
// - a gem the game data don't know.
// The cards on hover in the windows of the page are the same (the tree, the right column, the Skills tab).

// A card drawn in place, as it shows on hover: its classes and its HTML.
const staticCard = (classes, html) => `<div class="hc-cards"><div class="app-hover ${classes} is-static">${html}</div></div>`;
const staticGemCard = (gem, level) => staticCard("app-pinned-card", gemHoverHtml(gem, level));
// A card read from the attributes of what carries it, as on hover (a mark of a note, a slot).
function fromElement(html) {
  const holder = document.createElement("div");
  holder.innerHTML = html;
  return holder.firstElementChild;
}
const staticNoteCard = note => staticCard("app-pinned-card app-note-hover", noteHoverHtml(fromElement(noteMark(note))));
const staticSlotCard = (hint, level) =>
  staticCard("app-pinned-card app-slot-hover", slotHoverHtml(fromElement(`<span ${hintAttributes(hint, hintItem(hint), level)}></span>`)));
// A support of a skill of the build shown at a level, its levels within its skill's (js/levels.js).
const supportAt = (level, skill, name) => skillsAt(level).find(entry => entry.name === skill).supports.find(gem => gem.name === name);
// The first passive of a graph the build takes, of a kind, with a note of the author when asked.
function takenPassive(graph, kind, withNote) {
  const taken = graph === TREE ? TREE.taken : TREE.ascendancyTaken;
  return taken.find(([index, , , , hint]) => TREE.kinds[graph.nodes[index][2]] === kind && (!withNote || hint >= 0));
}

addSection(() => {
  const level = 59;
  const skill = name => skillsAt(level).find(entry => entry.name === name);
  const [spark, cast, orb] = ["Spark", "Cast on Critical", "Orb of Storms"].map(skill);
  const herald = SKILL_SOURCES.dexterity(70).find(entry => entry.name === "Herald of Ice");
  const notable = takenPassive(TREE, "notable", true), ascendancy = takenPassive(TREE.ascendancy, "notable", false);
  const hint = id => SHOWN.slots.find(entry => entry.id === id && appliesAt(entry.levels, level));
  const unknownItem = unknownHints(level).find(entry => entry.unknown);
  const unknownGem = SKILL_SOURCES.unknownSample(level)[1];
  return ["The cards on hover, in one construction: the head with its title, its subtitle and its art, the body a step darker, the note of the author in the shade of the head", [
    ["Spark, with a note of its author", staticGemCard(spark, level)],
    ["Cast on Critical, a spirit gem new at 59", staticGemCard(cast, level)],
    ["Herald of Ice, of two attributes, without a note", staticGemCard(herald, 70)],
    ["Orb of Storms, its nine tags cut: the pointer on them shows them whole", staticGemCard(orb, level)],
    ["A support: Pinpoint Critical, under Cast on Critical at 59", staticGemCard(supportAt(level, "Cast on Critical", "Pinpoint Critical"), level)],
    ["A lineage support: Arbiter's Ignition, under Spark at 65", staticGemCard(supportAt(65, "Spark", "Arbiter's Ignition"), 65)],
    ["The note of the author of Spark, on its mark", staticNoteCard({ head: spark.name, text: spark.note })],
    ["The note of the author of Comet, the skill Cast on Critical triggers", staticNoteCard({ place: cast.name, head: "Comet", text: cast.supports.find(gem => gem.name === "Comet").note })],
    ["A notable of the tree, with a note of the author", staticCard("", hoverHtml(TREE, notable[0], level))],
    ["A notable of the ascendancy", staticCard("", hoverHtml(TREE.ascendancy, ascendancy[0], level))],
    ["A unique of the inventory, with its stats", staticSlotCard(hint("Gloves1"), level)],
    ["A base of the inventory", staticSlotCard(hint("Belt1"), level)],
    ["A unique the game data don't know", staticSlotCard(unknownItem, level)],
    ["A gem the game data don't know", staticGemCard(unknownGem, level)],
  ]];
});
