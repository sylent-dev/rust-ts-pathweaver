// The tabs of a build (2h, the owner, 2026-11-19): F3 of twelve variants, on the page of the build
// shown, the bar sliding to the tab clicked; a light shadow under the level band.

addSection(() => ["The tabs of a build: click a tab, or a line of the window of « N changes »; the bar slides to it", [
  ["The page of a build · 960 px", `<div class="app-window" style="width:960px">${buildHeader()}${levelBand()}${buildTabs()}${overview()}</div>`],
]]);
