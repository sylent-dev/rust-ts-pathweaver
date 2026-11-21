// The header of a build (2f, 2f2): its portrait on the left, square, the full height of the band, as
// in the tabs of the band above (the owner, 2026-11-18, after trying it on the right); its name;
// « by author · ascendancy class », the class without brackets and in a darker grey; the warnings,
// which lead to About (specs.md, Window layout); and the file of the build, to download.
//
// The file (2f2, the owner, 2026-11-18): of nine places drawn, the thing itself (X1), the share link
// gone from version 1 so the file stands alone; of six thumbnails, F2, without a field, its words
// turning white on hover. A click downloads it, a drag takes it where the browser allows
// it (Chrome). The size is that of the file of the build shown, in the corpus; the name of the file,
// the name of the build, is in its tooltip.

const BUILD_FILE = { name: `${SHOWN.name}.build`, size: "44 KB" };

// A file: a page with a corner folded at 45°, « .build » written on it, in the colours of the band.
const fileIcon = () => `<svg class="app-file-icon" width="26" height="32" viewBox="0 0 26 32" aria-hidden="true">
    <path d="M0 0H17L26 9V32H0Z" fill="var(--on-band)"/><path d="M17 0V9H26Z" fill="var(--band-deep)" fill-opacity=".35"/>
    <text x="13" y="26" text-anchor="middle" font-size="7.5" font-weight="700" font-family="Manrope, sans-serif" fill="var(--band-deep)">.build</text></svg>`;

function buildHeader() {
  const unknown = TREE.unknown.length
    + SHOWN.skills.flatMap(skill => [skill, ...skill.supports]).filter(gem => !gem.known).length;
  return `<div class="app-header">
    <img class="app-header-portrait" src="pathweaver/img/portraits-square/${SHOWN.portrait}.webp" width="66" height="66" alt="">
    <div class="app-header-text">
      <h1 class="app-header-name app-title">${escapeHtml(SHOWN.name)}</h1>
      <p class="app-header-by app-weak">by ${escapeHtml(SHOWN.author)} · ${escapeHtml(SHOWN.ascendancy)} <span class="app-header-class">${escapeHtml(SHOWN.class)}</span></p>
    </div>
    <div class="app-header-actions">
      ${unknown > 0 ? `<button type="button" class="app-button is-filled" data-action="tab-go" data-tab="about">${icon(14, ICONS.warning)}${plural(unknown, "warning")}</button>` : ""}
      <button type="button" class="app-file" draggable="true" title="${escapeHtml(BUILD_FILE.name)}">${fileIcon()}<span class="app-file-text"><span class="app-file-label">Download .build</span><small>${BUILD_FILE.size}</small></span></button>
    </div>
  </div>`;
}
