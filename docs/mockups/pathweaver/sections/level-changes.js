// « N changes at N » and its window (2g, the owner, 2026-11-18): on the page of the build shown, at
// its level, then open on two cases of the corpus a band must hold.

// A case of another build: its name and level on the left of a band, its link open, the window
// under it over an empty page.
const changesCase = (key, title) => {
  const [level, record] = Object.entries(BUILDS.changes[key].levels)[0];
  return `<div class="app-window lvc-case" style="width:960px">
    <div class="lv"><span class="app-weak">${escapeHtml(BUILDS.changes[key].name)} · level ${level} · ${title}</span>
      <div class="lv6-changes">${changesLink(record, level, true)}${changesWindow(record, level)}</div></div>
    <div class="lvc-case-page"></div>
  </div>`;
};

addSection(() => ["What changes at N: « N changes at N » in the band, a link to the window of what changes, by category; ◀ ▶ and the track keep it open, Esc or a click outside closes it", [
  [`L6 · the page of a build · level ${STATE.level}: click « N changes »`,
    `<div class="app-window" style="width:960px">${buildHeader()}${LEVEL_VARIANTS.find(v => v.n === 6).render(levelContext(), { window: true })}${buildTabs()}${overview()}</div>`],
  ["A respec: 42 passives given back, gear replaced", changesCase("respec", "a respec")],
  ["The swap of a leveling build to its end: 70 of the 81 supports set again stay unchanged", changesCase("swap", "the swap to the end")],
]]);
