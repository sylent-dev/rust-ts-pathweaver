// The About tab (2k3): H2, a colophon at the left, the description at the right; on the build shown (the
// longest description of the corpus, the link of its guide), a leveling guide without description nor link and
// with 18 gems the game data don't know, and an Amazon whose links are in its description.

const aboutTabWindow = source => `<div class="app-window" style="width:960px">${buildTabs("about")}${aboutTab(STATE.level, source)}</div>`;

addSection(() => ["The About tab: H2, a colophon at the left (the portrait, the name, the levels, the entries, the guide, the file), the description at the right, the warnings under it", [
  ["The build shown: the longest description of the corpus, the link of its guide", aboutTabWindow("shown")],
  ["A leveling guide: no description, no link, 18 gems the game data don't know", aboutTabWindow("warnings")],
  ["An Amazon: its links written in its description, the field of the link empty; the guide found there", aboutTabWindow("amazon")],
]]);
