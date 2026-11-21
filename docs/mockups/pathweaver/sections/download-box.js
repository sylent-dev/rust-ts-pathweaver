// The box of Download .build (2k6): three ways, each in the page of the build shown at 960 px, open at first; a
// click on the file closes it and opens it again, Esc or a click outside closes it; Copy writes the path to the
// clipboard. The file itself isn't downloaded by the mock-up.
STATE.downloadOpen = "all";

const downloadWindow = way => `<div class="app-window dl-case" data-download-case="${way}" style="width:960px;height:430px">
  ${buildHeader()}${levelBand()}${buildTabs("overview")}
  ${STATE.downloadOpen === "all" || STATE.downloadOpen === way ? downloadBox(way) : ""}
</div>`;

addSection(() => ["The box of Download .build · where the game reads the file, three ways (click the file to open it again)", [
  ["D1 · both folders, Windows and Steam Deck, each with Copy", downloadWindow("d1")],
  ["D2 · one folder, its system chosen, the one of the browser first", downloadWindow("d2")],
  ["D3 · two steps: saved, then move it to the folder", downloadWindow("d3")],
]]);
