// A tab of an open build (2e): the full height of the band, side by side, square corners, its
// portrait square (the owner, 2026-11-17); three looks, each in its states side by side on the
// three styles. The lists of the page set the look of the page of a build (« Tab look ») and when
// the close button shows (« Close × »). 94, a chip, went with the tabs the full height.

const TAB_LOOKS = {
  92: "Card: the current tab in the colour of the page, open on it, the others a shade darker",
  93: "Underline: no box, the current tab underlined in the accent",
  95: "Card with the accent on top: 92, the current tab with a line of the accent at its top",
};

// A short name beside the long ones of the corpus, which all run past the tab.
const SHORT_BUILD = { name: "Ice Shot Amazon", ascendancy: "Amazon", portrait: "huntress1" };
const TAB_STATES = [
  ["Current", "is-current", BUILDS.open[0]],
  ["Another", "", BUILDS.open[1]],
  ["Hover", "is-hover", BUILDS.open[2]],
  ["Hover on ×", "is-close-hover", BUILDS.open[3]],
  ["A short name", "", SHORT_BUILD],
  ["Current, hover on ×", "is-current is-close-hover", BUILDS.open[4]],
];

const tabCard = look => `<div class="tab-card" style="--tab-width:${chosen.tabWidth}px">
  <div class="tab-states">${TAB_STATES.map(([label]) => `<span>${label}</span>`).join("")}</div>
  ${["frost", "frost-night", "ember"].map(style => `<div class="tab-strip" data-sample-theme="${style}" title="${THEMES[style].title}">
    <div class="app-builds" data-tab-look="${look}"><div class="app-builds-tabs">${TAB_STATES.map(([, states, build]) => openBuildTab(build, states)).join("")}</div></div>
    <div class="tab-strip-page"></div>
  </div>`).join("")}
</div>`;

addSection(() => ["A build tab · three looks in their states, on Frost, Frost Night and Ember: the portrait, the name cut to fit, the close button; « Tab look » picks the look of the page of a build",
  Object.entries(TAB_LOOKS).map(([look, text]) => [`${look} · ${text}`, tabCard(look)])]);
