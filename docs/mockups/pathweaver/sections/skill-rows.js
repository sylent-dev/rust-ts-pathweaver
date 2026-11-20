// A row of a skill (2j2): N2 kept, and the two lists of the header, « New support » and « Spirit gem »,
// seen in the right column of the Overview at the level of the band above (the flash plays when it
// changes: ◀ ▶ to 65, where two supports come onto Spark), then alone at 65 and at 85.

const SKILL_ROW_CASES = [
  [() => STATE.level, "At the level of the band, in the column: move it to see the flash"],
  [() => 65, "At 65: Arbiter's Ignition and Vilenta's Propulsion come onto Spark"],
  [() => 85, "At 85: nothing changes"],
];

addSection(() => ["A row of a skill: N2, with the lists « New support » and « Spirit gem » of the header; ◀ ▶ to 65 shows the flash", [
  ["The level of the build: ◀ ▶, the track or ← →", `<div class="app-window app-sr-band" style="width:960px">${levelBand()}</div>`],
  ...SKILL_ROW_CASES.map(([level, label], index) => [label, index === 0
    ? `<aside class="app-window app-side app-sr-column" style="width:330px">${newAtBox(level())}${skillList(level())}${inventoryBox(level())}</aside>`
    : `<aside class="app-window app-side" style="width:330px">${skillList(level())}</aside>`]),
]]);
