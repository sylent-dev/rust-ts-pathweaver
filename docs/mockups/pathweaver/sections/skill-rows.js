// A row of a skill, twelve variants (2j2): each in the right column of the Overview at the level of
// the band above, between « New at N » and the inventory; then alone at 65, where two supports come
// onto Spark, and at 85, where nothing changes.

const SKILL_ROW_CASES = [
  [() => STATE.level, "At the level of the band, in the column"],
  [() => 65, "At 65: Arbiter's Ignition and Vilenta's Propulsion come onto Spark"],
  [() => 85, "At 85: nothing changes"],
];

function skillRowVariant(id) {
  const variant = SKILL_ROW_VARIANTS[id];
  const cases = SKILL_ROW_CASES.map(([level, label], index) => `<p class="app-sr-case-label">${label}</p>${index === 0
    ? `<aside class="app-side app-sr-column">${newAtBox(level())}${skillRowsOf(id, level(), `${id}-${index}`)}${inventoryBox(level())}</aside>`
    : `<aside class="app-side app-sr-alone">${skillRowsOf(id, level(), `${id}-${index}`)}</aside>`}`).join("");
  return `<div class="app-window app-sr-variant" style="width:330px"><p class="app-sr-text">${variant.text}<br><span class="app-weak">The spirit gem: ${SPIRIT_MARKS[variant.spirit][0]}.</span></p>${cases}</div>`;
}

addSection(() => ["A row of a skill, twelve variants: the band moves the level of the first case; normal N1–N3, high H1–H3, explosive E1–E3, free F1–F3", [
  ["The level of the build: ◀ ▶, the track or ← →", `<div class="app-window app-sr-band" style="width:960px">${levelBand()}</div>`],
  ...Object.entries(SKILL_ROW_VARIANTS).map(([id, variant]) => [variant.title, skillRowVariant(id)]),
]]);
