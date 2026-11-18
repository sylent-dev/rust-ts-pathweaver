// The page of the mock-up: its styles, its open decisions and their controls, its sections.
//
// - Each style only sets tokens (css/tokens.css, under :root[data-theme="…"]).
// - VARIANTS holds one group of tabs per open decision; the address keeps the choices
//   (e.g. ?theme=frost), to share them. A group is removed once decided.
//   A value that combines with others is a list (`select: true` and the CSS `variable` it sets);
//   a value tuned by eye is a slider (`range`, its `variable` and its `unit`).
// - SECTIONS lists every scenario and state, each a function that returns
//   [title, [[label, html], …]]: a section script adds its own with addSection(), and the newest
//   section comes first. Past ten sections, a table of contents under the header links to each.

// The styles compared, each numbered once and for good: 28 proposals, of which the owner kept two on
// 2026-11-17, 18 · Frost and its negative 28 · Frost Night (the others are in the history of Git),
// then 29 · Ember, Frost Night on a neutral grey with amber first.
const THEMES = {
  frost: { title: "18 · Frost", text: "Light: the cool light of Aurora at the density of Slate, flat white boxes, one blue (Geist, Geist Mono)." },
  "frost-night": { title: "28 · Frost Night", text: "Dark, Frost in negative: its density and its flat boxes on a blue black, pale blue lines, one blue (Geist, Geist Mono)." },
  ember: { title: "29 · Ember", text: "Dark, Frost Night on a very dark neutral grey: the same density and flat boxes, amber first (Geist, Geist Mono)." },
};


const VARIANTS = {
  theme: { label: "Style", options: Object.fromEntries(Object.entries(THEMES).map(([key, theme]) => [key, theme.title])), fallback: "frost-night" },
  // The second accent (css/accent-2.css): its colour, and what it marks.
  accent2: { label: "Accent 2", select: true, fallback: "amber", options: { amber: "Amber", blue: "Blue", coral: "Coral", mint: "Mint",
    violet: "Violet", magenta: "Magenta", lime: "Lime" } },
  accent2On: { label: "Accent 2 on", select: true, fallback: "later", options: {
    later: "What comes later (tree, markers)", gear: "The gear (hints of the slots)", controls: "The pressed switches", all: "All three" } },
  // On trial on the three styles (2026-11-17): the app bar, the level band, the row of the tabs and the right column a shade darker, and the tabs of a build the full height of their band.
  band: { label: "Bands", select: true, fallback: "deep", options: { deep: "Darker: the level band, the tabs, the column", lines: "As before" } },
  tabs: { label: "Tabs", select: true, fallback: "full", options: { full: "Full height", short: "As before" } },
  colour: { label: "Colour", select: true, fallback: "blue", options: { text: "Grey (the text)", blue: "Pale blue", accent: "Accent" } },
  size: { label: "Size", range: { min: 6, max: 200, step: 2 }, variable: "--texture-size", unit: "px", fallback: "24" },
  // The width of the windows of the home page (2l): the minimum of specs.md, half a 1920-pixel screen, and a wide
  // window of the owner's screen.
  // The shape of a notice (2l3): the files refused when a build opens, a damaged share link,
  // private browsing; the three notices take the shape chosen.
  notice: { label: "Notice", options: { band: "A · Band under the bands", card: "B · Card at the bottom right", box: "C · Box over the header" }, fallback: "band" },
  homeWidth: { label: "Home width", options: { 900: "900 px", 960: "960 px", 1600: "1,600 px" }, fallback: "960" },
};

// The styles a section shows side by side: the style of the page alone, Frost Night by default, the
// reference on which every setting is tuned first (the owner, 2026-11-18); Frost and Ember derive
// from it, adjusted after, and are seen with the tabs of the style.
const shownStyles = () => [chosen.theme];

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
  document.documentElement.dataset[variant] = chosen[variant];   // a list may be read by the CSS
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
