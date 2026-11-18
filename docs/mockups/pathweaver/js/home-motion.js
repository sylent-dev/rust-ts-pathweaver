// What the canvas draws on the home page (2l): the passive tree behind the variants that show it,
// drawn by drawTree (js/tree.js) as the page of a build draws it, with the path of the build of
// the sample lit. `data-home-tree` names the view: "whole" the tree around the path of the build,
// shifted to the right of the window, so that the text reads on its left.

// The states of the passives: the whole path of the build lit, its first weapon set.
const homeTreeStates = level => treeStates(TREE.taken, TREE.nodes.length, level, 1);

// The view centred on the path of the build, `zoom` times the scale that fits it, its centre
// moved by `shift` of the width (to the right when positive).
function homeTreeView(canvas, shift = 0, zoom = 1) {
  const view = fitView(TREE.nodes, TREE.taken.map(([i]) => i), canvas.clientWidth, canvas.clientHeight, 40);
  view.scale *= zoom;
  view.x -= (canvas.clientWidth * shift) / view.scale;
  return view;
}

const homeTreeCanvas = (kind, extra = "") => `<canvas class="home-tree-canvas ${extra}" data-home-tree="${kind}" aria-hidden="true"></canvas>`;

function mountHomeTrees() {
  for (const canvas of document.querySelectorAll('canvas[data-home-tree="whole"]')) {
    drawTree(canvas, TREE, homeTreeStates(MAX_LEVEL), homeTreeView(canvas, 0.24, 0.5), "", 0.8);
  }
}
AFTER_RENDER.push(mountHomeTrees);
