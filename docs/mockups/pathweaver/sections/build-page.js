// The page of a build at the smallest width, 960 pixels, from the frame « 960 px · Overview » of
// the wireframe: the build of the frame, at its level.

const buildWindow = (width, body) => `<div class="app-window" style="width:${width}px">${appBar(width)}${buildHeader()}${levelBand()}${buildTabs()}${body}</div>`;

addSection(() => ["The page of a build · 960 px: click ◀ ▶ or the track to change the level", [
  [`Overview · level ${STATE.level} · ${escapeHtml(SHOWN.name)}`, buildWindow(960, "")],
]]);
