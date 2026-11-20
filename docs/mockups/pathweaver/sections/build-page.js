// The page of a build at the smallest width, 960 pixels, from the frame « 960 px · Overview » of
// the wireframe: the build of the frame, at its level.

// The body of the tab chosen: the Skills tab drawn in 2k, the Tree tab in 2i; the others to come.
const tabBody = () => ({ skills: skillsTab, tree: treeTab }[STATE.tab] ?? overview)();

const buildWindow = (width, body) => `<div class="app-window" style="width:${width}px">${appBar(width)}${buildHeader()}${levelBand()}${buildTabs()}${body}</div>`;

addSection(() => ["The page of a build · 960 px: click ◀ ▶ or the track to change the level, drag and scroll the tree", [
  [`${BUILD_TABS[STATE.tab]} · level ${STATE.level} · ${escapeHtml(SHOWN.name)}`, buildWindow(960, tabBody())],
]]);
