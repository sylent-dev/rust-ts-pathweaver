// The mark of a gem, twelve marks (2g3, the owner, 2026-11-19): each a skill and a support in the
// four colours at 8, 10, 12, 16 and 24 px, then rows of the window of what changes at the size of
// the slider « Gem size »; the list « Gem » applies one to every window of the page.

const GEM_SIZES = [8, 10, 12, 16, 24];
const GEM_SAMPLE_COLOURS = ["r", "g", "b", "w"];

function gemBoard(key) {
  const mark = GEM_MARKS[key];
  const line = kind => `<span>${kind === "skill" ? "Skill" : "Support"}</span>${GEM_SIZES.map(size =>
    `<span class="app-gem-cell">${GEM_SAMPLE_COLOURS.map(colour => gemMarkOf(mark, colour, kind, size)).join("")}</span>`).join("")}`;
  const row = (sign, body) => `<li><span class="app-wv-sign">${sign}</span><span>${body}</span></li>`;
  return `<div class="app-window app-gem-board">
    <div class="app-gem-sizes"><span></span>${GEM_SIZES.map(size => `<span>${size} px</span>`).join("")}${line("skill")}${line("support")}</div>
    <ul class="app-gem-rows">
      ${row("+", `${gemMarkOf(mark, "b", "skill")}<b>Cast on Critical</b> <span class="app-wv-detail">with ${gemMarkOf(mark, "b", "support")}Comet, ${gemMarkOf(mark, "r", "support")}Efficiency II</span>`)}
      ${row("+", `${gemMarkOf(mark, "g", "support")}<b>Dominus' Grasp</b> <span class="app-wv-detail">on Orb of Storms</span>`)}
      ${row("+", `${gemMarkOf(mark, "w", "support")}<b>Trickster's Shard</b> <span class="app-wv-detail">on Spark</span>`)}
      ${row("−", `${gemMarkOf(mark, "r", "skill")}<span class="app-wv-detail">Uhtred's Omen off Siphon Elements</span>`)}
    </ul></div>`;
}

addSection(() => ["The mark of a gem · twelve marks, three per temperature, a skill and a support in the four colours; « Gem » at the top applies one to every window, « Gem size » sets its size in the rows",
  Object.keys(GEM_MARKS).filter(key => key !== "square").map(key => [GEM_MARKS[key].title, gemBoard(key)])]);
