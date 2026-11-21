// The page of a build at 1,920 px (2k4, the owner, 2026-11-21): how the views use a window twice as wide as the
// 960 px they were drawn at, one way each, kept of three (the others in the history of Git). The height stays
// that of the tabs at 960 px (668 px): a screen of 1,920 × 1,080. The side panel of the open builds waits in
// docs/backlog.md.
// - Overview, O1: the tree takes the width, the column stays 330 px with its drawer: the tree is what one zooms
//   in, the column reads as at 960 (a column in two or three set aside).
// - Skills, S2: the cards in four columns, 1,280 px at most, in the middle, the graph paper to the edges (six
//   columns, a band per skill set aside).
// - Inventory, between I1 and I3: the drawing at 56 px a cell, « Upcoming » under it the width of its column, the
//   box over the rest, its words 640 px at most (three blocks across set aside).
// - About, A3: the warnings in a column of their own between the colophon and the description, when there are
//   any (the description in two columns set aside).

const wideSkills = level => `<div class="wide-skills">${skillsTab(level)}</div>`;
const wideInventory = level => `<div class="wide-inventory">${inventoryTab(level, undefined, { cell: 56 })}</div>`;
const wideAbout = (level, source) => `<div class="wide-about">${aboutTab(level, source, { wide: true })}</div>`;

// A window of 1,920 px: the bar of the app, the header, the band, the tabs, the view.
const wideWindow = (tab, body, header = buildHeader()) =>
  `<div class="app-window" style="width:1920px">${appBar(1920)}${header}${levelBand()}${buildTabs(tab)}${body}</div>`;
// The header of the leveling guide of the corpus with 18 warnings: « 18 warnings », a link to them.
const warnedHeader = () => {
  const about = BUILDS.abouts.warnings;
  return buildHeader(about, about.warnings.length, { name: about.file, size: abSize(about.size) });
};
