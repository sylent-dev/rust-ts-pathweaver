// The way back to the library (2e2, the owner, 2026-11-18): My library in the band of the site,
// just after the brand; the band of the open builds only while a build is open. The home page
// itself (the first visit, the library) is drawn in its own sections (sections/home-drop.js,
// sections/library.js): here, only stand-ins. In the style of the page, at 960 px.

const libraryWindow = ({ library = false, builds = [] }, page) => `<div class="app-window" style="width:960px">
  ${siteBand({ library })}${builds.length ? buildsBand(960, { builds, current: library ? -1 : 0, menuOpen: false }) : ""}${page}
</div>`;

const libraryPage = text => `<div class="link-page">${text}</div>`;

const LINK_STATES = [["At rest", {}], ["Hover", { libraryState: "is-hover" }], ["The page shown", { library: true }]];

const linkStatesCard = () => `<div class="tab-card">
  <div class="tab-states link-states">${LINK_STATES.map(([label]) => `<span>${label}</span>`).join("")}</div>
  ${shownStyles().map(style => `<div class="link-row" data-sample-theme="${style}" title="${THEMES[style].title}">${LINK_STATES.map(([, options]) =>
    `<div class="tab-strip link-strip">${siteBand(options)}</div>`).join("")}</div>`).join("")}
</div>`;

addSection(() => ["The way back to the library · My library after the brand; the band of the open builds only while a build is open",
  [["Nothing open: the band of the site alone, then the library (a stand-in: see the section of the library)", libraryWindow({ library: true }, libraryPage("My library · every build, none open"))],
   ["The library, three builds open: no tab is the current one (a stand-in: see the section of the library)", libraryWindow({ library: true, builds: BUILDS.open.slice(0, 3) }, libraryPage("My library · every build, open or not"))],
   ["A build shown: My library a click away", libraryWindow({ builds: BUILDS.open }, libraryPage("The page of a build"))],
   ["My library, its states", linkStatesCard()]]]);
