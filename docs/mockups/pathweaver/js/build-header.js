// The header of a build: its name, « by author · ascendancy class », the class without brackets
// and in a darker grey (the owner, 2026-11-18), the warnings, which lead to
// About (specs.md, Window layout), and its portrait on the left, square, the full height of the band,
// as in the tabs of the band above (the owner, 2026-11-18, after trying it on the right).
// Copy link and Download .build are taken off for now: their place is to be found, together (the
// owner, 2026-11-18), among the variants of sections/header-actions.js (2f2): `by` adds to the line
// of the author, `actions` goes before the warnings, `variant` names the class of the band.

function buildHeader({ by = "", actions = "", variant = "" } = {}) {
  const unknown = TREE.unknown.length
    + SHOWN.skills.flatMap(skill => [skill, ...skill.supports]).filter(gem => !gem.known).length;
  return `<div class="app-header ${variant}">
    <img class="app-header-portrait" src="pathweaver/img/portraits-square/${SHOWN.portrait}.webp" width="66" height="66" alt="">
    <div class="app-header-text">
      <h1 class="app-header-name app-title">${escapeHtml(SHOWN.name)}</h1>
      <p class="app-header-by app-weak">by ${escapeHtml(SHOWN.author)} · ${escapeHtml(SHOWN.ascendancy)} <span class="app-header-class">${escapeHtml(SHOWN.class)}</span>${by}</p>
    </div>
    <div class="app-header-actions">${actions}
      ${unknown > 0 ? `<button type="button" class="app-button is-filled">${icon(14, ICONS.warning)}${plural(unknown, "warning")}</button>` : ""}
    </div>
  </div>`;
}
