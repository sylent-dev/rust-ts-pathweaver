// The page of the mock-up: its styles, its open decisions and their controls, its sections.
//
// - Each style only sets tokens (css/tokens.css, under :root[data-theme="…"]).
// - VARIANTS holds one group of tabs per open decision; the address keeps the choices
//   (e.g. ?theme=slate), to share them. A group is removed once decided.
//   A value that combines with others is a list (`select: true` and the CSS `variable` it sets);
//   a value tuned by eye is a slider (`range`, its `variable` and its `unit`).
// - SECTIONS lists every scenario and state, each a function that returns
//   [title, [[label, html], …]]: a section script adds its own with addSection(), and the newest
//   section comes first. Past ten sections, a table of contents under the header links to each.

// The styles compared, each numbered once and for good. The owner kept three on 2026-11-17 (4 · Slate,
// 14 · Glass and 15 · Aurora, the last two from the moodboard, R### of
// outputs/2026-11-16-moodboard-sources.md), then asked for twelve mixes of them (16 to 27): four
// sober, four bold, four wild, dark and light.
const THEMES = {
  slate: { title: "4 · Slate", text: "Kept. Dark, after rust-exile-market (the design journal): near-black bands without borders, white for the main action, Manrope and JetBrains Mono, one vivid orange." },
  glass: { title: "14 · Glass", text: "Kept, from R089. Dark: a glass dashboard, charcoal turning teal at its edge, large rounded corners, bold white capitals (Archivo, Inter), one gold; hexagonal gems and notables." },
  aurora: { title: "15 · Aurora", text: "Kept, from R201. Light: a deep blue app bar with stars whose glow fades into the level band, white glass boxes, one blue (Instrument Sans)." },
  graphite: { title: "16 · Graphite", text: "Sober, Slate × Glass, dark: the borderless bands of Slate, the rounded corners and the teal edge of Glass, a teal accent." },
  paper: { title: "17 · Paper", text: "Sober, Slate turned to day, light: light grey bands without borders, black for the main action, its vivid orange." },
  frost: { title: "18 · Frost", text: "Sober, Aurora × Slate, light: the cool light of Aurora at the density of Slate, flat white boxes, one blue (Geist, Geist Mono)." },
  midnight: { title: "19 · Midnight", text: "Sober, Aurora by night, dark: the whole window under its starry sky, a blue glow from the top, white passives that glow." },
  lagoon: { title: "20 · Lagoon", text: "Bold, Glass by day, light: mint and teal, a dark teal app bar, white cards with large corners, a gold accent." },
  dusk: { title: "21 · Dusk", text: "Bold, Aurora at sunset, light: the app bar from violet to coral, a warm page, serif titles and figures (Instrument Serif), a coral accent." },
  ink: { title: "22 · Ink", text: "Bold, Slate in black and white, dark: pure black, white for everything taken, one electric blue, square passives (Inter Tight)." },
  ice: { title: "23 · Ice", text: "Bold, Glass × Aurora, dark: frosted glass over coloured lights, translucent bands and boxes, a cyan accent that glows (Sora)." },
  acid: { title: "24 · Acid", text: "Wild, Slate on acid, dark: an acid yellow app bar, monospaced capitals everywhere, a faint grid, the tree in acid that glows." },
  candy: { title: "25 · Candy", text: "Wild, Aurora in pastel, light: a mesh of pink, lilac and mint, translucent bands, very round, wide titles (Unbounded), a hot pink accent." },
  signal: { title: "26 · Signal", text: "Wild, Slate's orange as a surface, light: an orange app bar, a black level band, warm paper, thick black lines and square shapes (Archivo)." },
  prism: { title: "27 · Prism", text: "Wild, Glass in iridescence, dark: dark glass lit by a band of pink, violet, cyan and gold, a magenta accent that glows (Sora, Inter)." },
  "frost-night": { title: "28 · Frost Night", text: "Asked for: Frost in negative, dark. Its density and its flat boxes on a blue black, pale blue lines, one blue (Geist, Geist Mono)." },
};

// The textures behind the blocks (css/textures.css): two layers, the second shifted, turned and
// drifting against the first, both faded towards a side.
const PATTERNS = { none: "None", grid: "Grid", graph: "Graph paper", dots: "Dots", crosses: "Crosses", hatch: "Hatching",
  lines: "Lines", waves: "Waves", zigzag: "Zigzag", diamonds: "Diamonds", triangles: "Triangles", hexagons: "Hexagons",
  cubes: "Cubes", pentagons: "Pentagons", rings: "Rings", circuit: "Circuit", contours: "Contours", ripples: "Ripples",
  rays: "Rays", stars: "Stars", grain: "Grain" };
const TEXTURE_COLOURS = { text: "Grey (the text)", blue: "Pale blue", accent: "Accent" };
const textureLayer = (n, pattern, colour, size, opacity) => ({
  [`pattern${n}`]: { label: `Texture ${n}`, options: PATTERNS, fallback: pattern, select: true },
  [`colour${n}`]: { label: `Colour ${n}`, options: TEXTURE_COLOURS, fallback: colour, select: true },
  [`size${n}`]: { label: `Size ${n}`, range: { min: 6, max: 200, step: 2 }, variable: `--texture-size-${n}`, unit: "px", fallback: size },
  [`opacity${n}`]: { label: `Opacity ${n}`, range: { min: 0, max: 40, step: 1 }, variable: `--texture-opacity-${n}`, unit: "%", fallback: opacity },
});

const VARIANTS = {
  theme: { label: "Style", options: Object.fromEntries(Object.entries(THEMES).map(([key, theme]) => [key, theme.title])), fallback: "slate" },
  zone: { label: "Textured", select: true, fallback: "tree-side", options: { tree: "The tree", side: "The right column",
    "tree-side": "The tree and the right column", band: "The level band", top: "The header and the level band",
    blocks: "Every block", window: "The whole window" } },
  fade: { label: "Fade", select: true, fallback: "none", options: { none: "None", edges: "Towards the middle",
    centre: "Towards the edges", top: "Towards the bottom", corner: "From the top right corner" } },
  ...textureLayer(1, "grid", "text", "24", "8"),
  ...textureLayer(2, "grid", "blue", "24", "6"),
  shift: { label: "Shift 2", range: { min: 0, max: 48, step: 1 }, variable: "--texture-shift", unit: "px", fallback: "12" },
  rotate: { label: "Turn 2 (°)", range: { min: 0, max: 90, step: 1 }, variable: "--texture-rotate", fallback: "0" },
  motion: { label: "Motion 2", select: true, fallback: "still", options: { still: "Still", drift: "Drifting" } },
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
