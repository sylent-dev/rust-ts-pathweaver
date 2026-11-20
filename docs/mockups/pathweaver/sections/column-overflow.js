// The overflow of the right column (2j4): twelve variants (js/side-overflow.js), each on two columns
// alone at their real height, 668 px: the worst case of the corpus, 14 skills at 53 where 20 things are
// new (a build of the corpus beside the inventory of the build shown), and its median, 9 skills, the
// build shown at 40; then the Overview at the level of the band, in the variant of the tab « Overflow ».

const OVERFLOW_CASES = [
  ["14 skills, 20 new", { level: 53, record: BUILDS.changes.crowded.levels[53], source: "crowded" }],
  ["9 skills", { level: 40 }],
];
const overflowAlone = (variant, { level, ...data }) =>
  `<div class="app-window" style="width:330px"><div class="app-overview ov-alone">${sideColumn(level, { ...data, variant })}</div></div>`;

addSection(() => ["The overflow of the right column: twelve variants (N normal, H high, E explosive, F fun), each at the worst case of the corpus and at its median; the tab « Overflow » applies one to every Overview", [
  [`The Overview at the level of the band, in ${OVERFLOW_VARIANTS[chosen.overflow][0]} (the tab « Overflow »): ◀ ▶, the track or ← →`,
    `<div class="app-window" style="width:960px">${levelBand()}${overview()}</div>`],
  // A row of the page per temperature: three variants, two columns each.
  ...Object.entries(OVERFLOW_VARIANTS).flatMap(([variant, [id, temperature, label]], index) => [
    ...(index % 3 === 0 ? [["", '<i class="ov-break"></i>']] : []),
    ...OVERFLOW_CASES.map(([words, data], first) => [first === 0 ? `<b>${id} · ${temperature}</b> · ${label}<br>${words}` : `<br>${words}`, overflowAlone(variant, data)]),
  ]),
]]);
