// The end of the band of the open builds (2e2): « +N ▾ » and +, in four looks, each at rest and on
// hover; then the menu of « +N ▾ » open, in three looks; on Frost, Frost Night and Ember. The lists
// « End of band » and « Menu » pick those of every other band of the page. The seven builds of
// sections/bands.js, so that some don't fit.

const END_LOOKS = {
  A: "Raised: two small controls in the middle of the band",
  B: "Flat, the full height of the band, a background on hover, as the tabs",
  C: "Flat, as B, a line before each",
  D: "Flat, as B, + with its word, « Open »",
};
const END_STATES = [["At rest", {}], ["Hover on « +N ▾ »", { moreState: "is-hover" }], ["Hover on +", { openState: "is-hover" }]];
const MENU_LOOKS = {
  1: "A card under its button, rounded, the builds in rows of 32 px",
  2: "Attached under the band, in its shade, square corners, each build a tab laid down (44 px)",
  3: "Attached, as 2, compact: rows of 32 px, the name alone",
};
const STYLES_3 = ["frost", "frost-night", "ember"];

const endCard = look => `<div class="tab-card">
  <div class="tab-states end-states">${END_STATES.map(([label]) => `<span>${label}</span>`).join("")}</div>
  ${STYLES_3.map(style => `<div class="end-row" data-sample-theme="${style}" title="${THEMES[style].title}">${END_STATES.map(([, states]) =>
    `<div class="tab-strip end-strip">${buildsBand(420, { builds: SEVEN_BUILDS, menuOpen: false, endLook: look, ...states })}<div class="tab-strip-page"></div></div>`).join("")}</div>`).join("")}
</div>`;

const menuCard = look => `<div class="menu-row">${STYLES_3.map(style =>
  `<div class="app-window menu-window" data-sample-theme="${style}" title="${THEMES[style].title}" style="width:560px">${
    buildsBand(560, { builds: SEVEN_BUILDS, menuOpen: true, menuLook: look })}<div class="menu-page"></div></div>`).join("")}</div>`;

addSection(() => ["The menu of « +N ▾ » · three looks, open, on Frost, Frost Night and Ember: the builds that don't fit, then Merge…",
  Object.entries(MENU_LOOKS).map(([look, text]) => [`${look} · ${text}`, menuCard(look)])]);

addSection(() => ["The end of the band · « +N ▾ » and + in four looks, at rest and on hover, on Frost, Frost Night and Ember",
  Object.entries(END_LOOKS).map(([look, text]) => [`${look} · ${text}`, endCard(look)])]);
