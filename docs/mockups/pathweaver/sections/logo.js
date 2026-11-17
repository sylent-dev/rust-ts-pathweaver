// The logo (2c): the mark drawn by the owner in Inkscape (2026-11-17, js/logo-mark.js), in four
// weights, each on the three styles at the sizes where it lives: large, in the app bar with the
// name, in the tab of the browser, and alone at 64, 32 and 16 px, in its ink or on a square of
// the accent. The name keeps the font of the style until 2d chooses the fonts.
// The 42 marks (30 to 71) and the fourteen fonts of the name (72 to 85) were set aside; they are in
// the history of Git (commits 35aa8db and fc3fc23).

const LOGO_STYLES = ["frost", "frost-night", "ember"];

const logoSquare = (weight, size) =>
  `<span class="logo-square" style="width:${size}px;height:${size}px">${logoMark(weight, Math.round(size * .78))}</span>`;

const logoCard = weight => `<div class="logo-card">
  <div class="logo-card-title">${weight.id} · ${escapeHtml(weight.name)} <small>${escapeHtml(weight.note)}</small></div>
  <div class="logo-styles">${LOGO_STYLES.map(style => `
    <div class="logo-style" data-sample-theme="${style}" title="${THEMES[style].title}">
      <div class="logo-big">${logoMark(weight, 128)}</div>
      <div class="logo-bar">${logoMark(weight, 24)}<span class="logo-name">${LOGO_NAME}</span></div>
      <div class="logo-tab">${logoMark(weight, 16)}<span>${escapeHtml(BUILDS.open[0].name)} · Pathweaver</span></div>
      <div class="logo-icons">${[64, 32, 16].map(size => logoMark(weight, size)).join("")}${[32, 16].map(size => logoSquare(weight, size)).join("")}</div>
    </div>`).join("")}
  </div>
</div>`;

addSection(() => ["The logo · the owner's mark in four weights: large, in the app bar, in the tab of the browser, alone at 64, 32 and 16 px and on a square of the accent, on Frost, Frost Night and Ember",
  LOGO_WEIGHTS.map(weight => ["", logoCard(weight)])]);

// The name (2c, the owner, 2026-11-17): its case, its font among some sixty of every kind, and its
// spacing, chosen by the lists « Name », « Font » and « Spacing » at the top of the page; the app
// bar of the page of a build follows them too. The mark beside it is the one as drawn (86).
const nameCard = style => `<div class="name-card" data-sample-theme="${style}" title="${THEMES[style].title}">
  <span class="logo-name is-alone">${LOGO_NAME}</span>
  <div class="name-lockup">${logoMark(LOGO_WEIGHTS[0], 44)}<span class="logo-name">${LOGO_NAME}</span></div>
  <div class="logo-bar">${logoMark(LOGO_WEIGHTS[0], 24)}<span class="logo-name">${LOGO_NAME}</span></div>
</div>`;

addSection(() => ["The name · its case, its font and its spacing, chosen by the lists « Name », « Font » and « Spacing » at the top of the page: alone, beside the mark, in the app bar, on Frost, Frost Night and Ember",
  LOGO_STYLES.map(style => [THEMES[style].title, nameCard(style)])]);
