// E1b · The drop zone (2l, css/home-drop.css, js/grid-fluid.js): E1 reworked by the owner
// (2026-11-18). The line in large leaves; the page holds a zone made to drop the files on,
// « Add your first build » in it, Paste JSON in a link under it, the mark of the brand in a
// watermark behind, the footer of E1. Files dropped anywhere on the page still open.

const dropHome = ({ drag = false } = {}) => homeWindow("drop", `
  <div class="home-drop-mark">${logoMark(620)}</div>
  <div class="home-drop-top">${homeBrand(26)}${homeLinks()}</div>
  <div class="home-drop-main">
    <button type="button" class="home-drop-zone">
      ${dropIcon(40)}
      <strong>${drag ? "Let go to open it" : "Add your first build"}</strong>
      <span>${drag ? "1 file over the page" : "Drop a .build file here, or click to choose it"}</span>
    </button>
    <a class="app-site-link home-drop-paste" href="#" role="button">${icon(14, ICONS.paste)}<span class="app-site-label">Paste JSON</span></a>
  </div>
  <div class="home-drop-sources">From ${SOURCES.map(([name]) => name).join(" · ")} · ${HOME_TEXT.local}</div>`, { band: false })
  .replace('home-drop"', `home-drop${drag ? ' is-drag" data-held="' : ""}" data-home-fluid`);

addSection(() => ["E1b · The drop zone, E1 reworked: move the pointer over the graph paper; « Zone » at the top of the page",
  [["At rest: hover the zone, drag any file over the window", dropHome()],
   ["A file over the page: the zone lights up", dropHome({ drag: true })]]]);
