// The passive tree, drawn in a canvas as the application will (docs/technical-choices.md):
// the 4,115 passives of the tree of the game at their real positions, moved with the mouse and
// zoomed with the wheel. At the level: the passives taken are lit, those taken later faded, the
// others dimmed, and those taken at this very level ringed with the accent (specs.md, Passive tree).
// Every colour is a token of the style, read from the CSS. Close enough, the passives are drawn with
// the icons and frames of the game (2i, docs/game-data.md), greyed when not taken; further out, as
// the shapes of the style. The two weapon sets are drawn together, the links of the passives of one
// set alone in its colour, the set of the switch strong and the other faint (2i, the owner,
// 2026-11-19). The ascendancy is drawn at the centre, in the empty disc inside the ring of the class
// starts, over its portrait large and faded (2i2, the owner, 2026-11-19).

STATE.set = 1;

// The radius of each kind of passive (TREE.kinds), in units of the game.
const NODE_RADIUS = { small: 26, notable: 40, keystone: 58, jewel: 38, attribute: 26, start: 52 };
const NODE_STATES = ["none", "later", "taken", "new"];

// The state of every passive at the level, whatever its weapon set.
function treeStates(taken, count, level) {
  const states = new Uint8Array(count);
  for (const [index, low, high] of taken) {
    const state = low === level ? 3 : appliesAt([low, high], level) ? 2 : low > level ? 1 : 0;
    states[index] = Math.max(states[index], state);
  }
  return states;
}

// The weapon sets of every passive, as bits: 1 the first, 2 the second, 3 both (a passive of both
// sets, or one taken twice).
function setMasks(taken, count) {
  const sets = new Uint8Array(count);
  for (const [index, , , s] of taken) sets[index] |= s === 1 || s === 2 ? s : 3;
  return sets;
}

// Fits the passives of the build (every set, every level, the ascendancy too) in the canvas.
function fitView(points, width, height, margin) {
  const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, scale: Math.min((width - margin) / (x1 - x0 || 1), (height - margin) / (y1 - y0 || 1)) };
}

function token(element, name) {
  return getComputedStyle(element).getPropertyValue(name).trim();
}

// The shapes a style can give to each kind of passive (tokens --tree-shape-<kind>).
const SHAPES = {
  circle: (context, x, y, r) => { context.moveTo(x + r, y); context.arc(x, y, r, 0, Math.PI * 2); },
  square: (context, x, y, r) => { const s = r * 0.9; context.rect(x - s, y - s, s * 2, s * 2); },
  diamond: (context, x, y, r) => { const s = r * 1.25; context.moveTo(x + s, y); context.lineTo(x, y + s); context.lineTo(x - s, y); context.lineTo(x, y - s); context.closePath(); },
  hex: (context, x, y, r) => polygon(context, x, y, r * 1.1, 6, 0),
  star: (context, x, y, r) => {
    const outer = r * 1.45, inner = r * 0.6;
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outer : inner, angle = -Math.PI / 2 + (i * Math.PI) / 5;
      context[i === 0 ? "moveTo" : "lineTo"](x + radius * Math.cos(angle), y + radius * Math.sin(angle));
    }
    context.closePath();
  },
};
function polygon(context, x, y, r, sides, turn) {
  for (let i = 0; i < sides; i++) {
    const angle = turn + (i * Math.PI * 2) / sides;
    context[i === 0 ? "moveTo" : "lineTo"](x + r * Math.cos(angle), y + r * Math.sin(angle));
  }
  context.closePath();
}

// The shape of a kind of passive in the style: small and attribute passives share a shape, as do
// notables and the class starts.
function shapeOf(canvas) {
  const read = kind => SHAPES[token(canvas, `--tree-shape-${kind}`)] ?? SHAPES.circle;
  const small = read("small"), notable = read("notable"), keystone = read("keystone"), jewel = read("jewel");
  return { small, attribute: small, notable, start: notable, keystone, jewel };
}

