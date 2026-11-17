// Every pattern side by side, on the page of the style, as layer 1 (its colour and its size) but
// stronger, so that a pattern is chosen before it is tried behind the blocks.
addSection(() => ["Textures: every pattern, in the colour and the size of layer 1, at 35 %", [["", `<div class="page-swatches">${
  Object.entries(PATTERNS).filter(([key]) => key !== "none").map(([key, name]) =>
    `<div class="page-swatch"><span class="app-layer" style="--n-texture: var(--pattern-${key}); --n-ratio: var(--ratio-${key}, 1); --n-scale: var(--scale-${key}, 1)"></span><b>${name}</b></div>`).join("")
}</div>`]]]);
