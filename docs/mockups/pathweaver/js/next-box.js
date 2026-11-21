// The box of What's next (2k6, specs.md, Window layout: the band of the site): the two updates to come, The
// Editor Update (version 2) and The Community Update (version 3, French with it), each a card with an image of
// the game behind it (the portraits of the ascendancies, the icons of the passives: specs.md, Images), so that the
// box makes one want them (the owner, 2026-11-21: « faut donner envie »). Of twelve ways at four temperatures, the
// owner kept V3, one panel in the middle of the window whose halves open from the seam, with the icons of passives
// of V9 rising behind it (2026-11-21); its look and its motion in css/next-box.css.

const UPDATES = [
  { key: "editor", version: 2, name: "The Editor Update", line: "Plan your own build",
    art: ["sorceress1"],
    items: ["Passives allocated on the tree", "Gems and their supports chosen", "Your hints, level by level", "Exported as a .build for the game"] },
  { key: "community", version: 3, name: "The Community Update", line: "Share it with every exile",
    art: ["huntress1", "sorceress3", "warrior2", "sorceress1"],
    items: ["Your builds published", "Short links, for a chat", "Votes and search, by ascendancy", "The versions of a build", "In French too"] },
];
const NEXT_FOOT = "Until then, a build is shared as its .build file.";
// The window whose box is open (its data-next-case), or false.
STATE.nextOpen = false;

// The icon of a notable passive of the tree, from the sheet of the icons (js/tree.js reads the same sheet):
// the `n`-th notable that has one, `size` pixels.
const NOTABLE_ICONS = (() => {
  const seen = new Set();
  return TREE.nodes.filter(([, , kind, icon]) => TREE.kinds[kind] === "notable" && icon >= 0 && !seen.has(icon) && seen.add(icon)).map(node => node[3]);
})();
function passiveIcon(n, size) {
  const [x, y, w] = TREE.sheets.icons[NOTABLE_ICONS[n % NOTABLE_ICONS.length]];
  const s = size / w;
  return `<span class="nx-icon" style="width:${size}px;height:${size}px;background-position:${-x * s}px ${-y * s}px;background-size:${1029 * s}px ${1508 * s}px"></span>`;
}

// The art of a card: one portrait large, or the four of the community side by side.
const updateArt = update => `<div class="nx-art ${update.art.length > 1 ? "is-many" : ""}">${update.art.map(key =>
  `<img src="pathweaver/img/portraits-about/${key}.webp" alt="">`).join("")}</div>`;
const updateCard = (update, index) => `<article class="nx-card is-${update.key}" style="--i:${index}">
  <div class="nx-face">
    ${updateArt(update)}
    <div class="nx-body">
      <p class="nx-version">Version ${update.version}</p>
      <h3 class="nx-name app-title">${update.name}</h3>
      <p class="nx-line">${update.line}</p>
      <ul class="nx-items">${update.items.map((item, row) => `<li style="--row:${row}">${item}</li>`).join("")}</ul>
    </div>
  </div>
</article>`;
const updateCards = () => UPDATES.map(updateCard).join("");
// The icons of passives that rise behind the halves, without end, each from its own place and at its own moment.
const nextMotes = () => `<div class="nx-motes" aria-hidden="true">${Array.from({ length: 14 }, (_, i) =>
  `<span style="--m:${i};left:${(i * 53) % 100}%">${passiveIcon(i, 18 + (i % 3) * 6)}</span>`).join("")}</div>`;
// The box: × at its corner, the icons rising, the two halves, the line under them.
const nextBox = () => `<div class="nx" role="dialog" aria-label="What's next">
  <button type="button" class="nx-close" data-action="next-close" aria-label="Close">${icon(12, ICONS.close)}</button>
  ${nextMotes()}<div class="nx-halves">${updateCards()}</div><p class="nx-foot">${NEXT_FOOT}</p>
</div>`;

// Esc, or a click outside the box and its link, closes it.
ACTIONS["next-toggle"] = (element, event) => {
  event.preventDefault();   // a link of the band, whose # would scroll the page to its top
  const owner = element.closest("[data-next-case]");
  if (!owner) return false;
  STATE.nextOpen = STATE.nextOpen === owner.dataset.nextCase ? false : owner.dataset.nextCase;
  STATE.changesOpen = false;
  STATE.buildsMenu = false;
  STATE.downloadOpen = false;
  return true;
};
ACTIONS["next-close"] = () => {
  STATE.nextOpen = false;
  return true;
};
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && STATE.nextOpen !== false) {
    STATE.nextOpen = false;
    renderSheet();
  }
});
document.addEventListener("click", event => {
  if (STATE.nextOpen === false || event.target.closest(".nx, [data-action='next-toggle']")) return;
  STATE.nextOpen = false;
  renderSheet();
});
