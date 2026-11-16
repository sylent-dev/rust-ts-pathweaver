// The page of the mock-up: its styles, its open decisions and their controls, its sections.
//
// - Each style only sets tokens (css/tokens.css, under :root[data-theme="…"]).
// - VARIANTS holds one group of tabs per open decision; the address keeps the choices
//   (e.g. ?theme=grey), to share them. A group is removed once decided.
//   A value that combines with others is a list (`select: true` and the CSS `variable` it sets);
//   a value tuned by eye is a slider (`range`, its `variable` and its `unit`).
// - SECTIONS lists every scenario and state, each a function that returns
//   [title, [[label, html], …]]: a section script adds its own with addSection(), and the newest
//   section comes first. Past ten sections, a table of contents under the header links to each.

// The styles compared, numbered once (proposals 1 to 10): four sober, three bold, three wild.
const THEMES = {
  grey: { title: "0 · Grey", text: "The wireframe in HTML: the layout and the real data, before any style." },
  atlas: { title: "1 · Atlas", text: "Sober. A map of the road: dark ink and parchment, engraved serif titles (Cormorant Garamond, Alegreya Sans), a vermilion route; diamond gems and notables." },
  constellation: { title: "2 · Constellation", text: "Sober. The tree as a night sky: deep navy, the passives taken glow like stars, keystones as stars, a gold accent (Space Grotesk, Inter)." },
  blueprint: { title: "3 · Blueprint", text: "Sober. A technical drawing: a fine grid, square corners, monospaced capitals (IBM Plex Mono and Sans Condensed), a safety yellow accent; square passives." },
  slate: { title: "4 · Slate", text: "Sober, after rust-exile-market (the design journal): near-black bands without borders, white for the main action, Manrope and JetBrains Mono, one vivid orange." },
};

const VARIANTS = {
  theme: { label: "Style", options: Object.fromEntries(Object.entries(THEMES).map(([key, theme]) => [key, theme.title])), fallback: "grey" },
};

const SECTIONS = [];
// The newest section goes at the top of the page: the scripts of the sections load oldest first.
const addSection = section => SECTIONS.unshift(section);

// What the windows show and the user changes in them (the level, the weapon set…): the blocks
// read it, the actions change it, and the page draws again.
const STATE = {};
const ACTIONS = {};
// Called after each drawing, to draw what HTML can't (the canvas of the tree).
const AFTER_RENDER = [];

const params = new URLSearchParams(location.search);
const accepts = (variant, value) => variant.range
  ? value !== null && Number(value) >= variant.range.min && Number(value) <= variant.range.max
  : value in variant.options;
const chosen = Object.fromEntries(Object.entries(VARIANTS).map(([key, variant]) =>
  [key, accepts(variant, params.get(key)) ? params.get(key) : variant.fallback]));

// Escapes a text of the data before it goes into HTML: the data come from files of strangers.
const escapeHtml = text => String(text).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

function applyVariables() {
  for (const [key, variant] of Object.entries(VARIANTS)) {
    if (variant.variable) document.documentElement.style.setProperty(variant.variable, chosen[key] + (variant.unit ?? ""));
  }
}
const keepInAddress = () => history.replaceState(null, "", "?" + new URLSearchParams(chosen) + location.hash);

function renderControls() {
  document.getElementById("tabs").innerHTML = Object.entries(VARIANTS).map(([key, variant]) => variant.range
    ? `<label class="group"><span>${variant.label}</span><input type="range" data-variant="${key}" min="${variant.range.min}" max="${variant.range.max}" step="${variant.range.step}" value="${chosen[key]}"><output>${chosen[key]}${variant.unit ?? ""}</output></label>`
    : variant.select
    ? `<label class="group"><span>${variant.label}</span><select data-variant="${key}">${Object.entries(variant.options).map(([value, label]) =>
      `<option value="${value}" ${chosen[key] === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`
    : `<div class="group"><span>${variant.label}</span>${Object.entries(variant.options).map(([value, label]) =>
      `<button type="button" data-variant="${key}" data-value="${value}" aria-pressed="${chosen[key] === value}">${label}</button>`).join("")}</div>`).join("");
}

function renderSheet() {
  const theme = THEMES[chosen.theme];
  const sections = SECTIONS.map(section => section());
  const contents = sections.length > 10
    ? `<nav class="page-contents" aria-label="Sections">${sections.map(([title], index) =>
      `<a href="#section-${index + 1}">${title.split(":")[0]}</a>`).join("")}</nav>`
    : "";
  document.getElementById("sheet").innerHTML = `
    <header class="page-header"><h1>Pathweaver · ${theme.title}</h1><p>${theme.text} Sample data computed from a build of the corpus and the passive tree of Path of Exile 2 ${BUILDS.treeVersion}.</p>${contents}</header>
    ${sections.map(([title, slots], index) => `<section class="page-section" id="section-${index + 1}"><h2>${title}</h2><div class="page-row">${
      slots.map(([label, html]) => `<div class="page-slot"><span>${label}</span>${html}</div>`).join("")}</div></section>`).join("")}`;
  for (const after of AFTER_RENDER) after();
}

function render() {
  for (const key of Object.keys(VARIANTS)) document.documentElement.dataset[key] = chosen[key];
  applyVariables();
  renderControls();
  renderSheet();
}

document.getElementById("tabs").addEventListener("click", event => {
  const { variant, value } = event.target.dataset;
  if (!variant || value === undefined) return;
  chosen[variant] = value;
  keepInAddress();
  render();
});
// A list fires "input" too; so does a slider, at every step of its move.
document.getElementById("tabs").addEventListener("input", event => {
  const { variant } = event.target.dataset;
  if (!variant) return;
  chosen[variant] = event.target.value;
  if (VARIANTS[variant].range) event.target.nextElementSibling.value = chosen[variant] + (VARIANTS[variant].unit ?? "");
  keepInAddress();
  applyVariables();
});
// The controls of the windows: an element with data-action="name" calls ACTIONS[name](element, event),
// which returns true when the page must be drawn again.
document.getElementById("sheet").addEventListener("click", event => {
  const element = event.target.closest("[data-action]");
  if (element && ACTIONS[element.dataset.action]?.(element, event)) renderSheet();
});
document.getElementById("file-warning").hidden = location.protocol !== "file:";
