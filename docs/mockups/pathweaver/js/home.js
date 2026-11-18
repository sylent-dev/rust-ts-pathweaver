// The home page at the first visit (2l, specs.md, Window layout): the line drawn at random, what
// Pathweaver does, the call to action « Add my first build » and its drop zone with Choose files
// and Paste JSON, where the .build files come from. Nine variants, three at a normal temperature,
// three high, three explosive (sections/home-*.js), all on Frost Night (the owner, 2026-11-18),
// the band of the site free to stay, change or leave. What they share is here.

// The lines, one drawn at random at each visit; on the mock-up, a click on the line draws the next.
const TAGLINES = ["Die less. Plan more.", "Every exile needs a map.", "The tree is huge. Your path isn't.",
  "Know your next 99 levels.", "Open a .build file. See the whole road."];
STATE.tagline = Math.floor(Math.random() * TAGLINES.length);
ACTIONS.nextTagline = () => {
  STATE.tagline = (STATE.tagline + 1) % TAGLINES.length;
  return true;
};
const tagline = (tag = "h1", extra = "") =>
  `<${tag} class="home-tagline ${extra}" data-action="nextTagline" title="Click: the next line">${TAGLINES[STATE.tagline]}</${tag}>`;

// The texts, a first draft for the owner to correct (in the translation file, like every text).
const HOME_TEXT = {
  does: "Pathweaver shows a Path of Exile 2 build the way you play it: its passive tree, its skills and its gear, at each level of your character.",
  doesShort: "Your build, level by level: the tree, the skills, the gear.",
  local: "Your builds stay in this browser. Nothing is sent anywhere.",
  sourcesTitle: "Where .build files come from",
  sources: "Guide sites and tools export them, and the game reads them in its Build Planner.",
};
// The sources of a file the interface may name (decided by the owner on 2026-11-16).
const SOURCES = [
  ["Mobalytics", "a file per range of levels of a guide"],
  ["Maxroll", "Download .build on a guide"],
  ["poe.ninja", "copy the JSON of a build, then Paste JSON"],
  ["Path of Building", "through a converter"],
];

// « Add my first build » chooses the files: at the first visit, it is Choose files under a warmer
// name, and Paste JSON stays beside it.
const homeCta = (extra = "") => `<button type="button" class="home-cta ${extra}">${icon(16, ICONS.file)}Add my first build</button>`;
const homePaste = (extra = "") => `<button type="button" class="home-paste ${extra}">${icon(15, ICONS.paste)}Paste JSON</button>`;
const homeDropHint = (text = "or drop .build files anywhere on the page") => `<span class="home-drop-hint">${text}</span>`;
const homeSources = (extra = "") => `<div class="home-sources ${extra}">
  ${SOURCES.map(([name, how]) => `<div class="home-source"><span class="home-source-name">${name}</span><span class="home-source-how">${how}</span></div>`).join("")}
</div>`;

// The window of a variant: Frost Night whatever the style of the page, at the width chosen with
// « Home width », 900 px high (the frame of the wireframe); `band` keeps the band of the site.
const HOME_HEIGHT = 900;
const homeWidth = () => Number(chosen.homeWidth);
const homeWindow = (variant, page, { band = true } = {}) =>
  `<div class="app-window home-window home-${variant}" data-sample-theme="frost-night" style="width:${homeWidth()}px;height:${HOME_HEIGHT}px">
    ${band ? siteBand({ library: true }) : ""}${page}
  </div>`;

// The brand, larger, for the variants that leave the band of the site.
const homeBrand = (size = 28, extra = "") => `<span class="home-brand ${extra}">${logoMark(size)}<span class="logo-name">Pathweaver</span></span>`;
const homeLinks = (extra = "") => `<nav class="home-links ${extra}">
  <a class="app-site-link" href="${REPORT_BUG_URL}" target="_blank" rel="noopener"><span class="app-site-label">Report a bug</span></a>
  <a class="app-site-link" href="#" role="button"><span class="app-site-label">What's next</span></a>
</nav>`;

// The motions of the variants stop when the system asks for less motion.
const lessMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
