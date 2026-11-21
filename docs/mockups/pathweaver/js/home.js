// The home page (2l, 2l2; specs.md, Window layout): at the first visit, the drop zone
// (sections/home-drop.js), on Frost Night whatever the style of the page (the owner, 2026-11-18);
// afterwards, the library. What they share is here.

// The texts, in the translation file like every text.
const HOME_TEXT = {
  local: "Your builds stay in this browser. Nothing is sent anywhere.",
  // Private browsing (2l3): the browser refuses to keep the builds; Pathweaver works the same.
  private: "This browser keeps nothing (private browsing): your builds will be gone once it's closed.",
};
// The sources of a file the interface may name (decided by the owner on 2026-11-16).
const SOURCES = ["Mobalytics", "Maxroll", "poe.ninja", "Path of Building"];

// The window of the home page: Frost Night, at the width chosen with « Home width », 900 px high
// (the frame of the wireframe); `band` keeps the band of the site.
const HOME_HEIGHT = 900;
const homeWidth = () => Number(chosen.homeWidth);
const homeWindow = (variant, page, { band = true } = {}) =>
  `<div class="app-window home-window home-${variant}" style="width:${homeWidth()}px;height:${HOME_HEIGHT}px">
    ${band ? siteBand({ library: true }) : ""}${page}
  </div>`;

// The brand, larger, and the links of the band of the site, floating over the first visit.
const homeBrand = (size = 28, extra = "") => `<span class="home-brand ${extra}">${logoMark(size)}<span class="logo-name">Pathweaver</span></span>`;
const homeLinks = (extra = "") => `<nav class="home-links ${extra}">
  <a class="app-site-link" href="${REPORT_BUG_URL}" target="_blank" rel="noopener"><span class="app-site-label">Report a bug</span></a>
  <a class="app-site-link" href="#" role="button"><span class="app-site-label">What's next</span></a>
</nav>`;

// The icon of the zone (the owner, 2026-11-18, no. 10 of the series, « raccord avec le plus
// d'après »): the corners of a zone around the + of the band of the builds, which leads to the home page, drawn
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

// The link beside the zone: Paste JSON, a word alone like the links of the band (the owner,
// 2026-11-18: without its icon).
const dropLink = label => `<a class="app-site-link home-drop-paste" href="#" role="button"><span class="app-site-label">${label}</span></a>`;

// The page is where the files are dropped: the grid lit around the pointer, and the whole window
// lit while a real file is dragged over it (try with any file of the desktop: the mock-up opens
// nothing); a window drawn in that state holds it (data-held).
const sheet = document.getElementById("sheet");
const dropHost = event => event.target.closest(".home-drop, .home-library");
sheet.addEventListener("pointermove", event => {
  const host = dropHost(event);
  if (!host) return;
  const box = host.getBoundingClientRect();
  host.style.setProperty("--home-x", `${event.clientX - box.left}px`);
  host.style.setProperty("--home-y", `${event.clientY - box.top}px`);
});
sheet.addEventListener("dragover", event => {
  const host = dropHost(event);
  if (!host) return;
  event.preventDefault();
  host.classList.add("is-drag");
});
sheet.addEventListener("dragleave", event => {
  const host = dropHost(event);
  if (host && !host.contains(event.relatedTarget) && !host.hasAttribute("data-held")) host.classList.remove("is-drag");
});
sheet.addEventListener("drop", event => {
  const host = dropHost(event);
  if (!host) return;
  event.preventDefault();
  if (!host.hasAttribute("data-held")) host.classList.remove("is-drag");
});
