// The passive tree, drawn in a canvas as the application will (docs/technical-choices.md):
// the 4,483 passives of the tree of the game at their real positions, moved with the mouse and
// zoomed with the wheel. At the level: the passives taken are lit, those taken later faded, the
// others dimmed, and those taken at this very level ringed with the accent (specs.md, Passive tree).
// Every colour is a token of the style, read from the CSS.

STATE.set = 1;
// The view of the tree: its centre in the coordinates of the game, and the pixels per unit.
STATE.treeView = null;

// The radius of each kind of passive (TREE.kinds), in units of the game.
const NODE_RADIUS = { small: 26, notable: 40, keystone: 58, jewel: 38, attribute: 26, start: 52 };
const NODE_STATES = ["none", "later", "taken", "new"];

// The state of every passive at the level, for the weapon set shown.
function treeStates(taken, count, level, set) {
  const states = new Uint8Array(count);
  for (const [index, low, high, s] of taken) {
    if (s !== 0 && s !== undefined && s !== set) continue;
    const state = low === level ? 3 : appliesAt([low, high], level) ? 2 : low > level ? 1 : 0;
    states[index] = Math.max(states[index], state);
  }
  return states;
}

// Fits the passives of the build (every set, every level) in the canvas.
function fitView(nodes, indices, width, height, margin) {
  const xs = indices.map(i => nodes[i][0]), ys = indices.map(i => nodes[i][1]);
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

function drawTree(canvas, graph, states, view, labelNew, minRadius = 1.5) {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const colour = name => token(canvas, name);
  const number = (name, fallback) => Number.parseFloat(colour(name)) || fallback;
  const shapes = shapeOf(canvas);
  const glow = number("--tree-glow", 0), glowColour = colour("--tree-glow-colour");
  const screen = ([x, y]) => [(x - view.x) * view.scale + width / 2, (y - view.y) * view.scale + height / 2];
  // A style with a pattern behind the window leaves the canvas transparent, so that it shows.
  context.clearRect(0, 0, width, height);
  const background = colour("--tree-background");
  if (background !== "transparent") {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }
  const lit = on => {
    context.shadowBlur = on ? glow : 0;
    context.shadowColor = on && glow > 0 ? glowColour : "transparent";
  };

  // The links: dimmed, then faded (dashed) between passives taken later, then lit between passives taken.
  const linkLayers = [
    [colour("--tree-edge"), [], 1],
    [colour("--tree-later"), [3, 3], 1],
    [colour("--tree-edge-taken"), [], number("--tree-edge-width", 2)],
  ];
  for (const [layer, [stroke, dash, lineWidth]] of linkLayers.entries()) {
    context.beginPath();
    for (const [a, b] of graph.edges) {
      const both = Math.min(states[a] === 3 ? 2 : states[a], states[b] === 3 ? 2 : states[b]);
      if (both !== layer) continue;
      const [ax, ay] = screen(graph.nodes[a]), [bx, by] = screen(graph.nodes[b]);
      context.moveTo(ax, ay);
      context.lineTo(bx, by);
    }
    context.strokeStyle = stroke;
    context.setLineDash(dash);
    context.lineWidth = lineWidth;
    lit(layer === 2);
    context.stroke();
  }
  context.setLineDash([]);

  // The passives, by state, so that each state is one path.
  const fills = { none: colour("--tree-node"), later: colour("--tree-node"), taken: colour("--tree-taken"), new: colour("--tree-taken") };
  const strokes = { none: colour("--tree-node-line"), later: colour("--tree-later"), taken: colour("--tree-taken"), new: colour("--tree-taken") };
  const radiusOf = node => Math.max(minRadius, NODE_RADIUS[TREE.kinds[node[2]]] * view.scale);
  for (const [state, name] of NODE_STATES.entries()) {
    context.beginPath();
    for (const [index, node] of graph.nodes.entries()) {
      if (states[index] !== state) continue;
      const [x, y] = screen(node);
      if (x < -20 || y < -20 || x > width + 20 || y > height + 20) continue;
      shapes[TREE.kinds[node[2]]](context, x, y, radiusOf(node));
    }
    context.fillStyle = fills[name];
    lit(state >= 2);
    context.fill();
    lit(false);
    context.strokeStyle = strokes[name];
    context.lineWidth = 1;
    context.setLineDash(name === "later" ? [2, 2] : []);
    context.stroke();
  }
  context.setLineDash([]);

  // What is new at this level: a ring of the accent, and how many beside them.
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
  if (labelNew) {
    const right = Math.max(...fresh.map(node => screen(node)[0]));
    const middle = fresh.reduce((sum, node) => sum + screen(node)[1], 0) / fresh.length;
    context.font = `600 13px ${colour("--font-text")}`;
    context.textBaseline = "middle";
    // A halo of the page, so that the links under the text don't cross it.
    context.lineWidth = 4;
    context.strokeStyle = colour("--page");
    context.strokeText(labelNew, right + 14, middle);
    context.fillStyle = colour("--accent");
    context.fillText(labelNew, right + 14, middle);
  }
}

// Draws every canvas of the tree on the page, and lets the main one move and zoom.
function mountTrees() {
  const level = STATE.level;
  for (const canvas of document.querySelectorAll("canvas[data-tree]")) {
    if (canvas.dataset.tree === "ascendancy") {
      const graph = TREE.ascendancy;
      const states = treeStates(TREE.ascendancyTaken.map(([i, low, high]) => [i, low, high, 0]), graph.nodes.length, level, 0);
      drawTree(canvas, graph, states, fitView(graph.nodes, graph.nodes.map((_, i) => i), canvas.clientWidth, canvas.clientHeight, 16), "", 3);
      continue;
    }
    const states = treeStates(TREE.taken, TREE.nodes.length, level, STATE.set);
    const fresh = TREE.taken.filter(([, low, , s]) => low === level && (s === 0 || s === STATE.set)).length;
    STATE.treeView ??= fitView(TREE.nodes, TREE.taken.map(([i]) => i), canvas.clientWidth, canvas.clientHeight, 80);
    const draw = () => drawTree(canvas, TREE, states, STATE.treeView, fresh > 0 ? `+${fresh} new at ${level}` : "");
    draw();
    canvas.onwheel = event => {
      event.preventDefault();
      zoomTree(canvas, event.deltaY < 0 ? 1.2 : 1 / 1.2, event.offsetX, event.offsetY);
      draw();
    };
    canvas.onpointerdown = event => {
      canvas.setPointerCapture(event.pointerId);
      let [lastX, lastY] = [event.clientX, event.clientY];
      canvas.onpointermove = move => {
        STATE.treeView.x -= (move.clientX - lastX) / STATE.treeView.scale;
        STATE.treeView.y -= (move.clientY - lastY) / STATE.treeView.scale;
        [lastX, lastY] = [move.clientX, move.clientY];
        draw();
      };
      canvas.onpointerup = () => { canvas.onpointermove = null; };
    };
  }
}

// Zooms around a point of the canvas, which stays under the pointer.
function zoomTree(canvas, factor, atX = canvas.clientWidth / 2, atY = canvas.clientHeight / 2) {
  const view = STATE.treeView;
  const [dx, dy] = [atX - canvas.clientWidth / 2, atY - canvas.clientHeight / 2];
  view.x += dx / view.scale - dx / (view.scale * factor);
  view.y += dy / view.scale - dy / (view.scale * factor);
  view.scale = Math.min(0.5, Math.max(0.005, view.scale * factor));
}

AFTER_RENDER.push(mountTrees);
ACTIONS["tree-zoom"] = element => {
  zoomTree(document.querySelector('canvas[data-tree="main"]'), element.dataset.zoom === "in" ? 1.4 : 1 / 1.4);
  return true;
};
ACTIONS["tree-set"] = element => {
  STATE.set = Number(element.dataset.set);
  return true;
};
