// What Pathweaver does, on the drop zone of E1b (2l, the owner, 2026-11-18: « il manque juste une
// phrase »): of nine ways, the owner kept the notes of a plan (E3): the three things a build shows
// drawn around the zone, their lines reaching it. Above the zone, a title, large (the owner,
// 2026-11-18: « plus en avant, comme un gros titre »), the game named small over it; its words, its
// font, its case, its size and its spacing chosen by the owner (2026-11-18; css/home-line.css).
// The notes and the game are in white and grey, never in the accent: the accent is the colour of
// the links, and they can't be clicked (the owner, 2026-11-18).

const HOME_TITLE = "Weave your path to level 100";
const HOME_SHOWS = ["The passive tree", "The skills", "The gear"];

const homeTitle = () => `<div class="home-title">
    <span class="home-title-game">Path of Exile 2</span>
    <h1>${HOME_TITLE}</h1>
  </div>`;

const homeNotes = () => `<div class="home-notes" aria-hidden="true">${HOME_SHOWS.map((name, index) =>
  `<span class="home-note home-note-${index + 1}" style="--note:${index}"><b>${name}</b><i></i></span>`).join("")}</div>`;
