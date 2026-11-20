// The motion of the controls over the tree (2i4, the owner, 2026-11-20): the switch of the weapon set,
// S1 of three (a wave from the shared passives and a flash of the links set aside), and the zoom, Z2 of
// three (a jump at each step, and the wheel eased too, set aside); everything at once when the system
// asks for less motion.

const easeOut = t => 1 - (1 - t) ** 3;
const progressOf = (start, duration, now) => Math.min(1, Math.max(0, (now - start) / duration));

// The switch of the weapon set: the strength of the links of each set, drawn by drawTree (js/tree.js);
// at rest, the set of the switch strong and the other faint; while the set switches, the two swap their
// strength in 180 ms.
const FAINT_SET = 0.35;
const SET_SWITCH_TIME = 180;
const strengths = (set, k) => {
  const [strong, faint] = [FAINT_SET + (1 - FAINT_SET) * k, 1 - (1 - FAINT_SET) * k];
  return set === 1 ? { 1: strong, 2: faint } : { 1: faint, 2: strong };
};
const restingLook = set => strengths(set, 1);

let setMotion = null;   // { start } while the set switches
const setMoving = now => setMotion !== null && now - setMotion.start < SET_SWITCH_TIME;
const setLookAt = now => (setMoving(now) ? strengths(STATE.set, easeOut(progressOf(setMotion.start, SET_SWITCH_TIME, now))) : restingLook(STATE.set));

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

// The zoom: − + and the wheel around a point that stays under the pointer, the frame that fits the build.
// The bounds of the zoom, in pixels per unit of the game.
const ZOOM_RANGE = [0.005, 0.5];
const clampScale = scale => Math.min(ZOOM_RANGE[1], Math.max(ZOOM_RANGE[0], scale));

// The time of each way to zoom, in milliseconds: − + and the frame eased, the wheel at once, so that it
// never lags behind the notches of a mouse.
const ZOOM_TIMES = { button: 200, fit: 350, wheel: 0 };
const zoomTime = way => (lessMotion() ? 0 : ZOOM_TIMES[way]);

// The zooms under way, by data-view: from and to a view, and the point of the game that stays under the
// pointer (a zoom), or none (the frame, which moves too).
const ZOOMS = {};
function zoomTree(canvas, factor, way, atX = canvas.clientWidth / 2, atY = canvas.clientHeight / 2) {
  const view = viewOf(canvas);
  const [dx, dy] = [atX - canvas.clientWidth / 2, atY - canvas.clientHeight / 2];
  const anchor = [view.x + dx / view.scale, view.y + dy / view.scale, dx, dy];
  // A click during a zoom goes on from where that zoom was heading.
  const scale = clampScale((ZOOMS[canvas.dataset.view]?.to.scale ?? view.scale) * factor);
  moveView(canvas, { x: anchor[0] - dx / scale, y: anchor[1] - dy / scale, scale }, zoomTime(way), anchor);
}
function fitTree(canvas) {
  moveView(canvas, fittedView(canvas), zoomTime("fit"), null);
}
function moveView(canvas, to, duration, anchor) {
  const key = canvas.dataset.view;
  if (duration === 0) {
    delete ZOOMS[key];
    Object.assign(viewOf(canvas), to);
  } else {
    ZOOMS[key] = { start: performance.now(), duration, from: { ...viewOf(canvas) }, to, anchor };
  }
  askDrawing(canvas);
}
// Sets the view of a tree where its zoom is at a moment: the scale eased on a log scale, so that each
// step looks the same, around its point, or the centre moving with it.
function moveZoom(canvas, now) {
  const key = canvas.dataset.view, motion = ZOOMS[key];
  if (!motion) return;
  const t = progressOf(motion.start, motion.duration, now), k = easeOut(t);
  const view = viewOf(canvas), { from, to, anchor } = motion;
  view.scale = from.scale * (to.scale / from.scale) ** k;
  if (anchor) {
    view.x = anchor[0] - anchor[2] / view.scale;
    view.y = anchor[1] - anchor[3] / view.scale;
  } else {
    view.x = from.x + (to.x - from.x) * k;
    view.y = from.y + (to.y - from.y) * k;
  }
  if (t >= 1) delete ZOOMS[key];
}
// A drag stops the zoom where it is.
const stopZoom = canvas => delete ZOOMS[canvas.dataset.view];

// Whether a tree is still moving at a moment, to draw it again at the next frame.
const moving = (canvas, now) => canvas.dataset.view in ZOOMS || setMoving(now);
