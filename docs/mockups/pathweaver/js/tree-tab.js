// The Tree tab: the tree in the whole window, without the right column (the frame « 960 px · Tree » of
// the wireframe, the owner, 2026-11-19), its controls as on the Overview; drawn whole in 2k.

function treeTab() {
  return `<div class="app-tree-tab">${treePanel(STATE.level)}</div>`;
}
