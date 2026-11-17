// The two bands at the top of every page (specs.md, Window layout): the band of the site, the
// brand and the report of a bug (the menu, the search, the settings and the account of version 2
// come there); then the band of the open builds, their tabs (as many as fit, the others in a
// « +N ▾ » menu, which also holds Merge…) and + to open files.

// Report a bug: a new issue on GitHub, an icon alone the full height of the band.
const REPORT_BUG_URL = "https://github.com/sylent-dev/rust-ts-pathweaver/issues/new";
const siteBand = () => `<div class="app-site">
    <span class="app-site-brand">${logoMark(24)}<span class="logo-name">Pathweaver</span></span>
    <a class="app-site-bug" href="${REPORT_BUG_URL}" target="_blank" rel="noopener" title="Report a bug" aria-label="Report a bug">${icon(18, ICONS.bug)}</a>
  </div>`;

const portrait = (key, size) => `<img class="app-portrait" src="pathweaver/img/portraits/${key}.webp" width="${size}" height="${size}" alt="">`;

// A tab of an open build (2e): its portrait, its name cut to fit and its close button. `states`
// adds is-current, or is-hover and is-close-hover to show a state without the mouse.
const openBuildTab = (build, states = "") => `<div class="app-builds-tab ${states}" role="tab" aria-selected="${states.includes("is-current")}" title="${escapeHtml(build.name)} · ${escapeHtml(build.ascendancy)}">
    ${portrait(build.portrait, 24)}<span class="app-builds-tab-name">${escapeHtml(build.name)}</span>
    <button type="button" class="app-builds-close" aria-label="Close">${icon(12, ICONS.close)}</button>
  </div>`;

// The band of the open builds, its tabs in the look of the list « Tab look » (data-tab-look):
// 168 px each, up to 240 when they all fit; those that don't fit go to the menu « +N ▾ », which
// also holds Merge… and is always there. `menuOpen` shows the menu open.
const TAB_WIDTH = 168, TAB_MAX_WIDTH = 240, TAB_GAP = 6;
STATE.buildsMenu = false;

function buildsBand(width, builds = BUILDS.open, menuOpen = STATE.buildsMenu) {
  const room = width - 28 - 100;   // the paddings, then « +N ▾ » and +
  const fit = Math.max(1, Math.floor((room + TAB_GAP) / (TAB_WIDTH + TAB_GAP)));
  const shown = builds.slice(0, fit);
  const hidden = builds.slice(fit);
  const tabWidth = hidden.length ? TAB_WIDTH : Math.min(TAB_MAX_WIDTH, Math.floor((room + TAB_GAP) / builds.length) - TAB_GAP);
  return `<div class="app-builds" data-tab-look="${chosen.barTab}" style="--tab-width:${tabWidth}px">
    <div class="app-builds-tabs" role="tablist">${shown.map((build, index) => openBuildTab(build, index === 0 ? "is-current" : "")).join("")}</div>
    <span class="app-builds-more-wrap">
      <button type="button" class="app-builds-more ${menuOpen ? "is-open" : ""}" data-action="toggleBuildsMenu" aria-expanded="${menuOpen}" aria-label="More builds and Merge">${hidden.length ? `+${hidden.length}` : ""}${icon(12, ICONS.down)}</button>
      ${menuOpen ? `<div class="app-builds-menu" role="menu">${hidden.map(build => `
        <div class="app-builds-menu-item" role="menuitem" title="${escapeHtml(build.name)} · ${escapeHtml(build.ascendancy)}">${portrait(build.portrait, 20)}<span>${escapeHtml(build.name)}</span></div>`).join("")}
        ${hidden.length ? `<div class="app-builds-menu-line"></div>` : ""}
        <div class="app-builds-menu-item" role="menuitem">Merge…</div>
      </div>` : ""}
    </span>
    <button type="button" class="app-builds-open" title="Open files or paste JSON" aria-label="Open files or paste JSON">${icon(14, ICONS.plus)}</button>
  </div>`;
}
ACTIONS.toggleBuildsMenu = () => {
  STATE.buildsMenu = !STATE.buildsMenu;
  return true;
};

// The two bands, the app bar.
const appBar = width => siteBand() + buildsBand(width);
