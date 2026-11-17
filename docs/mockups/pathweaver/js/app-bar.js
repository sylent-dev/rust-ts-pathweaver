// The app bar, at the top of every page: the brand (the mark and the name), then the open builds as tabs (as many as fit,
// the others in a « +N ▾ » menu, which also holds Merge…), and + to open files (specs.md, Window layout).

const portrait = (key, size) => `<img class="app-portrait" src="pathweaver/img/portraits/${key}.webp" width="${size}" height="${size}" alt="">`;

// A tab of an open build (2e): its portrait, its name cut to fit and its close button. `states`
// adds is-current, or is-hover and is-close-hover to show a state without the mouse.
const appBarTab = (build, states = "") => `<div class="app-bar-tab ${states}" role="tab" aria-selected="${states.includes("is-current")}" title="${escapeHtml(build.name)} · ${escapeHtml(build.ascendancy)}">
    ${portrait(build.portrait, 24)}<span class="app-bar-tab-name">${escapeHtml(build.name)}</span>
    <button type="button" class="app-bar-close" aria-label="Close">${icon(12, ICONS.close)}</button>
  </div>`;

// The bar, its tabs in the look of the list « Bar tab » (css/app-bar.css, data-tab-look).
function appBar(width) {
  const fit = Math.max(1, Math.floor((width - 160 - 100) / 174));
  const shown = BUILDS.open.slice(0, fit);
  const more = BUILDS.open.length - shown.length;
  return `<div class="app-bar" data-tab-look="${chosen.barTab}">
    <span class="app-bar-brand">${logoMark(24)}<span class="logo-name">Pathweaver</span></span>
    <div class="app-bar-tabs" role="tablist">${shown.map((build, index) => appBarTab(build, index === 0 ? "is-current" : "")).join("")}</div>
    <button type="button" class="app-bar-more" aria-label="More builds and Merge">${more > 0 ? `+${more}` : ""}${icon(12, ICONS.down)}</button>
    <button type="button" class="app-bar-open" aria-label="Open files">${icon(14, ICONS.plus)}</button>
  </div>`;
}
