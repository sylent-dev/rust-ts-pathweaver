// The mark of an id the game data don't know (2j3b, the owner, 2026-11-20): F3 of twelve variants on
// the items, a yellow sticky note « ? » (css/side-inventory.css), and from E4 an amber « ? » in place of
// the mark of a gem (css/side-skills.css); the others in the history of Git. On a case: two rows of
// skills (an unknown support on a known skill, an unknown skill), then the inventory with an unknown
// unique in a large slot (Helm1) and a small one (Ring2), and an unknown slot in the list (Trinket2).

// The rows: a file made for another version of the game, the end of the id for a name; each gem shows
// its card on hover (js/gem-hover.js, SKILL_SOURCES).
function unknownSkillsAt() {
  const [known] = SHOWN.skills;
  const unknown = (id, kind, note = "") => ({ id, name: id.split("/").at(-1), kind, colour: "", levels: [1, 100], known: false, lineage: false, note, tags: [], text: "" });
  return [
    { ...known, levels: [1, 100], supports: [known.supports[0], unknown("Metadata/Items/Gems/SupportGemEchoingThunder", "support")] },
    { ...unknown("Metadata/Items/Gems/SkillGemFrostBombII", "active", "<gold>{Frost Bomb on bosses.}"), supports: [known.supports[2]] },
  ];
}
SKILL_SOURCES.unknownSample = unknownSkillsAt;
function unknownSkills(level) {
  const rows = unknownSkillsAt().map(skill => skillRow(skill, level));
  return `<h2 class="app-side-title app-title">Skills</h2><ul class="app-skills" data-level="${level}" data-source="unknownSample">${rows.map(skillLine).join("")}</ul>`;
}
function unknownHints(level) {
  return [...sampleHints(level).filter(hint => hint.id !== "Helm1"),
    { id: "Helm1", x: 0, y: 0, levels: [1, 100], unique: "Crown of Embers", base: "", note: "", unknown: true }];
}

addSection(() => ["The mark of what the game data don't know: a sticky note on an item, a « ? » for a gem, and their cards", [
  ["An unknown support and an unknown skill, their cards on hover; an unknown unique in a large and a small slot, an unknown slot in the list",
    `<div class="app-window" style="width:330px"><aside class="app-side app-inventory-alone">${unknownSkills(STATE.level)}${inventoryBox(STATE.level, unknownHints(STATE.level))}</aside></div>`],
]]);
