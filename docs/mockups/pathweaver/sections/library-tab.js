// The tab of the library (2e2, the owner, 2026-11-18, on trial): pinned at the start of the band of
// the open builds, so that the band is never empty: on the home page, nothing open, then a few
// builds open, then a build shown; and its states. In the style of the page, at 960 px.

const libraryWindow = (page, options) => `<div class="app-window" style="width:960px">
  ${siteBand()}${buildsBand(960, { menuOpen: false, ...options })}<div class="library-page">${page}</div>
</div>`;

const LIBRARY_STATES = [["Current (the home page)", "is-current"], ["Another page", ""], ["Hover", "is-hover"]];

const libraryStatesCard = () => `<div class="tab-card">
  <div class="tab-states end-states">${LIBRARY_STATES.map(([label]) => `<span>${label}</span>`).join("")}</div>
  ${shownStyles().map(style => `<div class="end-row" data-sample-theme="${style}" title="${THEMES[style].title}">${LIBRARY_STATES.map(([, state]) =>
    `<div class="tab-strip end-strip">${buildsBand(420, { builds: BUILDS.open.slice(0, 1), menuOpen: false, home: state === "is-current", libraryState: state === "is-current" ? "" : state })}<div class="tab-strip-page"></div></div>`).join("")}</div>`).join("")}
</div>`;

addSection(() => ["The tab of the library · pinned at the start of the band, never closed, the current tab on the home page: the band is never empty",
  [["The home page, nothing open: the library, then +", libraryWindow("The home page · the library", { builds: [], home: true })],
   ["The home page, three builds open", libraryWindow("The home page · the library", { builds: BUILDS.open.slice(0, 3), home: true })],
   ["A build shown, the library a click away", libraryWindow("The page of a build", { builds: BUILDS.open })],
   ["Its states, beside a build", libraryStatesCard()]]]);
