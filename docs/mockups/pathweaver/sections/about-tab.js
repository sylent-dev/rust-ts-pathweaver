// The About tab (2k3): twelve variants with the tabs « About », on the build shown (the longest description of
// the corpus, the link of its guide), a leveling guide without description nor link and with 18 gems the game
// data don't know, and an Amazon whose links are in its description.

const aboutTabWindow = source => `<div class="app-window" style="width:960px">${buildTabs("about")}${aboutTab(STATE.level, source)}</div>`;

addSection(() => [`The About tab: the description, the guide, the file, the warnings, in twelve variants with the tabs « About »: normal N1–N3, high H1–H3, explosive E1–E3, free F1–F3; ${ABOUT[chosen.about].title}`, [
  [`${ABOUT[chosen.about].title}: ${ABOUT[chosen.about].text} The build shown: the longest description of the corpus, the link of its guide`, aboutTabWindow("shown")],
  ["A leveling guide: no description, no link, 18 gems the game data don't know", aboutTabWindow("warnings")],
  ["An Amazon: its links written in its description, the field of the link empty", aboutTabWindow("amazon")],
]]);
