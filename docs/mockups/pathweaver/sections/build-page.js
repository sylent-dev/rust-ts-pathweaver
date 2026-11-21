// The page of a build at the smallest width, 960 pixels, from the frame « 960 px · Overview » of
// the wireframe: the build of the frame, at its level.

// The body of the tab chosen: the Skills tab drawn in 2k, the Tree tab in 2i, the Inventory tab in 2k2, the
// About tab in 2k3.
const tabBody = () => ({ skills: skillsTab, tree: treeTab, inventory: inventoryTab, about: aboutTab }[STATE.tab] ?? overview)();

const buildWindow = (width, body) => `<div class="app-window" style="width:${width}px">${appBar(width)}${buildHeader()}${levelBand()}${buildTabs()}${body}</div>`;

addSection(() => ["The page of a build · 960 px: click ◀ ▶ or the track to change the level, drag and scroll the tree", [
  [`${BUILD_TABS[STATE.tab]} · level ${STATE.level} · ${escapeHtml(SHOWN.name)}`, buildWindow(960, tabBody())],
]]);
