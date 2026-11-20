// The Skills tab (2k): K6, a small card per skill, at the level of the band (◀ ▶ to 59, where Cast on
// Critical comes with Comet), then at the worst case of the corpus (14 skills at 53, a build of the
// corpus) and at its median (9 skills, the build shown at 40); then two builds with gems of two
// attributes (2kb), their marks in two halves: an Amazon of dexterity at 70 (Herald of Ice, Freezing Mark
// and Ghost Dance, dexterity and intelligence), a Mercenary at 31 (four grenades, strength and
// dexterity; Pounce, strength and intelligence).

// The skills of a case of BUILDS.attributes at a level, as the build shown (js/levels.js, skillsOf).
for (const [key, skills] of Object.entries(BUILDS.attributes)) SKILL_SOURCES[key] = level => skillsOf(skills, level);

const skillsTabWindow = (band, level, source) =>
  `<div class="app-window" style="width:960px">${band ? levelBand() : ""}${buildTabs("skills")}${skillsTab(level, source)}</div>`;

addSection(() => ["The Skills tab: a small card per skill, its supports in its body; a skill new at the level tagged « NEW » and swept by a light", [
  ["At the level of the band: ◀ ▶, the track or ← →", skillsTabWindow(true, STATE.level)],
  ["14 skills at 53: the worst case of the corpus", skillsTabWindow(false, 53, "crowded")],
  ["9 skills at 40: the median of the corpus", skillsTabWindow(false, 40)],
  ["An Amazon at 70: Herald of Ice, Freezing Mark and Ghost Dance, dexterity and intelligence", skillsTabWindow(false, 70, "dexterity")],
  ["A Mercenary at 31: four grenades, strength and dexterity; Pounce, strength and intelligence", skillsTabWindow(false, 31, "grenades")],
]]);