// The sheets of the icons and frames, kept whole (tools/make-data.py): the page is drawn again once
// they have loaded.
const TREE_ART = Object.fromEntries(["skills", "skills-disabled", "frame"].map(name => {
  const image = new Image();
  image.onload = () => {
    if (artReady()) renderSheet();
  };
  image.src = `pathweaver/img/tree/${name}.webp`;
  return [name, image];
}));
const artReady = () => Object.values(TREE_ART).every(sheet => sheet.complete && sheet.naturalWidth > 0);
// The icons replace the shapes once the frame of a small passive is this many pixels wide (the owner,
// 2026-11-19): nearly always, the shapes only when the tree is zoomed out past the build.
const ICONS_FROM = 2;
// The frames of a kind of passive (TREE.sheets.frames), in the tree and in an ascendancy (any graph but
// the tree itself); the class starts keep the shapes of the style.
const FRAME_OF = { small: "small", attribute: "small", notable: "notable", keystone: "keystone", jewel: "jewel" };
const ASCENDANCY_FRAME_OF = { small: "ascendancySmall", attribute: "ascendancySmall", notable: "ascendancyNotable", start: "ascendancyStart" };
const frameOf = (graph, node) => TREE.sheets.frames[(graph === TREE ? FRAME_OF : ASCENDANCY_FRAME_OF)[TREE.kinds[node[2]]]];

// Draws the icon of a passive, then its frame, centred on x, y; `size` is the screen pixels per
// pixel of the sheets.
function drawArt(context, frames, iconIndex, taken, x, y, size) {
  const icon = TREE.sheets.icons[iconIndex];
  const put = (sheet, [sx, sy, w, h]) => context.drawImage(sheet, sx, sy, w, h, x - (w * size) / 2, y - (h * size) / 2, w * size, h * size);
  if (icon) put(TREE_ART[taken ? "skills" : "skills-disabled"], icon);
  put(TREE_ART.frame, frames[taken ? 1 : 0]);
}

// The portraits under the ascendancy (tools/make-data.py), by ascendancy id: the tree is drawn again
// once one has loaded. Their radius, in units of the game, keeps them inside the frames of the class
// starts (1,443 units from the centre, their frames about 50 units wide); in colour, at 40 % (2i2, the
// owner, 2026-11-20).
const PORTRAITS = {};
function portraitOf(id) {
  if (!PORTRAITS[id]) {
    PORTRAITS[id] = new Image();
    PORTRAITS[id].onload = () => mountTrees();
    PORTRAITS[id].src = `pathweaver/img/portraits-large/${id}.webp`;
  }
  return PORTRAITS[id];
}
const PORTRAIT_RADIUS = 1380;
const PORTRAIT_OPACITY = 0.4;

// Draws a portrait at the centre of the tree, faded.
function drawPortrait(context, screen, scale, portrait) {
  if (!portrait.complete || portrait.naturalWidth === 0) return;
  const [x, y] = screen([0, 0]), radius = PORTRAIT_RADIUS * scale;
  context.save();
  context.globalAlpha = PORTRAIT_OPACITY;
  context.drawImage(portrait, x - radius, y - radius, radius * 2, radius * 2);
  context.restore();
}

