// The fluid of the graph paper (2l, the owner, 2026-11-18: « like on sylent.art »), after
// src/scripts/grid-fluid.ts of sylent.art, in white instead of its orange (the owner, 2026-11-18;
// --home-fluid, css/home-drop.css).
//
// Under the pointer, a fluid runs along the lines of the grid. Each crossing holds some energy:
// the pointer pours energy into the crossings around it as it moves, the energy spreads to the
// neighbour crossings and fades, and each line glows with the energy of its two ends. A host marks
// itself with data-home-fluid; the fluid is drawn in a canvas placed over its grid (.home-fluid).
// It runs along the main lines of the paper, every 48 px (the owner, 2026-11-18).
//
// More organic, « like blood flowing in veins » (the owner, 2026-11-18), with « Volatility »: a
// network of veins is laid on the grid once (random walks along its lines, which branch), the
// same at each visit. The fluid poured off the veins fades fast; what reaches a vein runs along
// it, downstream, in surges at each beat of a heart (lub, dub), and the glow swells with the beat.
// The persistence sets how slowly the fluid fades in the veins. Tuned by the owner on sliders
// (2026-11-18): a volatility of 65 %, a persistence of 975; at 0 % and 968, the fluid of sylent.art.

const FLUID_VOLATILITY = 0.65, FLUID_PERSISTENCE = 0.975;

// A small seeded random, so that the veins are the same at each visit.
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The veins: for each crossing, the crossing downstream (-1 off the veins), and which crossings
// are on a vein. Random walks from random crossings, going straight, turning now and then, never
// back, and branching; a walk that meets a vein flows into it.
function veinsOf(columns, rows) {
  const random = seededRandom(columns * 1000 + rows);
  const down = new Int32Array(columns * rows).fill(-1);
  const onVein = new Uint8Array(columns * rows);
  const moves = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const walks = [];
  for (let k = 0; k < Math.round((columns + rows) / 2.5); k++) {
    walks.push([Math.floor(random() * columns), Math.floor(random() * rows), Math.floor(random() * 4), columns + rows]);
  }
  while (walks.length > 0) {
    let [column, row, direction, steps] = walks.pop();
    for (; steps > 0; steps--) {
      const turn = random();
      if (turn < 0.12) direction = (direction + 1) % 4;
      else if (turn < 0.24) direction = (direction + 3) % 4;
      const [dx, dy] = moves[direction];
      const toColumn = column + dx, toRow = row + dy;
      if (toColumn < 0 || toRow < 0 || toColumn >= columns || toRow >= rows) break;
      const from = row * columns + column, to = toRow * columns + toColumn;
      if (down[to] === from || down[from] !== -1) break;   // never back, never two ways out
      down[from] = to;
      onVein[from] = onVein[to] = 1;
      if (random() < 0.06) walks.push([toColumn, toRow, (direction + (random() < 0.5 ? 1 : 3)) % 4, Math.floor(steps / 2)]);
      [column, row] = [toColumn, toRow];
    }
  }
  return { down, onVein };
}
const fluids = new Map();   // the canvas of each host drawn, and its state

function fluidOf(host) {
  let canvas = host.querySelector(":scope > .home-fluid");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "home-fluid";
    canvas.setAttribute("aria-hidden", "true");
    host.querySelector(":scope > .home-drop-mark")?.after(canvas) ?? host.prepend(canvas);
  }
  const cell = parseFloat(getComputedStyle(host).getPropertyValue("--home-grid"));   // css/home-drop.css
  const width = canvas.clientWidth, height = canvas.clientHeight;
  let fluid = fluids.get(canvas);
  if (!fluid || fluid.width !== width || fluid.height !== height) {
    const ratio = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const columns = Math.ceil(width / cell) + 1, rows = Math.ceil(height / cell) + 1;
    const ink = getComputedStyle(host).getPropertyValue("--home-fluid").trim();   // a #rrggbb
    const rgb = [1, 3, 5].map(i => parseInt(ink.slice(i, i + 2), 16)).join(" ");
    fluid = { canvas, context, cell, width, height, columns, rows, rgb, pointer: null, ...veinsOf(columns, rows),
      energy: new Float32Array(columns * rows), next: new Float32Array(columns * rows), flow: new Float32Array(columns * rows) };
    fluids.set(canvas, fluid);
  }
  return fluid;
}

const fluidOn = () => !lessMotion();

function mountFluids() {
  for (const canvas of [...fluids.keys()]) if (!canvas.isConnected) fluids.delete(canvas);
  if (!fluidOn()) return;
  for (const host of document.querySelectorAll("[data-home-fluid]")) fluidOf(host);
}
AFTER_RENDER.push(mountFluids);

// Pour energy into the crossings within 1.6 cells of the pointer, more as it moves faster.
addEventListener("pointermove", event => {
  if (!fluidOn()) return;
  for (const host of document.querySelectorAll("[data-home-fluid]")) {
    const fluid = fluidOf(host);   // made again when the size changed
    const box = fluid.canvas.getBoundingClientRect();
    const x = event.clientX - box.left, y = event.clientY - box.top;
    if (x < 0 || y < 0 || x > box.width || y > box.height) {
      fluid.pointer = null;
      continue;
    }
    const moved = fluid.pointer ? Math.hypot(x - fluid.pointer.x, y - fluid.pointer.y) : 0;
    fluid.pointer = { x, y };
    const { cell, columns, rows, energy } = fluid;
    const amount = Math.min(0.9, 0.12 + moved / 60);
    const volatility = FLUID_VOLATILITY;
    const reach = cell * 1.6;
    for (let row = Math.max(0, Math.floor((y - reach) / cell)); row <= Math.min(rows - 1, Math.ceil((y + reach) / cell)); row++) {
      for (let column = Math.max(0, Math.floor((x - reach) / cell)); column <= Math.min(columns - 1, Math.ceil((x + reach) / cell)); column++) {
        const distance = Math.hypot(column * cell - x, row * cell - y);
        const uneven = 1 + volatility * (Math.random() - 0.5) * 1.6;
        if (distance < reach) energy[row * columns + column] = Math.min(1, energy[row * columns + column] + amount * uneven * (1 - distance / reach));
      }
    }
    if (!fluid.running) {
      fluid.running = true;
      requestAnimationFrame(() => fluidStep(fluid));
    }
  }
});

