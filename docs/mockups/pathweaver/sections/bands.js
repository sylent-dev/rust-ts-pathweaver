// The two bands at the top of every page (2e2, specs.md, Window layout): the band of the site,
// then the band of the open builds; « Top bands » sets their shades. At 960 px, the five open
// builds don't fit and the menu « +N ▾ » is open; at 1,600 px, they all fit and grow to 240 px.

const bandsWindow = (width, menuOpen) => `<div class="app-window" style="width:${width}px">
  ${siteBand()}${buildsBand(width, BUILDS.open, menuOpen)}<div class="bands-page"></div>
</div>`;

addSection(() => ["The two bands · the site above, the open builds below: at 960 px with the menu « +N ▾ » open, at 1,600 px where every tab fits and grows to 240 px",
  [["960 px · four tabs fit, the fifth in the menu, then Merge…", bandsWindow(960, true)],
   ["1,600 px · the five tabs fit, 240 px each; the menu holds Merge… alone", bandsWindow(1600, false)]]]);
