// A row of a skill (2j2): N2, the spirit gem in its teal, the lineage supports in their warm grey, in
// the Overview at the level of the band above (the flash plays when it changes: ◀ ▶ to 65, where two
// lineage supports come onto Spark), then at 65 and at 85, the tree left out; the pointer on a line of
// « New at N » lights its gem in the rows, and a gem shows its card over the tree, as in the page.

const SKILL_ROW_CASES = [
  [65, "At 65: Arbiter's Ignition and Vilenta's Propulsion, two lineage supports, come onto Spark"],
  [85, "At 85: nothing changes"],
];

addSection(() => ["A row of a skill: N2, the spirit gem teal, the lineage supports warm grey; ◀ ▶ to 65 shows the flash, the pointer on a line of « New at N » lights its gem, a gem shows its card on hover", [
  ["The Overview at the level of the band: ◀ ▶, the track or ← →, to see the flash",
    `<div class="app-window" style="width:960px">${levelBand()}${overview()}</div>`],
  ...SKILL_ROW_CASES.map(([level, label]) => [label,
    `<div class="app-window" style="width:960px"><div class="app-overview app-sr-short"><div class="app-sr-tree app-weak">The tree</div><aside class="app-side graph-paper">${newAtBox(level)}${skillList(level)}</aside></div></div>`]),
]]);
