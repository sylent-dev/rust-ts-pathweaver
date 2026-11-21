// The end of the band of the open builds (2e2): « +N ▾ » and +, told apart by contrast (the owner,
// 2026-11-18), at rest and on hover; then the menu of « +N ▾ » open, attached under the band; in
// the style of the page. The seven builds of sections/bands.js, so that some don't fit. The
// looks set aside (A raised, B and C flat, D « + Open »; the menu as a card or compact) are in the
// history of Git (commit 2d376f5).

const END_STATES = [["At rest", {}], ["Hover on « +N ▾ »", { moreState: "is-hover" }], ["Hover on +", { openState: "is-hover" }]];

const endCard = () => `<div class="tab-card">
  <div class="tab-states end-states">${END_STATES.map(([label]) => `<span>${label}</span>`).join("")}</div>
  ${shownStyles().map(style => `<div class="end-row" data-sample-theme="${style}" title="${THEMES[style].title}">${END_STATES.map(([, states]) =>
    `<div class="tab-strip end-strip">${buildsBand(420, { builds: SEVEN_BUILDS, menuOpen: false, action: "", ...states })}<div class="tab-strip-page"></div></div>`).join("")}</div>`).join("")}
</div>`;

// The menu of this section opens and closes on its own, open at first: a click on « +N ▾ » plays
// its opening, 5 · Pop (css/menu-reveal.css).
STATE.menuDemo = true;
ACTIONS.toggleMenuDemo = () => {
  STATE.menuDemo = !STATE.menuDemo;
  return true;
};

const menuCard = () => `<div class="menu-row">${shownStyles().map(style =>
  `<div class="app-window menu-window" data-sample-theme="${style}" title="${THEMES[style].title}" style="width:560px">${
    buildsBand(560, { builds: SEVEN_BUILDS, menuOpen: STATE.menuDemo, action: "toggleMenuDemo" })}<div class="menu-page"></div></div>`).join("")}</div>`;

addSection(() => ["The menu of « +N ▾ » · open, in the style of the page: the builds that don't fit; click « +N ▾ » to see it open (5 · Pop)",
  [["Attached under the band, in its shade, each build a tab laid down", menuCard()]]]);

addSection(() => ["The end of the band · « +N ▾ » and +, told apart by contrast, no line between them, at rest and on hover, in the style of the page",
  [["« +N ▾ » blue, white on hover; + on white, larger on hover", endCard()]]]);
