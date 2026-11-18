// The fluid of the graph paper (2l, the owner, 2026-11-18: « like on sylent.art »), after
// src/scripts/grid-fluid.ts of sylent.art, in the accent instead of its orange.
//
// Under the pointer, a fluid runs along the lines of the grid. Each crossing holds some energy:
// the pointer pours energy into the crossings around it as it moves, the energy spreads to the
// neighbour crossings and fades, and each line glows with the energy of its two ends. A host marks
// itself with data-home-fluid; the fluid is drawn in a canvas placed over its grid (.home-fluid).
// « Fluid lines » sets the cell: the main lines of the paper, or every line.

const FLUID_CELLS = { main: 48, every: 12 };
const fluids = new Map();   // the canvas of each host drawn, and its state

function fluidOf(host) {
  let canvas = host.querySelector(":scope > .home-fluid");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "home-fluid";
    canvas.setAttribute("aria-hidden", "true");
    host.querySelector(":scope > .home-drop-mark")?.after(canvas) ?? host.prepend(canvas);
  }
  const cell = FLUID_CELLS[chosen.fluidLines] ?? 48;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  let fluid = fluids.get(canvas);
  if (!fluid || fluid.cell !== cell || fluid.width !== width || fluid.height !== height) {
    const ratio = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const columns = Math.ceil(width / cell) + 1, rows = Math.ceil(height / cell) + 1;
    const accent = getComputedStyle(host).getPropertyValue("--accent").trim();
    const rgb = [1, 3, 5].map(i => parseInt(accent.slice(i, i + 2), 16)).join(" ");
    fluid = { canvas, context, cell, width, height, columns, rows, rgb, pointer: null,
      energy: new Float32Array(columns * rows), next: new Float32Array(columns * rows) };
    fluids.set(canvas, fluid);
  }
  return fluid;
}

const fluidOn = () => chosen.homePointer !== "light" && !lessMotion();

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
    const fluid = fluidOf(host);   // made again when « Fluid lines » or the size changed
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
    const reach = cell * 1.6;
    for (let row = Math.max(0, Math.floor((y - reach) / cell)); row <= Math.min(rows - 1, Math.ceil((y + reach) / cell)); row++) {
      for (let column = Math.max(0, Math.floor((x - reach) / cell)); column <= Math.min(columns - 1, Math.ceil((x + reach) / cell)); column++) {
        const distance = Math.hypot(column * cell - x, row * cell - y);
        if (distance < reach) energy[row * columns + column] = Math.min(1, energy[row * columns + column] + amount * (1 - distance / reach));
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

function fluidStep(fluid) {
  if (fluids.get(fluid.canvas) !== fluid) return;   // replaced, or its window drawn again
  const { columns, rows, cell, context } = fluid;
  // Spread: each crossing moves toward the mean of its neighbours, then fades a little.
  let total = 0;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const index = row * columns + column, energy = fluid.energy;
      let sum = 0, count = 0;
      if (column > 0) { sum += energy[index - 1]; count++; }
      if (column < columns - 1) { sum += energy[index + 1]; count++; }
      if (row > 0) { sum += energy[index - columns]; count++; }
      if (row < rows - 1) { sum += energy[index + columns]; count++; }
      const value = (energy[index] + (sum / count - energy[index]) * 0.42) * 0.968;
      fluid.next[index] = value < 0.004 ? 0 : value;
      total += fluid.next[index];
    }
  }
  [fluid.energy, fluid.next] = [fluid.next, fluid.energy];
  context.clearRect(0, 0, fluid.width, fluid.height);
  // A soft wide stroke for the glow, then the thin line itself.
  for (const [lineWidth, alpha] of [[4, 0.22], [1, 1]]) {
    context.lineWidth = lineWidth;
    context.globalAlpha = alpha;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const index = row * columns + column, energy = fluid.energy;
        const x = column * cell + 0.5, y = row * cell + 0.5;
        if (column < columns - 1) fluidLine(fluid, x, y, x + cell, y, energy[index], energy[index + 1]);
        if (row < rows - 1) fluidLine(fluid, x, y, x, y + cell, energy[index], energy[index + columns]);
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
