// The cases of the level band (2g2): a snapshot of a character, the same at every level, and a guide
// that covers part of the levels, its track from its lowest level to its highest, each band at its
// own level and its own window of what changes.

const bandCase = key => `<div class="app-window app-changes-case" style="width:960px">${levelBand({ key, window: true })}<div class="app-changes-case-page"></div></div>`;

addSection(() => ["The cases of the level band: a snapshot, a guide of part of the levels, a level without change", [
  [`A snapshot · ${escapeHtml(BUILDS.changes.snapshot.name)}: no marker, no « N changes »`, bandCase("snapshot")],
  [`A guide of levels ${BUILDS.changes.partial.range.join("–")} · ${escapeHtml(BUILDS.changes.partial.name)}: opened at its highest level, « 0 changes » in grey`, bandCase("partial")],
]]);

// The focus of the cursor (2g2): a band of the page as it looks once Tab has reached its cursor, its
// look chosen with Cursor focus; on every band, Tab and ← → work for real.
addSection(() => ["The focus of the cursor: Tab reaches it, ← → go from marker to marker; its look with Cursor focus", [
  [`The cursor with the focus · ${VARIANTS.levelFocus.options[chosen.levelFocus]}`, `<div class="app-window" style="width:960px">${levelBand({ focusShown: true })}</div>`],
]]);
