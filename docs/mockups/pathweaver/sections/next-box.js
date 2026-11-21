// The box of What's next (2k6): V3 of the twelve ways, with the icons of passives of V9 rising behind it (the owner,
// 2026-11-21), in the page of the build shown at 960 px, open at first; a click on What's next closes it and opens
// it again, to see it come; Esc, a click outside, or × closes it.
STATE.nextOpen = "box";

const nextWindow = () => {
  const open = STATE.nextOpen === "box";
  return `<div class="app-window" data-next-case="box" style="width:960px;height:600px">
    ${appBar(960, { menu: false })}${buildHeader()}${levelBand()}${buildTabs("overview")}
    ${open ? `<div class="nx-veil"></div>${nextBox()}` : ""}
  </div>`;
};

addSection(() => ["The box of What's next · The Editor Update and The Community Update: two halves opening from the seam, passives rising behind (click What's next to see it come again)",
  [["V3 of the twelve, with the rising passives of V9", nextWindow()]]]);
