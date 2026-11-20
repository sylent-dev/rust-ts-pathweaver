// A row of a skill (2j2): N2 kept, the spirit gem in its teal, and the list « Lineage support » of the
// header (its grey), seen in the right column of the Overview at the level of the band
// above (the flash plays when it changes: ◀ ▶ to 65, where two lineage supports come onto Spark),
// then at 65 and at 85; the pointer on a line of « New at N » lights its gem in the rows.

const SKILL_ROW_CASES = [
  [() => STATE.level, "At the level of the band, in the column: move it to see the flash"],
  [() => 65, "At 65: Arbiter's Ignition and Vilenta's Propulsion, two lineage supports, come onto Spark"],
  [() => 85, "At 85: nothing changes"],
];

addSection(() => ["A row of a skill: N2, with the list « Lineage support » of the header; ◀ ▶ to 65 shows the flash, the pointer on a line of « New at N » lights its gem", [
  ["The level of the build: ◀ ▶, the track or ← →", `<div class="app-window app-sr-band" style="width:960px">${levelBand()}</div>`],
  ...SKILL_ROW_CASES.map(([level, label], index) => [label,
    `<aside class="app-window app-side ${index === 0 ? "app-sr-column" : ""}" style="width:330px">${newAtBox(level())}${skillList(level())}${index === 0 ? inventoryBox(level()) : ""}</aside>`]),
]]);
