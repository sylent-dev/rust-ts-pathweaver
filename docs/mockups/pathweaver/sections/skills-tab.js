// The Skills tab (2k), twelve variants chosen with the tabs « Skills tab » at the top of the page: at
// the level of the band (◀ ▶ to 59, where Cast on Critical comes with Comet), then at the worst case of
// the corpus (14 skills at 53, a build of the corpus) and at its median (9 skills, the build shown at 40);
// then two builds with gems of two attributes (2kb), their marks in two halves: an Amazon of dexterity
// at 70 (Herald of Ice, Freezing Mark and Ghost Dance, dexterity and intelligence), a Mercenary at 31
// (four grenades, strength and dexterity; Pounce, strength and intelligence).

// The skills of a case of BUILDS.attributes at a level, as the build shown (js/levels.js, skillsAt).
for (const key of Object.keys(BUILDS.attributes)) {
  SKILL_SOURCES[key] = level => BUILDS.attributes[key]
    .filter(skill => appliesAt(skill.levels, level))
    .map(skill => ({ ...skill, supports: skill.supports.filter(support => appliesAt(support.levels, level)) }));
}

const skillsTabWindow = (band, level, source) =>
  `<div class="app-window" style="width:960px">${band ? levelBand() : ""}${buildTabs("skills")}${skillsTab(level, source)}</div>`;

addSection(() => {
  const variant = SKILLS_TAB_VARIANTS[chosen.skillsTab] ?? SKILLS_TAB_VARIANTS.n1;
  return [`The Skills tab, twelve variants with the tabs « Skills tab » at the top: normal N1–N3, high H1–H3, explosive E1–E3, free F1–F3; ${variant.title}`, [
    [`${variant.title}: ${variant.text} At the level of the band: ◀ ▶, the track or ← →`, skillsTabWindow(true, STATE.level)],
    ["14 skills at 53: the worst case of the corpus", skillsTabWindow(false, 53, "crowded")],
    ["9 skills at 40: the median of the corpus", skillsTabWindow(false, 40)],
    ["An Amazon at 70: Herald of Ice, Freezing Mark and Ghost Dance, dexterity and intelligence", skillsTabWindow(false, 70, "dexterity")],
    ["A Mercenary at 31: four grenades, strength and dexterity; Pounce, strength and intelligence", skillsTabWindow(false, 31, "grenades")],
  ]];
});
