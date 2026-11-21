// The two bands at the top of every page (specs.md, Window layout): the band of the site, the
// brand and My library, then Report a bug and what comes next (the menu, the search and the
// settings of version 3 come there); then, once a build is open, the band of the open builds, their
// tabs (as many as fit, the others in a « +N ▾ » menu) and + to add a
// build, which opens the choice of files of the system at once (the owner, 2026-11-18: My library
// already leads to the library).

// The links of the band of the site, in words, in Manrope, the full height of the band (the owner,
// 2026-11-17): Report a bug opens a new issue on GitHub; What's next (the owner, 2026-11-18, rather
// than a Sign in that would lead nowhere in version 1) will open a box of what version 3 brings, the
// community (drawn later, at 2k).
const REPORT_BUG_URL = "https://github.com/sylent-dev/rust-ts-pathweaver/issues/new";
// My library (the owner, 2026-11-18): the way back to the home page, the library, from anywhere,
// in the same style, just after the brand; white while it is the page shown, its line only on hover
// (`library`); `libraryState` adds is-hover, to show it without the mouse.
const siteBand = ({ library = false, libraryState = "" } = {}) => `<div class="app-site graph-paper">
    <span class="app-site-brand">${logoMark(24)}<span class="logo-name">Pathweaver</span></span>
    <nav class="app-site-nav">
      <a class="app-site-link ${library ? "is-current" : ""} ${libraryState}" href="#" ${library ? 'aria-current="page"' : ""}><span class="app-site-label">My library</span></a>
    </nav>
    <nav class="app-site-links">
      <a class="app-site-link" href="${REPORT_BUG_URL}" target="_blank" rel="noopener"><span class="app-site-label">Report a bug</span></a>
      <a class="app-site-link" href="#" role="button" data-action="next-toggle" aria-expanded="false"><span class="app-site-label">What's next</span></a>
    </nav>
  </div>`;

const portrait = (key, size) => `<img class="app-portrait" src="pathweaver/img/portraits/${key}.webp" width="${size}" height="${size}" alt="">`;

// A tab of an open build (2e, the owner, 2026-11-17): its portrait, the square inside the disc the
// game gives, the full height of the band; its name over its ascendancy, smaller and weaker, each
// cut to fit; and its close button. `states`
// adds is-current, or is-hover and is-close-hover to show a state without the mouse.
const openBuildTab = (build, states = "") => `<div class="app-builds-tab ${states}" role="tab" aria-selected="${states.includes("is-current")}" title="${escapeHtml(build.name)} · ${escapeHtml(build.ascendancy)}">
    <img class="app-builds-portrait" src="pathweaver/img/portraits-square/${build.portrait}.webp" width="44" height="44" alt=""><span class="app-builds-tab-text"><span class="app-builds-tab-name">${escapeHtml(build.name)}</span><span class="app-builds-tab-ascendancy">${escapeHtml(build.ascendancy)}</span></span>
    <button type="button" class="app-builds-close" aria-label="Close">${icon(12, ICONS.close)}</button>
  </div>`;

// The band of the open builds: its tabs full height, side by side, 184 px each, up to 240 when
// they all fit; those that don't fit go to the menu « +N ▾ », there only while some don't fit (the
// merging of a guide, which it held too, waits until after version 1, the owner, 2026-11-21); then +
// to add a build, which opens the choice of files. The band is drawn only while a build is
// open. `current` is the index of the build shown (-1 on the library), `menuOpen` shows the menu
// open, `moreState` and `openState` a state of the two buttons.
const TAB_WIDTH = 184, TAB_MAX_WIDTH = 240, TAB_GAP = 0;
// The number of the band of the open builds whose menu is open (nextInstance), or false.
STATE.buildsMenu = false;

const menuBuild = build => `<div class="app-builds-menu-item" role="menuitem" title="${escapeHtml(build.name)} · ${escapeHtml(build.ascendancy)}">
  <img class="app-builds-menu-portrait" src="pathweaver/img/portraits-square/${build.portrait}.webp" width="44" height="44" alt="">
  <span class="app-builds-menu-text"><span class="app-builds-menu-name">${escapeHtml(build.name)}</span><span class="app-builds-menu-ascendancy">${escapeHtml(build.ascendancy)}</span></span>
</div>`;

// A section that shows the menu on its own passes `menuOpen` and its `action`.
function buildsBand(width, { builds = BUILDS.open, current = 0, menuOpen,
  moreState = "", openState = "", action = "toggleBuildsMenu" } = {}) {
  const instance = nextInstance("builds-band");
  menuOpen ??= STATE.buildsMenu === instance;
  // The padding on the right and +, then « +N ▾ » only when the tabs don't all fit.
  const fitsAll = builds.length * (TAB_WIDTH + TAB_GAP) - TAB_GAP <= width - 12 - 44;
  const room = width - 12 - (fitsAll ? 44 : 110);
  const fit = Math.max(1, Math.floor((room + TAB_GAP) / (TAB_WIDTH + TAB_GAP)));
  const shown = builds.slice(0, fit);
  const hidden = builds.slice(fit);
  const tabWidth = hidden.length ? TAB_WIDTH : Math.min(TAB_MAX_WIDTH, Math.floor((room + TAB_GAP) / builds.length) - TAB_GAP);
  return `<div class="app-builds" data-instance="${instance}" style="--tab-width:${tabWidth}px">
    <div class="app-builds-tabs" role="tablist">${shown.map((build, index) => openBuildTab(build, index === current ? "is-current" : "")).join("")}</div>
    ${hidden.length ? `<span class="app-builds-more-wrap">
      <button type="button" class="app-builds-more ${moreState} ${menuOpen ? "is-open" : ""}" data-action="${action}" aria-expanded="${menuOpen}" aria-label="More builds">+${hidden.length}${icon(12, ICONS.down)}</button>
      ${menuOpen ? `<div class="app-builds-menu" role="menu">${hidden.map(menuBuild).join("")}</div>` : ""}
    </span>` : ""}
    <button type="button" class="app-builds-open ${openState}" title="Open .build files" aria-label="Open .build files">${icon(14, ICONS.add)}</button>
  </div>`;
}
// « +N ▾ » opens the menu of its own band, and closes the window of what changes: one at a time.
ACTIONS.toggleBuildsMenu = element => {
  const instance = Number(element.closest(".app-builds").dataset.instance);
  STATE.buildsMenu = STATE.buildsMenu === instance ? false : instance;
  STATE.changesOpen = false;
  return true;
};
// Esc, or a click outside the menu and its button, closes it.
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && STATE.buildsMenu !== false) {
    STATE.buildsMenu = false;
    renderSheet();
  }
});
document.addEventListener("click", event => {
  if (STATE.buildsMenu === false || event.target.closest(".app-builds-more-wrap")) return;
  STATE.buildsMenu = false;
  renderSheet();
});

// The two bands, the app bar: the band of the open builds only while one is open. `menu: false`
// makes « +N ▾ » do nothing, in a window too short for its menu, which it would cut.
const appBar = (width, { library = false, builds = BUILDS.open, menu = true } = {}) =>
  siteBand({ library }) + (builds.length ? buildsBand(width, { builds, current: library ? -1 : 0, ...(menu ? {} : { menuOpen: false, action: "" }) }) : "");
