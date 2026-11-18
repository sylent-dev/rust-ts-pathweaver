// The level band alone (2g), at the top of the page while it is drawn: its three parts, the level
// and its arrows, the track, what changes at the level, taken one at a time (the owner, 2026-11-18).

addSection(() => ["The level band, alone: click ◀ ▶ or the track to change the level", [
  [`Level band · 960 px · level ${STATE.level}`, `<div class="app-window" style="width:960px">${levelBand()}</div>`],
]]);
