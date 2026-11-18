// The first visit at a high temperature (2l, css/home-high.css): the page shows what Pathweaver
// is about before it explains it. H1 the tree, H2 from 1 to 100, H3 a poster.

const sourceNames = () => SOURCES.map(([name]) => name);

const treeHome = () => homeWindow("tree", `${homeTreeCanvas("whole")}
  <div class="home-tree-top">${homeBrand(28)}${homeLinks()}</div>
  <div class="home-tree-main">
    <span class="home-subtitle">Build viewer and planner · Path of Exile 2</span>
    ${tagline()}
    <p class="home-tree-does">${HOME_TEXT.does}</p>
    <div class="home-tree-actions">${homeCta()}${homePaste()}</div>
    ${homeDropHint()}
  </div>
  <div class="home-tree-foot">.build files come from <b>${sourceNames().join("</b>, <b>")}</b></div>
  <div class="home-tree-legend"><i></i>The path of ${escapeHtml(SHOWN.name)}</div>`, { band: false });

const roadHome = () => homeWindow("road", `<div class="home-road-main">
  <div class="home-road-head"><span class="home-subtitle">Build viewer and planner · Path of Exile 2</span>${tagline()}</div>
  <div class="home-road-band">
    <span class="home-road-end">1</span>
    <div class="home-road-track">${markers().map(m => `<i style="left:${(m - 1) / (MAX_LEVEL - 1) * 100}%"></i>`).join("")}
      <span class="home-road-trail"></span><span class="home-road-cursor"></span></div>
    <span class="home-road-end">100</span>
  </div>
  <div class="home-road-call">
    <p><strong>Drop a .build file, walk it level by level.</strong>${HOME_TEXT.does.replace("Pathweaver shows", "See")}</p>
    <div class="home-road-actions">${homeCta()}${homePaste()}</div>
  </div>
  <div class="home-road-foot">${HOME_TEXT.sourcesTitle}:${SOURCES.map(([name, how]) => `<span class="home-chip" title="${how}">${name}</span>`).join("")}<span style="margin-left:auto">${HOME_TEXT.local}</span></div>
</div>`);

const posterHome = () => homeWindow("poster", `${logoMark(820).replace('class="logo-mark"', 'class="logo-mark home-poster-mark"')}
  <div class="home-poster-top">${homeBrand(26)}${homeLinks()}</div>
  <div class="home-poster-main">
    <span class="home-subtitle">Build viewer and planner · Path of Exile 2</span>
    ${tagline()}
    <p class="home-poster-does">${HOME_TEXT.does}</p>
  </div>
  <div class="home-poster-slab home-paper">
    <div><strong>Drop .build files anywhere</strong><span>From ${sourceNames().join(", ")}. ${HOME_TEXT.local}</span></div>
    <div class="home-poster-actions">${homeCta()}${homePaste()}</div>
  </div>`, { band: false });

addSection(() => ["The first visit · high temperature: the page shows the tree, the levels, the mark before it explains them (click the line to draw the next)",
  [["H1 · The tree: the whole passive tree behind the page, the path of a real build lit; the band of the site leaves, the brand and the links float", treeHome()],
   ["H2 · From 1 to 100: the level band grown into the page, its cursor walking the road over the real markers of a build; the band kept", roadHome()],
   ["H3 · Poster: the line in large condensed capitals (Archivo, the font of the name), the mark cropped behind, a slab to drop the files on", posterHome()]]]);
