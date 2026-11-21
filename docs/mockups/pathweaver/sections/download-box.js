// The box of Download .build (2k6): three ways, each in the page of the build shown at 960 px, closed at first, as
// in the website: a click on « Download .build » downloads the file and opens the box under it (the owner,
// 2026-11-21: open at the load, it hid what opens it); a second click, Esc or a click outside closes it; Copy writes
// the path to the clipboard. The file itself isn't downloaded by the mock-up.

const downloadWindow = way => `<div class="app-window dl-case" data-download-case="${way}" style="width:960px;height:430px">
  ${buildHeader()}${levelBand()}${buildTabs("overview")}
  ${STATE.downloadOpen === way ? downloadBox(way) : ""}
</div>`;

addSection(() => ["The box of Download .build · where the game reads the file, three ways: click « Download .build » to open each", [
  ["D1 · both folders, Windows and Steam Deck, each with Copy", downloadWindow("d1")],
  ["D2 · one folder, its system chosen, the one of the browser first", downloadWindow("d2")],
  ["D3 · two steps: saved, then move it to the folder", downloadWindow("d3")],
]]);