// Options: the smallest radius of a shape, the frame from which the icons show, the weapon sets of the
// passives (setMasks) and the look of the links of each set (js/tree-motion.js); `clear` false draws
// over what the canvas holds (the ascendancy over the tree), `under` draws before the links (the
// portrait).
function drawTree(canvas, graph, states, view, { minRadius = 1.5, iconsFromPx = ICONS_FROM, sets = null, look = restingLook(1), clear = true, under = null } = {}) {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  const context = canvas.getContext("2d");
  const colour = name => token(canvas, name);
  const number = (name, fallback) => Number.parseFloat(colour(name)) || fallback;
  const shapes = shapeOf(canvas);
  const glow = number("--tree-glow", 0), glowColour = colour("--tree-glow-colour");
  const screen = ([x, y]) => [(x - view.x) * view.scale + width / 2, (y - view.y) * view.scale + height / 2];
  if (clear) {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    // A style with a pattern behind the window leaves the canvas transparent, so that it shows.
    context.clearRect(0, 0, width, height);
    const background = colour("--tree-background");
    if (background !== "transparent") {
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
    }
    under?.(context, screen, view.scale);
  }
  const lit = on => {
    context.shadowBlur = on ? glow : 0;
    context.shadowColor = on && glow > 0 ? glowColour : "transparent";
  };

  // The links: dimmed, then faded between passives taken later (solid, the owner, 2026-11-19), then lit
  // between passives taken, those of one weapon set alone in its colour, the set away from the switch
  // faint; while a wave runs (js/tree-motion.js), the part it has reached drawn strong over its set.
  const takenWidth = number("--tree-edge-width", 2);
  const setLayer = set => [2, set, colour(`--tree-set-${set}`), takenWidth * look[set].width, look[set].alpha, null];
  const linkLayers = [
    [0, 3, colour("--tree-edge"), 1, 1, null],
    [1, 3, colour("--tree-later"), 1, 1, null],
    [2, 3, colour("--tree-edge-taken"), takenWidth, 1, null],
    setLayer(1),
    setLayer(2),
    ...(look.wave ? [[2, look.wave.set, colour(`--tree-set-${look.wave.set}`), takenWidth, 1, look.wave]] : []),
  ];
  const setOf = (a, b) => (sets ? sets[a] & sets[b] || 3 : 3);
  for (const [layer, set, stroke, lineWidth, alpha, wave] of linkLayers) {
    context.beginPath();
    for (const [a, b] of graph.edges) {
      const both = Math.min(states[a] === 3 ? 2 : states[a], states[b] === 3 ? 2 : states[b]);
      if (both !== layer || (layer === 2 && setOf(a, b) !== set)) continue;
      const part = wave ? reachedPart(wave, a, b) : [a, b, 1];
      if (!part) continue;
      const [from, to, fraction] = part;
      const [ax, ay] = screen(graph.nodes[from]), [bx, by] = screen(graph.nodes[to]);
      context.moveTo(ax, ay);
      context.lineTo(ax + (bx - ax) * fraction, ay + (by - ay) * fraction);
    }
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.globalAlpha = alpha;
    lit(layer === 2);
    context.stroke();
  }
  context.globalAlpha = 1;

  // The passives, by state, so that each state is one path.
  const fills = { none: colour("--tree-node"), later: colour("--tree-node"), taken: colour("--tree-taken"), new: colour("--tree-taken") };
  const strokes = { none: colour("--tree-node-line"), later: colour("--tree-later"), taken: colour("--tree-taken"), new: colour("--tree-taken") };
  // The pixels of the screen per pixel of the sheets, and whether the icons are drawn at this zoom.
  const size = view.scale / TREE.sheets.scale;
  const art = artReady() && TREE.sheets.frames.small[0][2] * size >= iconsFromPx;
  const visible = ([x, y], margin) => x > -margin && y > -margin && x < width + margin && y < height + margin;
  const radiusOf = node => {
    const frames = art && frameOf(graph, node);
    return frames ? (frames[0][2] * size) / 2 : Math.max(minRadius, NODE_RADIUS[TREE.kinds[node[2]]] * view.scale);
  };
  if (art) {
    context.imageSmoothingQuality = "high";
    for (const [index, node] of graph.nodes.entries()) {
      const frames = frameOf(graph, node), at = screen(node);
      if (frames && visible(at, 60)) drawArt(context, frames, node[3], states[index] >= 2, ...at, size);
    }
  }
  for (const [state, name] of NODE_STATES.entries()) {
    context.beginPath();
    for (const [index, node] of graph.nodes.entries()) {
      if (states[index] !== state || (art && frameOf(graph, node))) continue;
      const [x, y] = screen(node);
      if (!visible([x, y], 20)) continue;
      shapes[TREE.kinds[node[2]]](context, x, y, radiusOf(node));
    }
    context.fillStyle = fills[name];
    lit(state >= 2);
    context.fill();
    lit(false);
    context.strokeStyle = strokes[name];
    context.lineWidth = 1;
    context.stroke();
  }

  // What is new at this level: a ring of the accent; how many, the box « New at N » says (2i).
  const fresh = graph.nodes.filter((_, index) => states[index] === 3);
  if (fresh.length === 0) return;
  context.strokeStyle = colour("--accent");
  context.lineWidth = 2;
  context.shadowBlur = glow;
  context.shadowColor = glow > 0 ? colour("--accent") : "transparent";
  context.beginPath();
  for (const node of fresh) {
    const [x, y] = screen(node);
    const radius = radiusOf(node) + 5;
    context.moveTo(x + radius, y);
    context.arc(x, y, radius, 0, Math.PI * 2);
  }
  context.stroke();
  lit(false);
}

// Draws the tree of the build at a level: the portrait, the tree, then the ascendancy over them; `look`
// is the look of the links of each set (js/tree-motion.js).
function drawBuildTree(canvas, view, level, look) {
  const states = treeStates(TREE.taken, TREE.nodes.length, level);
  const sets = setMasks(TREE.taken, TREE.nodes.length);
  const portrait = portraitOf(BUILDS.shown.portrait);
  const under = (context, screen, scale) => drawPortrait(context, screen, scale, portrait);
  drawTree(canvas, TREE, states, view, { sets, look: look.wave ? withDepths(look, states, sets) : look, under });
  const ascendancy = TREE.ascendancy;
  drawTree(canvas, ascendancy, treeStates(TREE.ascendancyTaken, ascendancy.nodes.length, level), view, { clear: false });
}

