// The header of a build: its portrait, its name, « by author · ascendancy (class) », and
// Copy link, Download .build and the warnings, which lead to About (specs.md, Window layout).

function buildHeader() {
  const unknown = TREE.unknown.length
    + SHOWN.skills.flatMap(skill => [skill, ...skill.supports]).filter(gem => !gem.known).length;
  return `<div class="app-header">
    ${portrait(SHOWN.portrait, 44)}
    <div class="app-header-text">
      <h1 class="app-header-name app-title">${escapeHtml(SHOWN.name)}</h1>
      <p class="app-header-by app-weak">by ${escapeHtml(SHOWN.author)} · ${escapeHtml(SHOWN.ascendancy)} (${escapeHtml(SHOWN.class)})</p>
    </div>
    <div class="app-header-actions">
      <button type="button" class="app-button">${icon(14, ICONS.link)}Copy link</button>
      <button type="button" class="app-button">${icon(14, ICONS.download)}Download .build</button>
      ${unknown > 0 ? `<button type="button" class="app-button is-filled">${icon(14, ICONS.warning)}${plural(unknown, "warning")}</button>` : ""}
    </div>
  </div>`;
}
