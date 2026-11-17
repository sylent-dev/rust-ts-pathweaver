// The two bands at the top of every page (2e2, specs.md, Window layout): the band of the site,
// then the band of the open builds; « Top bands » sets their shades.
// The seven open builds: the five of the corpus and two more, so that some don't fit at 960 px,
// where the menu « +N ▾ » is open; at 1,600 px, they all fit and grow.
const SEVEN_BUILDS = [...BUILDS.open,
  { name: "Ice Shot Amazon", ascendancy: "Amazon", portrait: "huntress1" },
  { name: "lvl 42-60 - 0.5 Ice Shot Deadeye Levelin", ascendancy: "Deadeye", portrait: "ranger1" }];

const bandsWindow = (width, menuOpen) => `<div class="app-window" style="width:${width}px">
  ${siteBand()}${buildsBand(width, { builds: SEVEN_BUILDS, menuOpen })}<div class="bands-page"></div>
</div>`;

addSection(() => ["The two bands · the site above, the open builds below: seven builds, at 960 px with the menu « +N ▾ » open, at 1,600 px where every tab fits and grows",
  [["960 px · the tabs that fit, the others in the menu, then Merge…", bandsWindow(960, true)],
   ["1,600 px · the seven tabs fit and grow; the menu holds Merge… alone", bandsWindow(1600, false)]]]);
