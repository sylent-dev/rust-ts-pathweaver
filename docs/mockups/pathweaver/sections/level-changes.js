// The level band and its window of what changes (2g, the owner, 2026-11-18): on the page of the
// build shown, at its level, then open on two cases of the corpus a band must hold.

// A case of another build: its level and « N changes » open between the arrows, its name, the
// window under it over an empty page.
const changesCase = (key, title) => {
  const [level, record] = Object.entries(BUILDS.changes[key].levels)[0];
  return `<div class="app-window app-changes-case" style="width:960px">
    <div class="app-level"><div class="app-level-now"><span class="app-level-label">Level</span><span class="app-level-number">${level}</span></div>
      ${levelSteps(undefined, undefined, record, true)}
      <span class="app-changes-case-name app-weak">${escapeHtml(BUILDS.changes[key].name)} · ${title}</span>
      ${changesWindow(record, level)}</div>
    <div class="app-changes-case-page"></div>
  </div>`;
};

addSection(() => ["The level band: ◀ ▶ and the track change the level, « N changes » between ◀ and ▶ opens the window of what changes, a line per change; a line leads to the tab of its change, ◀ ▶ and the track keep the window open, Esc or a click outside closes it", [
  [`The page of a build · level ${STATE.level}: click « N changes »`,
    `<div class="app-window" style="width:960px">${buildHeader()}${levelBand({ window: true })}${buildTabs()}${overview()}</div>`],
  ["A respec: 42 passives given back, gear replaced", changesCase("respec", "a respec")],
  ["The swap of a leveling build to its end: 70 of the 81 supports set again stay unchanged", changesCase("swap", "the swap to the end")],
]]);
