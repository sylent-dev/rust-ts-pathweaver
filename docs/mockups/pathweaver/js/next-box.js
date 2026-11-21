// The box of What's next (2k6, specs.md, Window layout: the band of the site): the two updates to come, The
// Editor Update (version 2) and The Community Update (version 3, French with it), each a card with an image of
// the game behind it (the portraits of the ascendancies, the icons of the passives: specs.md, Images), so that the
// box makes one want them (the owner, 2026-11-21: « faut donner envie »). Twelve ways, three at each of four
// temperatures, on trial (sections/next-box.js, css/next-variants.css); their shared look in css/next-box.css.

const UPDATES = [
  { key: "editor", version: 2, name: "The Editor Update", line: "Plan your own build",
    art: ["sorceress1"],
    items: ["Passives allocated on the tree", "Gems and their supports chosen", "Your hints, level by level", "Exported as a .build for the game"] },
  { key: "community", version: 3, name: "The Community Update", line: "Share it with every exile",
    art: ["huntress1", "sorceress3", "warrior2", "sorceress1"],
    items: ["Your builds published", "Short links, for a chat", "Votes and search, by ascendancy", "The versions of a build", "In French too"] },
];
const NEXT_FOOT = "Until then, a build is shared as its .build file.";
// The window whose box is open (its data-next-case), or "all" while the section shows them all.
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
const updateCard = (update, index, { back = false } = {}) => `<article class="nx-card is-${update.key}" style="--i:${index}">
  ${back ? `<div class="nx-back">${logoMark(56)}<span>?</span></div>` : ""}
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
const updateCards = options => UPDATES.map((update, index) => updateCard(update, index, options)).join("");

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

// The pointer over a card tilts it (V6), and lifts the veil around it (V12): CSS variables, no drawing.
document.addEventListener("pointermove", event => {
  const card = event.target.closest?.(".nx.v6 .nx-card");
  if (card) {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--tilt-x", `${((event.clientY - r.top) / r.height - 0.5) * -10}deg`);
    card.style.setProperty("--tilt-y", `${((event.clientX - r.left) / r.width - 0.5) * 12}deg`);
    card.style.setProperty("--shine", `${((event.clientX - r.left) / r.width) * 100}%`);
  }
  const peek = event.target.closest?.(".nx.v12");
  if (peek) {
    const r = peek.getBoundingClientRect();
    peek.style.setProperty("--peek-x", `${event.clientX - r.left}px`);
    peek.style.setProperty("--peek-y", `${event.clientY - r.top}px`);
  }
});
document.addEventListener("pointerout", event => {
  const card = event.target.closest?.(".nx.v6 .nx-card");
  if (card && !card.contains(event.relatedTarget)) for (const name of ["--tilt-x", "--tilt-y"]) card.style.removeProperty(name);
});
ACTIONS["next-peek"] = element => {
  element.closest(".nx").classList.add("is-unveiled");
  return false;
};
