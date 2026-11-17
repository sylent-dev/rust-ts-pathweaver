// The two bands at the top of every page (specs.md, Window layout): the band of the site, the
// brand, then Report a bug and what comes next (the menu, the search and the settings of version 2 come
// there); then the band of the open builds, their tabs (as many as fit, the others in a
// « +N ▾ » menu, which also holds Merge…) and + to open files.

// The links of the band of the site, in words, in Manrope, the full height of the band (the owner,
// 2026-11-17): Report a bug opens a new issue on GitHub; What's next (the owner, 2026-11-18, rather
// than a Sign in that would lead nowhere in version 1) will open a box of what version 2 brings, the
// community (drawn later, at 2k).
const REPORT_BUG_URL = "https://github.com/sylent-dev/rust-ts-pathweaver/issues/new";
const siteBand = () => `<div class="app-site">
    <span class="app-site-brand">${logoMark(24)}<span class="logo-name">Pathweaver</span></span>
    <nav class="app-site-links">
      <a class="app-site-link" href="${REPORT_BUG_URL}" target="_blank" rel="noopener">Report a bug</a>
      <a class="app-site-link" href="#" role="button">What's next</a>
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
// they all fit; those that don't fit go to the menu « +N ▾ », which also holds Merge… and is always
// there; then + to open files. `menuOpen` shows the menu open, `moreState` and `openState` a state
// of the two buttons.
const TAB_WIDTH = 184, TAB_MAX_WIDTH = 240, TAB_GAP = 0;
STATE.buildsMenu = false;

const menuBuild = build => `<div class="app-builds-menu-item" role="menuitem" title="${escapeHtml(build.name)} · ${escapeHtml(build.ascendancy)}">
  <img class="app-builds-menu-portrait" src="pathweaver/img/portraits-square/${build.portrait}.webp" width="44" height="44" alt="">
  <span class="app-builds-menu-text"><span class="app-builds-menu-name">${escapeHtml(build.name)}</span><span class="app-builds-menu-ascendancy">${escapeHtml(build.ascendancy)}</span></span>
</div>`;

function buildsBand(width, { builds = BUILDS.open, menuOpen = STATE.buildsMenu,
  moreState = "", openState = "" } = {}) {
  const room = width - 12 - 110;   // the padding on the right, then « +N ▾ » and +
  const fit = Math.max(1, Math.floor((room + TAB_GAP) / (TAB_WIDTH + TAB_GAP)));
  const shown = builds.slice(0, fit);
  const hidden = builds.slice(fit);
  const tabWidth = hidden.length ? TAB_WIDTH : Math.min(TAB_MAX_WIDTH, Math.floor((room + TAB_GAP) / builds.length) - TAB_GAP);
  return `<div class="app-builds" style="--tab-width:${tabWidth}px">
    <div class="app-builds-tabs" role="tablist">${shown.map((build, index) => openBuildTab(build, index === 0 ? "is-current" : "")).join("")}</div>
    <span class="app-builds-more-wrap">
      <button type="button" class="app-builds-more ${moreState} ${menuOpen ? "is-open" : ""}" data-action="toggleBuildsMenu" aria-expanded="${menuOpen}" aria-label="More builds and Merge">${hidden.length ? `+${hidden.length}` : ""}${icon(12, ICONS.down)}</button>
      ${menuOpen ? `<div class="app-builds-menu" role="menu">${hidden.map(menuBuild).join("")}
        ${hidden.length ? `<div class="app-builds-menu-line"></div>` : ""}
        <div class="app-builds-menu-item app-builds-menu-merge" role="menuitem">Merge…</div>
      </div>` : ""}
    </span>
    <button type="button" class="app-builds-open ${openState}" title="Open files or paste JSON" aria-label="Open files or paste JSON">${icon(14, ICONS.plus)}</button>
  </div>`;
}
ACTIONS.toggleBuildsMenu = () => {
  STATE.buildsMenu = !STATE.buildsMenu;
  return true;
};

// The two bands, the app bar.
const appBar = width => siteBand() + buildsBand(width);
