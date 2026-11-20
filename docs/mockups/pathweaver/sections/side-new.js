// « New at N », twelve variants (2j): each in the right column of the Overview at the level of the
// band above, then alone on the respec at 65 (21 changes) and at a level without change.

const SIDE_NEW_CASES = [
  ["shown", () => STATE.level, "At the level of the band, in the column"],
  ["respec", () => 65, "The respec at 65: 21 changes"],
  ["shown", () => 85, "At 85: nothing changes"],
];

function sideNewVariant(id) {
  const variant = SIDE_NEW_VARIANTS[id];
  const cases = SIDE_NEW_CASES.map(([key, level, label], index) => {
    const box = variant.box(newAt(key, level()), `${id}-${index}`);
    return `<p class="app-sn-case-label">${label}</p>${index === 0
      ? `<aside class="app-side app-sn-column">${box}${skillList(level())}${inventoryBox(level())}</aside>`
      : `<aside class="app-side app-sn-alone">${box || '<span class="app-weak">(no box)</span>'}</aside>`}`;
  }).join("");
  return `<div class="app-window app-sn-variant" style="width:330px"><p class="app-sn-text">${variant.text}</p>${cases}</div>`;
}

addSection(() => ["« New at N », twelve variants: the band moves the level of the first case; normal N1–N3, high H1–H3, explosive E1–E3, free F1–F3", [
  ["The level of the build: ◀ ▶, the track or ← →", `<div class="app-window app-sn-band" style="width:960px">${levelBand()}</div>`],
  ...Object.entries(SIDE_NEW_VARIANTS).map(([id, variant]) => [variant.title, sideNewVariant(id)]),
]]);
