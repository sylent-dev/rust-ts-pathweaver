// The app bar, at the top of every page: the name, then the open builds as tabs (as many as fit,
// the others in a « +N ▾ » menu, which also holds Merge…), and + to open files (specs.md, Window layout).

const portrait = (key, size) => `<img class="app-portrait" src="pathweaver/img/portraits/${key}.webp" width="${size}" height="${size}" alt="">`;

function appBar(width) {
  const fit = Math.max(1, Math.floor((width - 130 - 100) / 174));
  const shown = BUILDS.open.slice(0, fit);
  const more = BUILDS.open.length - shown.length;
  return `<div class="app-bar">
    <span class="app-bar-name app-title">Pathweaver</span>
    <div class="app-bar-tabs" role="tablist">${shown.map((build, index) => `
      <div class="app-bar-tab ${index === 0 ? "is-current" : ""}" role="tab" aria-selected="${index === 0}" title="${escapeHtml(build.name)} · ${escapeHtml(build.ascendancy)}">
        ${portrait(build.portrait, 24)}<span class="app-bar-tab-name">${escapeHtml(build.name)}</span>
        <button type="button" class="app-bar-close" aria-label="Close">${icon(12, ICONS.close)}</button>
      </div>`).join("")}
    </div>
    <button type="button" class="app-bar-more" aria-label="More builds and Merge">${more > 0 ? `+${more}` : ""}${icon(12, ICONS.down)}</button>
    <button type="button" class="app-bar-open" aria-label="Open files">${icon(14, ICONS.plus)}</button>
  </div>`;
}
