// The card of a skill (2k, the owner, 2026-11-20, from the wireframe docs/wireframes/gem-card.excalidraw):
// its head in the deep shade with the icon in its corner, its body and the note of its author a step
// darker. Drawn in place on four skills: Spark, of intelligence, with a note of its author; Cast on
// Critical, a spirit gem new at 59, with a note; Herald of Ice, of dexterity and intelligence, without a
// note; Orb of Storms, its nine tags cut by the ellipsis. The controls « Icon side », « Icon size » and
// « Card icon » at the top change them, and the card on hover in the windows of the page (the Skills
// tab, the rows of the Overview).

// A card drawn in place, as it shows on hover.
function staticGemCard(gem, level) {
  const [first, second = first] = gemColoursOf(gem);
  return `<div class="app-hover app-gem-hover is-skill-card is-static" style="--gem:${first};--gem-2:${second}">${gemHoverHtml(gem, level)}</div>`;
}

addSection(() => {
  const spark = skillsAt(59).find(skill => skill.name === "Spark");
  const cast = skillsAt(59).find(skill => skill.name === "Cast on Critical");
  const herald = SKILL_SOURCES.dexterity(70).find(skill => skill.name === "Herald of Ice");
  const orb = skillsAt(59).find(skill => skill.name === "Orb of Storms");
  return ["The card of a skill: its head in the deep shade with the icon in its corner, its body and the note of its author a step darker; « Icon side », « Icon size » and « Card icon » at the top", [
    ["Spark, with a note of its author", `<div class="sc-cards">${staticGemCard(spark, 59)}</div>`],
    ["Cast on Critical, a spirit gem new at 59", `<div class="sc-cards">${staticGemCard(cast, 59)}</div>`],
    ["Herald of Ice, of two attributes, without a note", `<div class="sc-cards">${staticGemCard(herald, 70)}</div>`],
    ["Orb of Storms, its nine tags cut: the pointer on them shows them whole", `<div class="sc-cards">${staticGemCard(orb, 59)}</div>`],
  ]];
});
