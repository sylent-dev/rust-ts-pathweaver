// The cases of the level band (2g2): a snapshot of a character, the same at every level, and a guide
// that covers part of the levels, its track from its lowest level to its highest, each band at its
// own level and its own window of what changes.

const bandCase = key => `<div class="app-window app-changes-case" style="width:960px">${levelBand({ key, window: true })}<div class="app-changes-case-page"></div></div>`;

addSection(() => ["The cases of the level band: a snapshot, a guide of part of the levels, a level without change", [
  [`A snapshot · ${escapeHtml(BUILDS.changes.snapshot.name)}: no marker, no « N changes »`, bandCase("snapshot")],
  [`A guide of levels ${BUILDS.changes.partial.range.join("–")} · ${escapeHtml(BUILDS.changes.partial.name)}: opened at its highest level, « 0 changes » in grey`, bandCase("partial")],
]]);
