// The twenty variants of the level band (2g, the owner, 2026-11-18), one section per temperature,
// the normal one on top; each under the header of the build, as on the page. One level for all:
// a click in one moves the others.

const TEMPERATURES = [
  ["free", "Free, explorations"],
  ["explosive", "An explosive temperature"],
  ["high", "A high temperature"],
  ["normal", "A normal temperature"],
];

for (const [temperature, title] of TEMPERATURES) {
  addSection(() => {
    const variants = LEVEL_VARIANTS.filter(variant => variant.temperature === temperature);
    return [`The level band · ${variants[0].n} to ${variants.at(-1).n}, ${title.toLowerCase()}: click ◀ ▶, the track or a marker; one level for all`,
      variants.map(variant => [`L${variant.n} · ${variant.name}: ${variant.note}`,
        `<div class="app-window" style="width:960px">${buildHeader()}${variant.render(levelContext())}</div>`])];
  });
}
