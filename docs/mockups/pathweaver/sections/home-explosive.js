// The first visit at an explosive temperature (2l, css/home-explosive.css, js/home-motion.js): the
// page plays. E1 the page is the drop zone, E2 the constellation, E3 the road. No band of the site:
// the brand and its links float.

const floodHome = () => homeWindow("flood", `
  <div class="home-flood-top">${homeBrand(26)}${homeLinks()}</div>
  <div class="home-flood-main">
    ${logoMark(64).replace('class="logo-mark"', 'class="logo-mark home-flood-mark"')}
    ${tagline()}
    ${homeCta()}
    <div class="home-flood-under">${homeDropHint("or drop .build files anywhere")}${homePaste()}</div>
  </div>
  <div class="home-flood-sources">From ${SOURCES.map(([name]) => name).join(" · ")} · ${HOME_TEXT.local}</div>
  <div class="home-flood-frame"></div>
  <div class="home-flood-let"><b>Let go.</b><span>1 file over the page: it opens at once</span></div>`, { band: false })
  .replace("home-flood\"", `home-flood${STATE.homeDrag ? " is-drag" : ""}"`);

const skyHome = () => homeWindow("sky", `${homeTreeCanvas("sky")}
  <div class="home-sky-top">${homeBrand(26)}${homeLinks()}</div>
  <div class="home-sky-level"><span>LEVEL</span><b>1</b></div>
  <div class="home-sky-main">
    ${tagline()}
    <div class="home-sky-actions">${homeCta()}${homePaste()}</div>
    ${homeDropHint(`${HOME_TEXT.doesShort} From ${SOURCES.map(([name]) => name).join(", ")}.`)}
  </div>`, { band: false });

const wayHome = () => homeWindow("way", `
  <div class="home-way-sun">${logoMark(240)}</div>
  <div class="home-way-floor"><div class="home-way-lane"></div><div class="home-way-posts"></div></div>
  <div class="home-way-top">${homeBrand(26)}${homeLinks()}</div>
  ${tagline()}
  <div class="home-way-call"><div>${homeCta()}${homePaste()}</div>${homeDropHint(HOME_TEXT.doesShort + " " + HOME_TEXT.local)}</div>`, { band: false });

addSection(() => ["The first visit · explosive temperature: the page plays; the motions stop when the system asks for less (click the line to draw the next)",
  [[`E1 · The page is the drop zone: the grid lit around the pointer; drag any file over the window, or <button type="button" class="page-inline" data-action="homeDrag">${STATE.homeDrag ? "hide" : "show"} a file over it</button>`, floodHome()],
   ["E2 · Constellation: the whole tree as a sky, the path of a real build lit level by level while the view closes in", skyHome()],
   ["E3 · The road: the level band laid down to the horizon, the levels to come along it (the markers of the build in blue), the mark rising", wayHome()]]]);
