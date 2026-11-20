// The Overview tab: the tree, and beside it the right column: what is new at the level (js/side-new.js),
// the skills (js/side-skills.js) and the inventory (js/side-inventory.js).

// The tree and the controls over it (js/tree-controls.js). `view` names the view of the tree the window
// keeps (js/tree.js, STATE.treeViews); `fps` shows the counter of frames per second (2i3).
function treePanel(level, { view = "page", fps = false } = {}) {
  return `<div class="app-tree">
    <canvas class="app-tree-canvas" data-tree="main" data-view="${view}" aria-label="Passive tree"></canvas>
    ${treeControls(level)}
    <div class="app-hover"></div>
    ${fps ? '<output class="app-fps app-number">Drag or zoom the tree</output>' : ""}
  </div>`;
}

// The shade of the column, darker than the tree so that the two aren't read as one (the owner,
// 2026-11-20, to try): an open decision, a list in the header of the mock-up, which applies at once.
VARIANTS.sideShade = {
  label: "Side column", select: true, variable: "--side-column",
  options: { "var(--side)": "As the tree (now)", "#04070b": "A shade darker", "#020305": "Darker", "#000000": "Black" },
  fallback: "#020305",
};
chosen.sideShade = accepts(VARIANTS.sideShade, params.get("sideShade")) ? params.get("sideShade") : VARIANTS.sideShade.fallback;

function overview() {
  const level = STATE.level;
  return `<div class="app-overview">
    ${treePanel(level)}
    <aside class="app-side">${newAtBox(level)}${skillList(level)}${inventoryBox(level)}</aside>
  </div>`;
}
