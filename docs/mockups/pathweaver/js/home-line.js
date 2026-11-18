// The line that says what Pathweaver does, on the drop zone of E1b (2l, the owner, 2026-11-18: « il
// manque juste une phrase »), in nine ways, three at each temperature, on Frost Night; « Line » at
// the top of the page shows one. Each window holds the nine, and the CSS shows the one chosen
// (css/home-line.css), so that the list applies at once; a motion starts again when shown.
// - normal: N1 above the zone; N2 a caption on its left edge, the game named first; N3 in the band;
// - high: H1 in the condensed letters of the brand; H2 over a ruler of the levels 1 to 100; H3 a
//   title block of a drawing, on the top right corner of the zone;
// - explosive: E1 typed, letter by letter; E2 lit by a pulse, like the veins of the paper; E3 the
//   three things it shows drawn as notes of a plan, their lines reaching the zone.

const LINE = {
  whole: "Your Path of Exile 2 build, level by level: the passive tree, the skills and the gear.",
  head: "Your build, level by level",
  game: "Path of Exile 2",
  shows: ["The passive tree", "The skills", "The gear"],
};

// Where each variant goes: above the zone, in the band, or on the zone itself (its stage).
const homeLineAbove = () => `
  <p class="home-line home-line-n1">${LINE.whole}</p>
  <div class="home-line home-line-n2"><span>${LINE.game}</span><p>${LINE.head}: ${LINE.shows.join(", ").toLowerCase().replace(/, (?!.*, )/, " and ")}.</p></div>
  <div class="home-line home-line-h1"><b>${LINE.head}</b><span>${LINE.game} · ${LINE.shows.join(" · ").toLowerCase()}</span></div>
  <div class="home-line home-line-h2"><p>${LINE.whole}</p><div class="home-ruler" aria-hidden="true">${
    [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(level => `<span style="left:${(level - 1) / 99 * 100}%">${level}</span>`).join("")}</div></div>
  <p class="home-line home-line-e1"><span style="--letters:${LINE.whole.length}">${LINE.whole}</span></p>
  <p class="home-line home-line-e2">${LINE.whole}</p>
  <p class="home-line home-line-e3">${LINE.head}, in ${LINE.game}</p>`;

const homeLineBand = () => `<span class="home-line home-line-n3">${LINE.head}, in ${LINE.game}</span>`;

const homeLineStage = () => `
  <dl class="home-line home-line-h3">
    <div><dt>Shows</dt><dd>${LINE.head}</dd></div>
    <div><dt>Game</dt><dd>${LINE.game}</dd></div>
    <div><dt>Sheets</dt><dd>${LINE.shows.map(name => name.replace("The ", "")).join(" · ")}</dd></div>
  </dl>
  <div class="home-line home-line-e3" aria-hidden="true">${LINE.shows.map((name, index) =>
    `<span class="home-note home-note-${index + 1}" style="--note:${index}"><b>${name}</b><i></i></span>`).join("")}</div>`;
