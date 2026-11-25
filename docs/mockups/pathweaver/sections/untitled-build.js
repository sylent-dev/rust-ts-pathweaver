// A build whose name shows nothing (4g4b): the core gives no name for one of spaces, marks of direction or
// characters drawn as nothing (4g4a), and the page writes « Untitled build » in the weak grey where the name
// goes, in the band of the open builds, the header and the colophon, and without the grey in the tooltip of
// its tab (js/page.js, buildName). The case: the build shown, its name a stranger's three spaces; its file
// keeps its own name until the download writes it (7).

BUILDS.abouts.untitled = { ...BUILDS.abouts.shown, name: "" };

function untitledWindow() {
  const about = BUILDS.abouts.untitled;
  const tab = { name: about.name, ascendancy: about.ascendancy, portrait: about.portrait };
  return `<div class="app-window" style="width:960px">${appBar(960, { builds: [tab, ...BUILDS.open.slice(1)] })}
    ${buildHeader(about, 0, { name: about.file, size: abSize(about.size) })}${buildTabs("about")}${aboutTab(STATE.level, "untitled")}
  </div>`;
}

addSection(() => ["A build whose name shows nothing · « Untitled build » in the weak grey, in its tab, the header and the colophon", [
  ["The About tab of the build shown, its name three spaces", untitledWindow()],
]]);
