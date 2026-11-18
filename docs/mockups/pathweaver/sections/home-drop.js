// E1b · The drop zone (2l, css/home-drop.css, js/grid-fluid.js): E1 reworked by the owner
// (2026-11-18). The line in large leaves; the page holds a zone made to drop the files on,
// « Add your first build » in it, Paste JSON in a link under it, the mark of the brand in a
// watermark behind, the footer of E1. Files dropped anywhere on the page still open.

// The icon of the zone (the owner, 2026-11-18, no. 10 of the series, « raccord avec le plus
// d'après »): the corners of a zone around the + of the band of the builds, which leads here, drawn
// alike (its two strokes, in a box half wider). Square, its corners at a right angle and its ends
// cut flat (the owner, 2026-11-18: « un truc un peu plus anguleux »), like the + of the band
// (ICONS.add). Its corners close in toward the +: a little on hover, firmly while a file is over
// the page (css/home-drop.css).
const dropMark = size => {
  // One corner drawn four times, turned around the centre; each moves along its own diagonal.
  const corners = [0, 90, 180, 270].map(turn =>
    `<g transform="rotate(${turn} 12 12)"><path class="drop-mark-corner" d="M1.5 6.5v-5h5"/></g>`).join("");
  return `<svg class="app-icon drop-mark" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="butt" stroke-linejoin="miter" aria-hidden="true">${corners}<path d="M12 6v12M6 12h12"/></svg>`;
};

// What the zone holds: at rest, its call; while a file is over the page, « Let go ». A variant may
// give its own (`zone`, and `state`, a class of the zone: an error), and the link under it
// (`link`). The zone is a block that acts as a button; a variant may make it a field (`field`).
const dropZoneCall = drag => `${dropMark(56)}
  <strong>${drag ? "Let go to open it" : "Add your first build"}</strong>
  <span>${drag ? "1 file over the page" : "Drop a .build file here, or click to choose it"}</span>`;

// The link under the zone: Paste JSON, a word alone like the links of the band (the owner,
// 2026-11-18: without its icon).
const dropLink = label => `<a class="app-site-link home-drop-paste" href="#" role="button"><span class="app-site-label">${label}</span></a>`;

const dropHome = ({ drag = false, zone = dropZoneCall(drag), state = "", field = false, link = dropLink("Paste JSON") } = {}) => homeWindow("drop", `
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
  <div class="home-drop-sources">From ${SOURCES.map(([name]) => name).join(" · ")} · ${HOME_TEXT.local}</div>`, { band: false })
  .replace('home-drop"', `home-drop${drag ? ' is-drag" data-held="' : ""}" data-home-fluid`);

addSection(() => ["E1b · The drop zone, E1 reworked: move the pointer over the graph paper",
  [["At rest: hover the zone, drag any file over the window", dropHome()],
   ["A file over the page: the zone lights up", dropHome({ drag: true })]]]);
