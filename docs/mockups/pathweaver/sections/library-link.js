// The way back to the library (2e2, the owner, 2026-11-18): My library in the band of the site,
// just after the brand; the band of the open builds only while a build is open. The home page
// itself (the first visit, the library) is drawn in its own sections (sections/home-drop.js,
// sections/library.js): here, a build shown and the states of My library. In the style of the page,
// at 960 px.

// « +N ▾ » does nothing here, the window too short for its menu.
const libraryWindow = ({ builds = [] }, page) => `<div class="app-window" style="width:960px">
  ${siteBand()}${buildsBand(960, { builds, current: 0, menuOpen: false, action: "" })}${page}
</div>`;

const libraryPage = text => `<div class="link-page">${text}</div>`;

const LINK_STATES = [["At rest", {}], ["Hover", { libraryState: "is-hover" }], ["The page shown", { library: true }]];

const linkStatesCard = () => `<div class="tab-card">
  <div class="tab-states link-states">${LINK_STATES.map(([label]) => `<span>${label}</span>`).join("")}</div>
  ${shownStyles().map(style => `<div class="link-row" data-sample-theme="${style}" title="${THEMES[style].title}">${LINK_STATES.map(([, options]) =>
    `<div class="tab-strip link-strip">${siteBand(options)}</div>`).join("")}</div>`).join("")}
</div>`;

addSection(() => ["The way back to the library · My library after the brand; the band of the open builds only while a build is open",
  [["A build shown: My library a click away", libraryWindow({ builds: BUILDS.open }, libraryPage("The page of a build"))],
   ["My library, its states", linkStatesCard()]]]);
