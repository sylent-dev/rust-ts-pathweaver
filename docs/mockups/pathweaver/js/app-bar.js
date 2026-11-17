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

// The band of the open builds, its tabs in the look of the list « Tab look » (data-tab-look).
function buildsBand(width) {
  const fit = Math.max(1, Math.floor((width - 28 - 100) / 174));
  const shown = BUILDS.open.slice(0, fit);
  const more = BUILDS.open.length - shown.length;
  return `<div class="app-builds" data-tab-look="${chosen.barTab}">
    <div class="app-builds-tabs" role="tablist">${shown.map((build, index) => openBuildTab(build, index === 0 ? "is-current" : "")).join("")}</div>
    <button type="button" class="app-builds-more" aria-label="More builds and Merge">${more > 0 ? `+${more}` : ""}${icon(12, ICONS.down)}</button>
    <button type="button" class="app-builds-open" aria-label="Open files">${icon(14, ICONS.plus)}</button>
  </div>`;
}

// The two bands, the app bar.
const appBar = width => siteBand() + buildsBand(width);