// The views of the main trees, by their data-view: each window keeps its own (the page at 960 px, the
// Tree tab at 1,600 px), fitted to its canvas the first time it is drawn.
STATE.treeViews = {};
const viewOf = canvas => STATE.treeViews[canvas.dataset.view];
// Every passive of the build (every set, every level, the ascendancy too), which the view fits.
const buildPoints = () => [...TREE.taken.map(([i]) => TREE.nodes[i]), ...TREE.ascendancyTaken.map(([i]) => TREE.ascendancy.nodes[i])];
const fittedView = canvas => fitView(buildPoints(), canvas.clientWidth, canvas.clientHeight, 80);

// Draws every canvas of the tree on the page, and lets the main ones move and zoom; a canvas with a
// data-scale is a fixed view of the centre of the tree, at its data-level.
function mountTrees() {
  drawCentreTrees();
  for (const canvas of mainTrees()) {
    STATE.treeViews[canvas.dataset.view] ??= fittedView(canvas);
    drawMainTree(canvas, performance.now());
    canvas.onwheel = event => {
      event.preventDefault();
      zoomTree(canvas, event.deltaY < 0 ? 1.2 : 1 / 1.2, "wheel", event.offsetX, event.offsetY);
    };
    canvas.onpointerdown = event => {
      canvas.setPointerCapture(event.pointerId);
      stopZoom(canvas);
      let [lastX, lastY] = [event.clientX, event.clientY];
      canvas.onpointermove = move => {
        const view = viewOf(canvas);
        view.x -= (move.clientX - lastX) / view.scale;
        view.y -= (move.clientY - lastY) / view.scale;
        [lastX, lastY] = [move.clientX, move.clientY];
        askDrawing(canvas);
      };
      canvas.onpointerup = () => { canvas.onpointermove = null; };
    };
  }
}

const mainTrees = () => document.querySelectorAll('canvas[data-tree="main"]');
function drawCentreTrees() {
  for (const canvas of document.querySelectorAll('canvas[data-tree="centre"]')) {
    drawBuildTree(canvas, { x: 0, y: 0, scale: Number(canvas.dataset.scale) }, Number(canvas.dataset.level), restingLook(STATE.set));
  }
}

// Draws a main tree at a moment, its zoom and the switch of its set where their motion is.
function drawMainTree(canvas, now) {
  moveZoom(canvas, now);
  drawBuildTree(canvas, viewOf(canvas), STATE.level, setLookAt(now));
}

// A move, a turn of the wheel or a motion asks for a drawing; the screen draws at most one per frame,
// and again at the next while a motion of that tree runs. Only these drawings are counted, not those of
// the page drawn again.
const ASKED = new Set();
function askDrawing(canvas) {
  if (ASKED.size === 0) requestAnimationFrame(drawAsked);
  ASKED.add(canvas);
}
function drawAsked(now) {
  const canvases = [...ASKED];
  ASKED.clear();
  for (const canvas of canvases) {
    if (!canvas.isConnected) continue;
    const start = performance.now();
    drawMainTree(canvas, now);
    const meter = canvas.parentElement.querySelector(".app-fps");
    if (meter) countFrame(meter, performance.now() - start);
    if (moving(canvas, now)) askDrawing(canvas);
  }
}

// The counter of frames per second (2i3): the drawings of the last second while the tree moves, and the
// time the script takes to draw once, the mean of the last 30 (the browser paints after it). Written into
// its element at once, without drawing the page again.
const FRAMES = { times: [], costs: [] };
function countFrame(meter, cost) {
  const now = performance.now();
  FRAMES.times = [...FRAMES.times.filter(time => now - time < 1000), now];
  FRAMES.costs = [...FRAMES.costs.slice(-29), cost];
  const mean = FRAMES.costs.reduce((sum, c) => sum + c, 0) / FRAMES.costs.length;
  meter.textContent = `${FRAMES.times.length} fps · script ${mean.toFixed(1)} ms`;
}

AFTER_RENDER.push(mountTrees);
// The controls act on the tree of their own window; the zoom and the set move without drawing the page
// again, so that their motion runs (js/tree-motion.js).
const canvasOf = element => element.closest(".app-tree").querySelector('canvas[data-tree="main"]');
ACTIONS["tree-zoom"] = element => {
  zoomTree(canvasOf(element), element.dataset.zoom === "in" ? 1.4 : 1 / 1.4, "button");
  return false;
};
ACTIONS["tree-fit"] = element => {
  fitTree(canvasOf(element));
  return false;
};
ACTIONS["tree-set"] = element => {
  switchSet(Number(element.dataset.set));
  return false;
};
