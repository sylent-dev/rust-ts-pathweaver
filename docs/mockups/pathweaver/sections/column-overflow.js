// The overflow of the right column (2j4): E2, the inventory a drawer (js/side-overflow.js), with the
// controls « Drawer » and « Opens » at the top of the page. In the Overview at the level of the band,
// then on three columns alone at their real height, 668 px: the worst case of the corpus, 14 skills at
// 53 where 20 things are new (a build of the corpus beside the inventory of the build shown); its
// median, 9 skills, the build shown at 40; and the build shown at 100, where nothing is new.

const OVERFLOW_CASES = [
  ["14 skills, 20 new: the worst case of the corpus", { level: 53, record: BUILDS.changes.crowded.levels[53], source: "crowded" }],
  ["9 skills: the median of the corpus", { level: 40 }],
  ["10 skills, nothing new", { level: 100 }],
];

addSection(() => ["The overflow of the right column: the inventory a drawer at the bottom, its bar of thumbnails, the drawing rising over the skills (the controls « Drawer » and « Opens » at the top)", [
  ["The Overview at the level of the band: ◀ ▶, the track or ← →",
    `<div class="app-window" style="width:960px">${levelBand()}${overview()}</div>`],
  ...OVERFLOW_CASES.map(([label, { level, ...data }]) => [label,
    `<div class="app-window" style="width:330px"><div class="app-overview ov-alone">${sideColumn(level, data)}</div></div>`]),
]]);
