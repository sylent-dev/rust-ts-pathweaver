// The first visit (2l, css/home-drop.css, js/grid-fluid.js; the owner's E1b, 2026-11-18): the
// page holds a zone made to drop the files on, « Add your first build » in it, Paste JSON in a link
// under it, the mark of the brand in a watermark behind, the sources at the foot. Files dropped
// anywhere on the page still open.

// What the zone holds: at rest, its call; while a file is over the page, « Let go ». A variant may
// give its own (`zone`, and `state`, a class of the zone: an error), and the link under it
// (`link`). The zone is a block that acts as a button; a variant may make it a field (`field`).
const dropZoneCall = drag => `${dropMark(56)}
  <strong>${drag ? "Let go to open it" : "Add your first build"}</strong>
  <span>${drag ? "1 file over the page" : "Drop a .build file here, or click to choose it"}</span>`;

const dropHome = ({ drag = false, zone = dropZoneCall(drag), state = "", field = false, link = dropLink("Paste JSON"), local = HOME_TEXT.local } = {}) => homeWindow("drop", `
  <div class="home-drop-mark">${logoMark(620)}</div>
  <div class="home-drop-top">${homeBrand(26)}${homeLinks()}</div>
  <div class="home-drop-main">
    ${homeTitle()}
    <div class="home-drop-stage">
      <div class="home-drop-zone ${state}" ${field ? "" : 'role="button" tabindex="0"'}>${zone}</div>
      ${homeNotes()}
    </div>
    ${link}
  </div>
  <div class="home-drop-sources">From ${SOURCES.join(" · ")} · ${local}</div>`, { band: false })
  .replace('home-drop"', `home-drop${drag ? ' is-drag" data-held="' : ""}" data-home-fluid`);

addSection(() => ["Home · the first visit: move the pointer over the graph paper",
  [["At rest: hover the zone, drag any file over the window", dropHome()],
   ["A file over the page: the zone lights up", dropHome({ drag: true })]]]);
