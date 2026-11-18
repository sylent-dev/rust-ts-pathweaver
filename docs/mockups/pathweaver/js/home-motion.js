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

// E1 and E1b · The page is the drop zone: the grid lit around the pointer, and the whole window
// lit while a real file is dragged over it (try with any file of the desktop: the mock-up opens
// nothing); a window drawn in that state holds it (data-held).
STATE.homeDrag = false;
ACTIONS.homeDrag = () => {
  STATE.homeDrag = !STATE.homeDrag;
  return true;
};
const sheet = document.getElementById("sheet");
sheet.addEventListener("pointermove", event => {
  const flood = event.target.closest(".home-flood, .home-drop");
  if (!flood) return;
  const box = flood.getBoundingClientRect();
  flood.style.setProperty("--home-x", `${event.clientX - box.left}px`);
  flood.style.setProperty("--home-y", `${event.clientY - box.top}px`);
});
sheet.addEventListener("dragover", event => {
  const flood = event.target.closest(".home-flood, .home-drop");
  if (!flood) return;
  event.preventDefault();
  flood.classList.add("is-drag");
});
sheet.addEventListener("dragleave", event => {
  const flood = event.target.closest(".home-flood, .home-drop");
  if (flood && !flood.contains(event.relatedTarget) && !flood.hasAttribute("data-held")) flood.classList.remove("is-drag");
});
sheet.addEventListener("drop", event => {
  const flood = event.target.closest(".home-flood, .home-drop");
  if (!flood) return;
  event.preventDefault();
  if (!flood.hasAttribute("data-held")) flood.classList.remove("is-drag");
});

// The walk of the two animated variants: the level goes from 1 to 100 in WALK_SECONDS, waits, and
// starts again. With less motion, it stays at 100 (E2) or at 1 (E3).
const WALK_SECONDS = 12, WALK_REST = 2.5;
const walkLevel = time => {
  const t = (time / 1000) % (WALK_SECONDS + WALK_REST);
  return Math.min(MAX_LEVEL, 1 + Math.floor((t / WALK_SECONDS) * MAX_LEVEL));
};
const isSeen = element => {
  const box = element.getBoundingClientRect();
  return box.bottom > 0 && box.top < innerHeight && box.width > 0;
};

// E2 · Constellation: the view closes in from the whole tree to the path, on a smooth curve.
function drawSky(canvas, level) {
  const whole = fitView(TREE.nodes, TREE.nodes.map((_, i) => i), canvas.clientWidth, canvas.clientHeight, 20);
  const path = homeTreeView(canvas, 0.16, 0.8);
  const k = (1 - Math.cos(((level - 1) / (MAX_LEVEL - 1)) * Math.PI)) / 2;
  const view = { x: whole.x + (path.x - whole.x) * k, y: whole.y + (path.y - whole.y) * k,
    scale: Math.exp(Math.log(whole.scale) + (Math.log(path.scale) - Math.log(whole.scale)) * k) };
  drawTree(canvas, TREE, homeTreeStates(level), view, "", 0.7);
  const counter = canvas.parentElement.querySelector(".home-sky-level b");
  if (counter) counter.textContent = level;
}

// E3 · The road: the levels to come stand along it, every fifth, the markers of the build in the
// accent; the nearest at the bottom of the floor, the farthest, AHEAD levels on, at the horizon.
const AHEAD = 30;
function drawWay(floor, position) {
  const marks = new Set(markers());
  const posts = [];
  for (let level = Math.ceil(position / 5) * 5; level <= Math.min(MAX_LEVEL, position + AHEAD); level += 5) posts.push(level);
  floor.querySelector(".home-way-posts").innerHTML = posts.map((level, index) => {
    const depth = (level - position) / AHEAD;
    const side = (level / 5) % 2 === 0 ? 43 : 57;
    return `<span class="home-way-post ${marks.has(level) ? "is-marker" : ""}" style="left:${side}%;top:${(1 - depth) * 100}%;opacity:${Math.min(1, (1 - depth) * 2.5)}">${level}</span>`;
  }).join("");
}

function homeFrame(time) {
  const still = lessMotion();
  for (const canvas of document.querySelectorAll('canvas[data-home-tree="sky"]')) {
    if (isSeen(canvas)) drawSky(canvas, still ? MAX_LEVEL : walkLevel(time));
  }
  for (const floor of document.querySelectorAll(".home-way-floor")) {
    const t = (time / 1000) % (WALK_SECONDS + WALK_REST);
    if (isSeen(floor)) drawWay(floor, still ? 1 : 1 + (Math.min(t, WALK_SECONDS) / WALK_SECONDS) * (MAX_LEVEL - 1));
  }
  requestAnimationFrame(homeFrame);
}
requestAnimationFrame(homeFrame);
