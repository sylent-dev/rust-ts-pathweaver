// The logo (2c): the marks drawn from the owner's picks of the moodboard, each on the three styles
// still open, at 128 px on the page and at 24 and 16 px (the tab of the browser) on the app bar.

const LOGO_STYLES = ["frost", "frost-night", "ember"];

const logoCard = mark => `<div class="logo-card">
  <div class="logo-card-title">${mark.id} · ${escapeHtml(mark.name)} <small>from ${mark.picks}</small></div>
  <div class="logo-styles">${LOGO_STYLES.map(style => `
    <div class="logo-style" data-sample-theme="${style}" title="${THEMES[style].title}">
      <div class="logo-big">${logoMark(mark, 128)}</div>
      <div class="logo-small">${logoMark(mark, 24)}${logoMark(mark, 16)}</div>
    </div>`).join("")}
  </div>
</div>`;

// One section per series, the normal one at the top (the newest section comes first).
for (const [series, title] of Object.entries(LOGO_SERIES).reverse()) {
  addSection(() => [`The logo · ${title}: from the picks R461 (preferred), R303, R375 and R382, on Frost, Frost Night and Ember, at 128, 24 and 16 px`,
    LOGO_MARKS.filter(mark => mark.series === series).map(mark => ["", logoCard(mark)])]);
}
