// The end of the band of the open builds (2e2): « +N ▾ » and +, told apart by contrast (the owner,
// 2026-11-18), at rest and on hover; then the menu of « +N ▾ » open, in three looks; on Frost,
// Frost Night and Ember. The list « Menu » picks the one of every other band of the page. The seven
// builds of sections/bands.js, so that some don't fit. The looks set aside (A raised, B and C flat,
// D « + Open ») are in the history of Git (commit 2d376f5).

const END_STATES = [["At rest", {}], ["Hover on « +N ▾ »", { moreState: "is-hover" }], ["Hover on +", { openState: "is-hover" }]];
const MENU_LOOKS = {
  1: "A card under its button, rounded, the builds in rows of 32 px",
  2: "Attached under the band, in its shade, square corners, each build a tab laid down (44 px)",
  3: "Attached, as 2, compact: rows of 32 px, the name alone",
};
const STYLES_3 = ["frost", "frost-night", "ember"];

const endCard = () => `<div class="tab-card">
  <div class="tab-states end-states">${END_STATES.map(([label]) => `<span>${label}</span>`).join("")}</div>
  ${STYLES_3.map(style => `<div class="end-row" data-sample-theme="${style}" title="${THEMES[style].title}">${END_STATES.map(([, states]) =>
    `<div class="tab-strip end-strip">${buildsBand(420, { builds: SEVEN_BUILDS, menuOpen: false, ...states })}<div class="tab-strip-page"></div></div>`).join("")}</div>`).join("")}
</div>`;

const menuCard = look => `<div class="menu-row">${STYLES_3.map(style =>
  `<div class="app-window menu-window" data-sample-theme="${style}" title="${THEMES[style].title}" style="width:560px">${
    buildsBand(560, { builds: SEVEN_BUILDS, menuOpen: true, menuLook: look })}<div class="menu-page"></div></div>`).join("")}</div>`;

addSection(() => ["The menu of « +N ▾ » · three looks, open, on Frost, Frost Night and Ember: the builds that don't fit, then Merge…",
  Object.entries(MENU_LOOKS).map(([look, text]) => [`${look} · ${text}`, menuCard(look)])]);

addSection(() => ["The end of the band · « +N ▾ » and +, told apart by contrast, one line after « +N ▾ », at rest and on hover, on Frost, Frost Night and Ember",
  [["A tinted background at rest, a stronger one on hover", endCard()]]]);
