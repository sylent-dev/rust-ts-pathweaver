// The icon of a skill on its card (2k, the owner, 2026-11-20): twelve ways, then I5 on the left edge
// (I13, I14), side by side on three skills: Spark, of intelligence, with a note of its author; Cast on
// Critical, a spirit gem; Herald of Ice, of dexterity and intelligence. The tabs « Skill icon » choose
// the way the windows of the page show on hover (the Skills tab, the rows of the Overview).

const GEM_ICON_WAYS = {
  i1: "A column on the left, 40 px", i2: "A banner across the top", i3: "Large, the text flowing around it",
  i4: "A watermark on the right", i5: "In the hexagon of the mark", i6: "A square framed in its colours",
  i7: "A badge over the corner", i8: "A disc at the top right", i9: "A strip down the left edge",
  i10: "Large on the right", i11: "Blurred behind the head", i12: "Small, before the name",
  i13: "I5 on the left edge, cut in half by it, at the height of the name",
  i14: "I5 on the left edge, cut in half by it, in the middle of the card",
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
  return ["The icon of a skill on its card, twelve ways, then I5 on the left edge (I13, I14): the tabs « Skill icon » at the top choose the one the windows show on hover", Object.entries(GEM_ICON_WAYS).map(([way, title]) =>
    [`${way.toUpperCase()} · ${title}`, `<div class="gi-cards">${[[spark, 59], [cast, 59], [herald, 70]].map(([gem, level]) => staticGemCard(gem, level, way)).join("")}</div>`])];
});
