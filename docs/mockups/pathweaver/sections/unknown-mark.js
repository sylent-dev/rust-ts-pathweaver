// The mark of an id the game data don't know (2j3b, the owner, 2026-11-20): F3 of twelve variants on
// the items, a yellow sticky note « ? » (css/side-inventory.css), and from E4 an amber « ? » in place of
// the mark of a gem (css/side-skills.css); the others in the history of Git. On a case: two rows of
// skills (an unknown support on a known skill, an unknown skill), then the inventory with an unknown
// unique in a large slot (Helm1) and a small one (Ring2), and an unknown slot in the list (Trinket2).

// The rows: a file made for another version of the game, the end of the id for a name.
function unknownSkills(level) {
  const [known] = SHOWN.skills;
  const rows = [
    { ...known, levels: [1, 100], supports: [known.supports[0], { ...known.supports[1], name: "SupportGemEchoingThunder", known: false, lineage: false, note: "" }] },
    { name: "SkillGemFrostBombII", kind: "active", colour: "", levels: [1, 100], known: false, lineage: false, note: "", supports: [known.supports[2]] },
  ].map(skill => skillRow(skill, level));
  return `<h2 class="app-side-title app-title">Skills</h2><ul class="app-skills" data-level="${level}">${rows.map(skillLine).join("")}</ul>`;
}
function unknownHints(level) {
  return [...sampleHints(level).filter(hint => hint.id !== "Helm1"),
    { id: "Helm1", x: 0, y: 0, levels: [1, 100], unique: "Crown of Embers", base: "", note: "", unknown: true }];
}

addSection(() => ["The mark of what the game data don't know: a sticky note on an item, a « ? » for a gem", [
  ["An unknown support and an unknown skill; an unknown unique in a large and a small slot, an unknown slot in the list",
    `<div class="app-window" style="width:330px"><aside class="app-side app-inventory-alone">${unknownSkills(STATE.level)}${inventoryBox(STATE.level, unknownHints(STATE.level))}</aside></div>`],
]]);
