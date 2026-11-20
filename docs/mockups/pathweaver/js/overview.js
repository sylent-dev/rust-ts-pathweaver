// The Overview tab: the tree, and beside it the right column: what is new at the level (js/side-new.js),
// the skills (js/side-skills.js) and the inventory (js/side-inventory.js), a drawer when they don't fit
// (js/side-overflow.js, 2j4).

// The tree and the controls over it (js/tree-controls.js). `view` names the view of the tree the window
// keeps (js/tree.js, STATE.treeViews); `fps` shows the counter of frames per second (2i3).
function treePanel(level, { view = "page", fps = false } = {}) {
  return `<div class="app-tree">
    <canvas class="app-tree-canvas" data-tree="main" data-view="${view}" aria-label="Passive tree"></canvas>
    ${treeControls(level)}
    <div class="app-hover is-hover-card"></div>
    ${fps ? '<output class="app-fps app-number">Drag or zoom the tree</output>' : ""}
  </div>`;
}

function overview() {
  const level = STATE.level;
  return `<div class="app-overview">
    ${treePanel(level)}
    ${sideColumn(level)}
  </div>`;
}
