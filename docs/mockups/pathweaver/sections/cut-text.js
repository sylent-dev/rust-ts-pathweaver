// An author's text cut at 1,000 pieces (4g3b, the owner, 2026-11-24: the measure of 4g3 drew 699,028 pieces in
// 3.5 seconds, where the longest description of the corpus has 27): the core reads a text up to its 1,000th piece,
// a text in one style, a link or a line break, never cut in two, and the page draws « … » in the weak grey a space
// after it (none after a line break), without a tooltip (the owner, 2026-11-24). The same bound holds for the notes of the cards on hover.
// The case: a file of a stranger whose description writes 2,000 steps of three pieces each, « Step N: » in bold,
// its words, a line break; cut by the core after the bold of step 334 (333 × 3 + 1 = 1,000). The mock-up gives
// the text already cut, which the core does, and its About tab opens at the end of the description.

const CUT_STEP = n => `<b>{Step ${n}:} Take the waypoint, then the stairs down.`;
const CUT_SHOWN = 333;
BUILDS.abouts.cut = {
  ...BUILDS.abouts.amazon,
  name: "Two thousand steps",
  description: `${Array.from({ length: CUT_SHOWN }, (_, i) => CUT_STEP(i + 1)).join("\n")}\n<b>{Step ${CUT_SHOWN + 1}:}`,
  isCut: true,
};

addSection(() => ["An author's text cut at 1,000 pieces, followed by « … » in the weak grey", [
  ["A description of 2,000 steps, 6,000 pieces, cut after the bold of step 334 (the tab opens at its end)", `<div class="cut-text">${aboutTabWindow("cut")}</div>`],
]]);

// The tab of the case opens at the end of its description, where the cut is.
AFTER_RENDER.push(() => {
  for (const tab of document.querySelectorAll(".cut-text .app-about-tab")) tab.scrollTop = tab.scrollHeight;
});
