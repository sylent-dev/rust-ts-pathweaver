// A tab of an open build (2e, the owner, 2026-11-17): the full height of the band, side by side,
// square corners, its portrait square, its name over its ascendancy; no box, the current one in
// the full text, the others weaker. Its states side by side on the three
// styles, the close button always shown. The looks set aside (92 and 95, cards; 94,
// a chip) are in the history of Git (commit 8473e84).

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

const tabCard = look => `<div class="tab-card" style="--tab-width:184px">
  <div class="tab-states">${TAB_STATES.map(([label]) => `<span>${label}</span>`).join("")}</div>
  ${["frost", "frost-night", "ember"].map(style => `<div class="tab-strip" data-sample-theme="${style}" title="${THEMES[style].title}">
    <div class="app-builds" data-current-look="${look}"><div class="app-builds-tabs">${TAB_STATES.map(([, states, build]) => openBuildTab(build, states)).join("")}</div></div>
    <div class="tab-strip-page"></div>
  </div>`).join("")}
</div>`;

// The looks of the current tab compared (2e2), by contrast only, from a normal temperature to an
// explosive one; « Current tab » picks the one of every other band of the page.
const CURRENT_LOOKS = {
  96: "A lighter background · normal",
  97: "The colour of the page, as if the tab opened on it · normal",
  98: "The other portraits grey and dimmed, the current one in colour · normal",
  99: "A background tinted with the accent, the other portraits grey · hotter",
  100: "Filled with the accent, its text inverted, the others grey · explosive",
};

addSection(() => ["A build tab · its states, on Frost, Frost Night and Ember, the current one in five looks: the portrait, the name over the ascendancy, the close button",
  Object.entries(CURRENT_LOOKS).map(([look, text]) => [`${look} · ${text}`, tabCard(look)])]);
