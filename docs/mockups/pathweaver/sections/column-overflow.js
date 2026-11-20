// The overflow of the right column (2j4): E2, the inventory a drawer (js/side-overflow.js). In the Overview at the level of the band,
// then on three columns alone at their real height, 668 px: the worst case of the corpus, 14 skills at
// 53 where 20 things are new (a build of the corpus beside the inventory of the build shown); its
// median, 9 skills, the build shown at 40; the build shown at 100, where nothing is new; and a case
// past the corpus, so that « and N more » shows: the worst case with three skills of the build shown
// more, Cast on Critical and the Comet it triggers among them.

// The worst case and three skills more, invented: 17 skills, 18 rows.
SKILL_SOURCES.overfull = level => [...SKILL_SOURCES.crowded(level),
  ...skillsAt(100).filter(skill => ["Sigil of Power", "Cast on Critical", "Mana Tempest"].includes(skill.name))
    .map(skill => ({ ...skill, name: skill.name === "Mana Tempest" ? "Mana Tempest II" : skill.name === "Cast on Critical" ? "Cast on Critical II" : skill.name }))];

const OVERFLOW_CASES = [
  ["14 skills, 20 new: the worst case of the corpus", { level: 53, record: BUILDS.changes.crowded.levels[53], source: "crowded" }],
  ["9 skills: the median of the corpus", { level: 40 }],
  ["10 skills, nothing new", { level: 100 }],
  ["17 skills, 20 new, past the corpus: « and N more » leads to the Skills tab", { level: 53, record: BUILDS.changes.crowded.levels[53], source: "overfull" }],
];

addSection(() => ["The overflow of the right column: the inventory a drawer at the bottom, its bar of thumbnails, the drawing unrolling over the skills when the pointer stays on the bar", [
  ["The Overview at the level of the band: ◀ ▶, the track or ← →",
    `<div class="app-window" style="width:960px">${levelBand()}${overview()}</div>`],
  ...OVERFLOW_CASES.map(([label, { level, ...data }]) => [label,
    `<div class="app-window" style="width:330px"><div class="app-overview ov-alone">${sideColumn(level, data)}</div></div>`]),
]]);
