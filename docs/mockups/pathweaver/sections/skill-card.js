// The card of a skill (2k, the owner, 2026-11-20, from the wireframe docs/wireframes/gem-card.excalidraw):
// its head in the deep shade with the icon in its right corner, its body a step darker, the note of its
// author in the shade of the head. Drawn in place on four skills: Spark, of intelligence, with a note of
// its author; Cast on Critical, a spirit gem new at 59, with a note; Herald of Ice, of dexterity and
// intelligence, without a note; Orb of Storms, its nine tags cut by the ellipsis; then two supports,
// Pinpoint Critical and a lineage support, with their icon, a disc, cut to a square, or without
// (« Support icon »); then the card of a note of the author, in the same construction, two. The
// card on hover in the windows of the page is the same (the Skills tab, the rows of the Overview).

// A card drawn in place, as it shows on hover.
const staticGemCard = (gem, level) =>
  `<div class="app-hover app-gem-hover is-skill-card${gem.kind === "support" ? " is-support-card" : ""} is-static">${gemHoverHtml(gem, level)}</div>`;
// The card of a note drawn in place, read from its mark as on hover (js/note-hover.js).
function staticNoteCard(note) {
  const holder = document.createElement("div");
  holder.innerHTML = noteMark(note);
  return `<div class="app-hover app-gem-hover app-note-hover is-skill-card is-static">${noteHoverHtml(holder.firstElementChild)}</div>`;
}
// A support of a skill of the build shown at a level, its levels within its skill's (js/levels.js).
const supportAt = (level, skill, name) => skillsAt(level).find(entry => entry.name === skill).supports.find(gem => gem.name === name);

addSection(() => {
  const spark = skillsAt(59).find(skill => skill.name === "Spark");
  const cast = skillsAt(59).find(skill => skill.name === "Cast on Critical");
  const herald = SKILL_SOURCES.dexterity(70).find(skill => skill.name === "Herald of Ice");
  const orb = skillsAt(59).find(skill => skill.name === "Orb of Storms");
  return ["The card of a skill: its head in the deep shade with the icon in its right corner, its body a step darker, the note of its author in the shade of the head; a support the same, with or without its icon (« Support icon »)", [
    ["Spark, with a note of its author", `<div class="sc-cards">${staticGemCard(spark, 59)}</div>`],
    ["Cast on Critical, a spirit gem new at 59", `<div class="sc-cards">${staticGemCard(cast, 59)}</div>`],
    ["Herald of Ice, of two attributes, without a note", `<div class="sc-cards">${staticGemCard(herald, 70)}</div>`],
    ["Orb of Storms, its nine tags cut: the pointer on them shows them whole", `<div class="sc-cards">${staticGemCard(orb, 59)}</div>`],
    ["A support: Pinpoint Critical, under Cast on Critical at 59", `<div class="sc-cards">${staticGemCard(supportAt(59, "Cast on Critical", "Pinpoint Critical"), 59)}</div>`],
    ["A lineage support: Arbiter's Ignition, under Spark at 65", `<div class="sc-cards">${staticGemCard(supportAt(65, "Spark", "Arbiter's Ignition"), 65)}</div>`],
    ["The note of the author of Spark, on its mark", `<div class="sc-cards">${staticNoteCard({ head: spark.name, text: spark.note })}</div>`],
    ["The note of the author of Comet, the skill Cast on Critical triggers", `<div class="sc-cards">${staticNoteCard({ place: cast.name, head: "Comet", text: cast.supports.find(gem => gem.name === "Comet").note })}</div>`],
  ]];
});
