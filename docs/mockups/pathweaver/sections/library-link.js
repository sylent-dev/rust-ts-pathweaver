// The way back to the library (2e2, the owner, 2026-11-18): My library in the band of the site,
// just after the brand; the band of the open builds only while a build is open. The home page
// itself (the first visit, the drop zone, the library) is drawn at 2l: here, only a stand-in, its
// call to action « Add my first build ». In the style of the page, at 960 px.

const libraryWindow = ({ library = false, builds = [] }, page) => `<div class="app-window" style="width:960px">
  ${siteBand({ library })}${builds.length ? buildsBand(960, { builds, current: library ? -1 : 0, menuOpen: false }) : ""}${page}
</div>`;

const firstVisit = `<div class="library-page library-first">
  <button type="button" class="library-cta">Add my first build</button>
  <span>Drop .build files here, or paste JSON · the whole home page is drawn at 2l</span>
</div>`;
const libraryPage = text => `<div class="library-page">${text}</div>`;

const LINK_STATES = [["At rest", {}], ["Hover", { libraryState: "is-hover" }], ["The page shown", { library: true }]];

const linkStatesCard = () => `<div class="tab-card">
  <div class="tab-states link-states">${LINK_STATES.map(([label]) => `<span>${label}</span>`).join("")}</div>
  ${shownStyles().map(style => `<div class="link-row" data-sample-theme="${style}" title="${THEMES[style].title}">${LINK_STATES.map(([, options]) =>
    `<div class="tab-strip link-strip">${siteBand(options)}</div>`).join("")}</div>`).join("")}
</div>`;

addSection(() => ["The way back to the library · My library after the brand; the band of the open builds only while a build is open",
  [["Nothing open: the band of the site alone, then the home page", libraryWindow({ library: true }, firstVisit)],
   ["The library, three builds open: no tab is the current one", libraryWindow({ library: true, builds: BUILDS.open.slice(0, 3) }, libraryPage("My library · every build, open or not · drawn at 2l"))],
   ["A build shown: My library a click away", libraryWindow({ builds: BUILDS.open }, libraryPage("The page of a build"))],
   ["My library, its states", linkStatesCard()]]]);
