// The box of What's next (2k6): two places of its burst, each in the page of the build shown at 960 px, open at
// first; a click on What's next closes it and opens it again, to see the burst; Esc, a click outside, or × of W2
// closes it.
STATE.nextOpen = "all";

const nextWindow = way => {
  const open = STATE.nextOpen === "all" || STATE.nextOpen === way;
  return `<div class="app-window" data-next-case="${way}" style="width:960px;height:440px">
    ${appBar(960, { menu: false })}${buildHeader()}${levelBand()}${buildTabs("overview")}
    ${open && way === "w2" ? '<div class="nx-veil"></div>' : ""}${open ? nextBox(way) : ""}
  </div>`;
};

addSection(() => ["The box of What's next · the community of version 2, opening with the burst, two places (click What's next to see it burst again)", [
  ["W1 · out of the link, hanging under it", nextWindow("w1")],
  ["W2 · out of the middle of the window, over a veil", nextWindow("w2")],
]]);