function fluidLine(fluid, x1, y1, x2, y2, a, b) {
  if (a + b < 0.02) return;
  const { context, rgb } = fluid;
  const gradient = context.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, `rgb(${rgb} / ${Math.min(1, a * 1.3)})`);
  gradient.addColorStop(1, `rgb(${rgb} / ${Math.min(1, b * 1.3)})`);
  context.strokeStyle = gradient;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

// A heart at 72 beats a minute: a strong beat (lub), then a weaker one (dub), then the rest; 0 to 1.
function heartbeat(time) {
  const phase = time % (60 / 72);
  const bump = (at, width) => Math.exp(-(((phase - at) / width) ** 2));
  return Math.min(1, bump(0.05, 0.05) + 0.6 * bump(0.25, 0.05));
}

function fluidStep(fluid) {
  if (fluids.get(fluid.canvas) !== fluid) return;   // replaced, or its window drawn again
  const { columns, rows, cell, context } = fluid;
  // Spread: each crossing moves toward the weighted mean of its neighbours, then fades: in a vein
  // at the persistence, off the veins faster as the volatility grows, so that the fluid stays in
  // the veins.
  const volatility = FLUID_VOLATILITY;
  const fade = FLUID_PERSISTENCE;
  const fadeOff = fade - volatility * 0.12;
  const time = performance.now() / 1000;
  const { onVein, down } = fluid;
  const energy = fluid.energy, next = fluid.next, flow = fluid.flow;
  let total = 0;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const index = row * columns + column;
      let sum = 0, weights = 0;
      const take = neighbour => {
        // The veins and the rest of the grid hardly exchange as the volatility grows: a vein keeps
        // its fluid, and doesn't feed the grid around it.
        const w = onVein[neighbour] === onVein[index] ? 1 : Math.max(0, 1 - volatility * 1.6);
        sum += energy[neighbour] * w;
        weights += w;
      };
      if (column > 0) take(index - 1);
      if (column < columns - 1) take(index + 1);
      if (row > 0) take(index - columns);
      if (row < rows - 1) take(index + columns);
      const mean = weights > 0 ? sum / weights : energy[index];
      const spread = onVein[index] ? 0.05 : 0.42;   // a surge keeps its shape along a vein
      const flicker = 1 + volatility * (Math.random() - 0.5) * 0.06;
      const value = (energy[index] + (mean - energy[index]) * spread) * (onVein[index] ? fade : fadeOff) * flicker;
      next[index] = value < 0.004 ? 0 : Math.min(1, value);
    }
  }
  // The flow: each crossing of a vein hands part of its energy to the next one downstream, much
  // more at each beat; through a buffer, so that the fluid moves at most one crossing a frame.
  const pulse = heartbeat(time);
  flow.fill(0);
  for (let index = 0; index < next.length; index++) {
    if (next[index] < 0.01 || down[index] < 0) continue;
    const move = next[index] * volatility * (0.04 + 0.25 * pulse);   // about 3 crossings a second, more at a beat
    flow[index] -= move;
    flow[down[index]] += move;
  }
  for (let index = 0; index < next.length; index++) next[index] = Math.min(1, Math.max(0, next[index] + flow[index]));
  for (let index = 0; index < next.length; index++) total += next[index];
  [fluid.energy, fluid.next] = [fluid.next, fluid.energy];
  context.clearRect(0, 0, fluid.width, fluid.height);
  // A soft wide stroke for the glow, then the thin line itself.
  const swell = 1 + volatility * 0.6 * pulse;
  // A line that touches a vein without being one of its segments dims with the volatility, so
  // that the veins read as paths rather than as crosses.
  const dim = (a, b) => (onVein[a] || onVein[b]) && down[a] !== b && down[b] !== a ? 1 - volatility * 0.95 : 1;
  for (const [lineWidth, alpha] of [[4 * swell, 0.22 * swell], [1, 1]]) {
    context.lineWidth = lineWidth;
    context.globalAlpha = alpha;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const index = row * columns + column, energy = fluid.energy;
        const x = column * cell + 0.5, y = row * cell + 0.5;
        if (column < columns - 1) {
          const k = dim(index, index + 1);
          fluidLine(fluid, x, y, x + cell, y, energy[index] * k, energy[index + 1] * k);
        }
        if (row < rows - 1) {
          const k = dim(index, index + columns);
          fluidLine(fluid, x, y, x, y + cell, energy[index] * k, energy[index + columns] * k);
        }
      }
    }
  }
  context.globalAlpha = 1;
  // Stop once the fluid is gone: energy only comes with the pointer, which starts the loop again.
  if (total > 0.01) requestAnimationFrame(() => fluidStep(fluid));
  else {
    fluid.running = false;
    context.clearRect(0, 0, fluid.width, fluid.height);
  }
}
