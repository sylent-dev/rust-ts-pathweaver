// The box of Download .build (2k6): D2 of three ways (the owner, 2026-11-21), in the page of the build shown at
// 960 px, closed at first, as in the website: a click on « Download .build » downloads the file and opens the box
// under it (open at the load, it hid what opens it); a second click, Esc or a click outside closes it; Copy writes
// the path to the clipboard. The file itself isn't downloaded by the mock-up.

const downloadWindow = () => `<div class="app-window dl-case" data-download-case="d2" style="width:960px;height:430px">
  ${buildHeader()}${levelBand()}${buildTabs("overview")}
  ${STATE.downloadOpen === "d2" ? downloadBox() : ""}
</div>`;

addSection(() => ["The box of Download .build · where the game reads the file: click « Download .build » to open it", [
  ["D2 · one folder, its system chosen, the one of the browser first", downloadWindow()],
]]);
