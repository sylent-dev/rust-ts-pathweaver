// The motion of the window of what changes (2g4): « Lines change » at the top
// of the page; open the window, then move the level with ◀ ▶, a click on the track or ← →.
addSection(() => ["The motion of the window: click « N changes », then ◀ ▶ with it open; « Lines change » at the top of the page", [
  ["The page of a build, its band at its own level", `<div class="app-window" style="width:960px">${buildHeader()}${levelBand({ key: "motion", window: true })}${buildTabs()}${overview()}</div>`],
]]);
