// The Skills tab (2k), twelve variants chosen with the tabs « Skills tab » at the top of the page: at
// the level of the band (◀ ▶ to 59, where Cast on Critical comes with Comet), then at the worst case of
// the corpus (14 skills at 53, a build of the corpus) and at its median (9 skills, the build shown at 40).

const skillsTabWindow = (band, level, source) =>
  `<div class="app-window" style="width:960px">${band ? levelBand() : ""}${buildTabs("skills")}${skillsTab(level, source)}</div>`;

addSection(() => {
  const variant = SKILLS_TAB_VARIANTS[chosen.skillsTab] ?? SKILLS_TAB_VARIANTS.n1;
  return [`The Skills tab, twelve variants with the tabs « Skills tab » at the top: normal N1–N3, high H1–H3, explosive E1–E3, free F1–F3; ${variant.title}`, [
    [`${variant.title}: ${variant.text} At the level of the band: ◀ ▶, the track or ← →`, skillsTabWindow(true, STATE.level)],
    ["14 skills at 53: the worst case of the corpus", skillsTabWindow(false, 53, "crowded")],
    ["9 skills at 40: the median of the corpus", skillsTabWindow(false, 40)],
  ]];
});
