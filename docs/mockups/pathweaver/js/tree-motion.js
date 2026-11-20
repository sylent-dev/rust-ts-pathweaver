// The motion of the controls over the tree (2i4): the switch of the weapon set and the zoom, in variants
// to choose with the tabs at the top of the page; everything at once when the system asks for less
// motion.

const easeOut = t => 1 - (1 - t) ** 3;
const progressOf = (start, duration, now) => Math.min(1, Math.max(0, (now - start) / duration));

// The switch of the weapon set. The look of the links of each set, the strength and the width of its
// colour, and the wave that lights them (S2), drawn by drawTree (js/tree.js); at rest, the set of the
// switch strong and the other faint.
const FAINT_SET = 0.35;
const restingLook = set => ({
  1: { alpha: set === 1 ? 1 : FAINT_SET, width: 1 },
  2: { alpha: set === 2 ? 1 : FAINT_SET, width: 1 },
  wave: null,
});
const fade = (look, set, k) => {
  look[set].alpha = FAINT_SET + (1 - FAINT_SET) * k;
  look[3 - set].alpha = 1 - (1 - FAINT_SET) * k;
  return look;
};
// The look of the links while the set switches, at the moment t of the motion (0 to 1).
const SET_MOTIONS = {
  // S1: the two sets swap their strength.
  s1: { duration: 180, look: (set, t) => fade(restingLook(set), set, easeOut(t)) },
  // S2: the set chosen lights from the shared passives outward, link by link, at an even speed (its
  // branches are a few links long: an easing would light most of them at once); the other goes faint at
  // once.
  s2: { duration: 300, look: (set, t) => ({ ...restingLook(set), [set]: { alpha: FAINT_SET, width: 1 }, wave: { set, reach: t } }) },
  // S3: the set chosen at once, its links thickening and back; the other fading.
  s3: { duration: 250, look: (set, t) => {
    const look = fade(restingLook(set), set, 1);
    look[set].width = 1 + 1.5 * Math.sin(Math.PI * t);
    look[3 - set].alpha = 1 - (1 - FAINT_SET) * easeOut(t);
    return look;
  } },
};

let setMotion = null;   // { start } while the set switches
const setMoving = now => setMotion !== null && now - setMotion.start < SET_MOTIONS[chosen.setMotion].duration;
function setLookAt(now) {
  if (!setMoving(now)) return restingLook(STATE.set);
  return SET_MOTIONS[chosen.setMotion].look(STATE.set, progressOf(setMotion.start, SET_MOTIONS[chosen.setMotion].duration, now));
}

// Shows a set on every tree of the page, its buttons changed in place so that their colour moves too
// (css/tree-controls.css).
function switchSet(set) {
  if (set === STATE.set) return;
  STATE.set = set;
  for (const button of document.querySelectorAll(".tc-set")) button.setAttribute("aria-pressed", String(Number(button.dataset.set) === set));
  setMotion = lessMotion() ? null : { start: performance.now() };
  drawCentreTrees();
  for (const canvas of mainTrees()) askDrawing(canvas);
}

// The wave of S2: the distance of each passive of the set from the shared passives, in links, and how
// far the wave has gone.
let NEIGHBOURS = null;
function neighbours() {
  if (NEIGHBOURS) return NEIGHBOURS;
  NEIGHBOURS = TREE.nodes.map(() => []);
  for (const [a, b] of TREE.edges) {
    NEIGHBOURS[a].push(b);
    NEIGHBOURS[b].push(a);
  }
  return NEIGHBOURS;
}
function withDepths(look, states, sets) {
  const { set, reach } = look.wave;
  const depth = new Float32Array(TREE.nodes.length).fill(Infinity);
  const queue = [];
  for (const [index, state] of states.entries()) {
    if (state >= 2 && sets[index] === 3) {
      depth[index] = 0;
      queue.push(index);
    }
  }
  let deepest = 0;
  for (let head = 0; head < queue.length; head++) {
    const index = queue[head];
    for (const next of neighbours()[index]) {
      if (depth[next] !== Infinity || states[next] < 2 || sets[next] !== set) continue;
      depth[next] = depth[index] + 1;
      deepest = Math.max(deepest, depth[next]);
      queue.push(next);
    }
  }
  // A passive of the set the wave can't reach lights with the last ones.
  for (const [index, d] of depth.entries()) if (d === Infinity) depth[index] = deepest;
  return { ...look, wave: { set, depth, upTo: reach * (deepest + 1) } };
}
// The part of a link the wave has reached: from its passive nearer the shared ones, as a fraction of its
// length, or null.
function reachedPart({ depth, upTo }, a, b) {
  const [near, far] = depth[a] <= depth[b] ? [a, b] : [b, a];
  if (upTo <= depth[near]) return null;
  return [near, far, Math.min(1, (upTo - depth[near]) / Math.max(1, depth[far] - depth[near]))];
}

// The zoom: − + and the wheel around a point that stays under the pointer, the frame that fits the build.
// The bounds of the zoom, in pixels per unit of the game.
const ZOOM_RANGE = [0.005, 0.5];
const clampScale = scale => Math.min(ZOOM_RANGE[1], Math.max(ZOOM_RANGE[0], scale));

function zoomTree(canvas, factor, way, atX = canvas.clientWidth / 2, atY = canvas.clientHeight / 2) {
  const view = viewOf(canvas);
  const [dx, dy] = [atX - canvas.clientWidth / 2, atY - canvas.clientHeight / 2];
  const [x, y] = [view.x + dx / view.scale, view.y + dy / view.scale];
  const scale = clampScale(view.scale * factor);
  moveView(canvas, { x: x - dx / scale, y: y - dy / scale, scale });
}
function fitTree(canvas) {
  moveView(canvas, fittedView(canvas));
}
function moveView(canvas, to) {
  Object.assign(viewOf(canvas), to);
  askDrawing(canvas);
}
function moveZoom() {}
function stopZoom() {}

// Whether a tree is still moving at a moment, to draw it again at the next frame.
const moving = (canvas, now) => setMoving(now);
