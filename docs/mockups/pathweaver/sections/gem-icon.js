// The icon of a skill on its card (2k, the owner, 2026-11-20): I5 of twelve ways, then on the left edge
// of the card, side by side on three skills: Spark, of intelligence, with a note of its author; Cast on
// Critical, a spirit gem; Herald of Ice, of dexterity and intelligence. The tabs « Skill icon » choose
// the way the windows of the page show on hover (the Skills tab, the rows of the Overview).

const GEM_ICON_WAYS = {
  i5: "In the hexagon of the mark, inside the card (kept of twelve)",
  i13: "On the left edge, cut in half by it, at the height of the name",
  i14: "On the left edge, cut in half by it, in the middle of the card",
};

// A card drawn in place, as it shows on hover.
function staticGemCard(gem, level, way) {
  const [first, second = first] = gemColoursOf(gem);
  return `<div class="app-hover app-gem-hover is-static" data-icon="${way}" style="--gem:${first};--gem-2:${second}">${gemHoverHtml(gem, level)}</div>`;
}

addSection(() => {
  const spark = skillsAt(59).find(skill => skill.name === "Spark");
  const cast = skillsAt(59).find(skill => skill.name === "Cast on Critical");
  const herald = SKILL_SOURCES.dexterity(70).find(skill => skill.name === "Herald of Ice");
  return ["The icon of a skill on its card: I5, then on the left edge of the card; the tabs « Skill icon » at the top choose the one the windows show on hover", Object.entries(GEM_ICON_WAYS).map(([way, title]) =>
    [`${way.toUpperCase()} · ${title}`, `<div class="gi-cards">${[[spark, 59], [cast, 59], [herald, 70]].map(([gem, level]) => staticGemCard(gem, level, way)).join("")}</div>`])];
});
