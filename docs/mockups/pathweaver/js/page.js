// The page of the mock-up: its styles, its open decisions and their controls, its sections.
//
// - Each style only sets tokens (css/tokens.css, under :root[data-theme="…"]).
// - VARIANTS holds one group of tabs per open decision; the address keeps the choices
//   (e.g. ?theme=frost), to share them. A group is removed once decided.
//   A value that combines with others is a list (`select: true` and the CSS `variable` it sets);
//   a value tuned by eye is a slider (`range`, its `variable` and its `unit`). A long list may
//   sort its options into `groups`; a variant with `apply` runs it on each choice, and a slider
//   with `format` shows its value in its own words.
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
  // The name (2c): its case, its font (js/name-fonts.js) and its spacing, read by css/logo.css.
  nameCase: { label: "Name", select: true, fallback: "title", options: { title: "Pathweaver", camel: "PathWeaver", upper: "PATHWEAVER", lower: "pathweaver" } },
  nameFont: { label: "Font", select: true, fallback: "geist", apply: loadNameFont,
    groups: Object.fromEntries(Object.entries(NAME_FONTS).map(([group, fonts]) => [group, Object.fromEntries(fonts.map(([family]) => [nameFontKey(family), family]))])),
    options: Object.fromEntries(NAME_FONT_LIST.map(font => [font.key, font.family])) },
  nameWeight: { label: "Weight", range: { min: 0, max: 1000, step: 50 }, fallback: "0", apply: setNameWeight, format: value => value === "0" ? "its own" : value },
  nameSpacing: { label: "Spacing", range: { min: -0.06, max: 0.4, step: 0.01 }, variable: "--name-spacing", unit: "em", fallback: "0" },
  // The inks of the mark (css/logo.css): its frame, the three bars outside, and its P.
  logoInk: { label: "Mark", select: true, fallback: "text", options: { text: "One ink (text)", accent: "One ink (accent)", "p-accent": "The P in accent", "frame-accent": "The frame in accent" } },
  theme: { label: "Style", options: Object.fromEntries(Object.entries(THEMES).map(([key, theme]) => [key, theme.title])), fallback: "frost" },
  // The second accent (css/accent-2.css): its colour, and what it marks.
  accent2: { label: "Accent 2", select: true, fallback: "amber", options: { amber: "Amber", blue: "Blue", coral: "Coral", mint: "Mint",
    violet: "Violet", magenta: "Magenta", lime: "Lime" } },
  accent2On: { label: "Accent 2 on", select: true, fallback: "later", options: {
    later: "What comes later (tree, markers)", gear: "The gear (hints of the slots)", controls: "The pressed switches", all: "All three" } },
  // On trial on the three styles (2026-11-17): the app bar, the level band, the row of the tabs and the right column a shade darker, and tabs the full height of their band.
  band: { label: "Bands", select: true, fallback: "deep", options: { deep: "Darker: the bar, the level band, the tabs, the column", lines: "As before" } },
  tabs: { label: "Tabs", select: true, fallback: "full", options: { full: "Full height", short: "As before" } },
  colour: { label: "Colour", select: true, fallback: "blue", options: { text: "Grey (the text)", blue: "Pale blue", accent: "Accent" } },
  size: { label: "Size", range: { min: 6, max: 200, step: 2 }, variable: "--texture-size", unit: "px", fallback: "24" },
  opacity: { label: "Opacity", range: { min: 0, max: 40, step: 1 }, variable: "--texture-opacity", unit: "%", fallback: "23" },
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
    variant.apply?.(chosen[key]);
  }
}
const keepInAddress = () => history.replaceState(null, "", "?" + new URLSearchParams(chosen) + location.hash);

// The value of a slider as it reads beside it.
const shownValue = (variant, value) => variant.format?.(value) ?? value + (variant.unit ?? "");

const selectOptions = (options, current) => Object.entries(options).map(([value, label]) =>
  `<option value="${value}" ${current === value ? "selected" : ""}>${label}</option>`).join("");

function renderControls() {
  document.getElementById("tabs").innerHTML = Object.entries(VARIANTS).map(([key, variant]) => variant.range
    ? `<label class="group"><span>${variant.label}</span><input type="range" data-variant="${key}" min="${variant.range.min}" max="${variant.range.max}" step="${variant.range.step}" value="${chosen[key]}"><output>${shownValue(variant, chosen[key])}</output></label>`
    : variant.select
    ? `<label class="group"><span>${variant.label}</span><select data-variant="${key}">${variant.groups
      ? Object.entries(variant.groups).map(([group, options]) => `<optgroup label="${group}">${selectOptions(options, chosen[key])}</optgroup>`).join("")
      : selectOptions(variant.options, chosen[key])}</select></label>`
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
  if (VARIANTS[variant].range) event.target.nextElementSibling.value = shownValue(VARIANTS[variant], chosen[variant]);
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
