// The header of a build: its name, « by author · ascendancy (class) », the warnings, which lead to
// About (specs.md, Window layout), and its portrait on the right, square, the full height of the band,
// to balance the tabs of the band above, whose portraits are on their left (the owner, 2026-11-18).
// Copy link and Download .build are taken off for now: their place is to be found, together (the
// owner, 2026-11-18).

function buildHeader() {
  const unknown = TREE.unknown.length
    + SHOWN.skills.flatMap(skill => [skill, ...skill.supports]).filter(gem => !gem.known).length;
  return `<div class="app-header">
    <div class="app-header-text">
      <h1 class="app-header-name app-title">${escapeHtml(SHOWN.name)}</h1>
      <p class="app-header-by app-weak">by ${escapeHtml(SHOWN.author)} · ${escapeHtml(SHOWN.ascendancy)} (${escapeHtml(SHOWN.class)})</p>
    </div>
    <div class="app-header-actions">
      ${unknown > 0 ? `<button type="button" class="app-button is-filled">${icon(14, ICONS.warning)}${plural(unknown, "warning")}</button>` : ""}
    </div>
    <img class="app-header-portrait" src="pathweaver/img/portraits-square/${SHOWN.portrait}.webp" width="66" height="66" alt="">
  </div>`;
}
