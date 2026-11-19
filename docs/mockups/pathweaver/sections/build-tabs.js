// The tabs of a build (2h, the owner, 2026-11-19): F3 of twelve variants, on the page of the build
// shown; their motion in three to choose (Tab motion), the shadow under the level band tuned by eye
// (Level shadow).

addSection(() => ["The tabs of a build: click a tab, or a line of the window of « N changes »; the bar slides after Tab motion, the shadow under the level band after Level shadow", [
  ["The page of a build · 960 px", `<div class="app-window" style="width:960px">${buildHeader()}${levelBand()}${buildTabs()}${overview()}</div>`],
]]);
