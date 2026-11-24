// An address of the description as a chip of its site (4g3, its third review, the owner, 2026-11-24): the About tab
// of the Amazon of Maxroll, whose links are written in its description, then three descriptions a file of a
// stranger could write, the first two made to read, in the letters of the author, as an address other than the
// one a click opens. Each is drawn by the rule of the About tab (js/about-tab.js).

// The cases: the words of the description as the file writes them, and what a click opens.
const DL_CASES = [
  ["A space of one pixel (U+200A) after the link: it reads .com", "Guide: https://pathofexile.co m/forum/view-thread/1", "https://pathofexile.co"],
  ["A tag that changes nothing on screen (<s>) before the link: it reads as one address", "Guide: https://pathofexile.com/forum/view-thread/1?r=<s>{https://evil.io/planner}", "https://evil.io/planner (the end of the line)"],
  ["An honest link, as the Amazon writes it", "Maxroll planner link: <u>{https://maxroll.gg/poe2/planner/0pgpe000}", "https://maxroll.gg/poe2/planner/0pgpe000"],
];

const dlCase = ([label, written, opens]) => `<div class="dl-case">
  <p class="dl-label">${escapeHtml(label)}</p>
  <div class="ab-desc">${abLinked(markupHtml(written))}</div>
  <p class="dl-opens">A click opens: ${escapeHtml(opens)}</p></div>`;

addSection(() => ["An address of the description as a chip of its site, never the letters of the author", [
  ["The Amazon of Maxroll: its guide and its planner written in its description", aboutTabWindow("amazon")],
  ["Three descriptions a file of a stranger could write (hover a link to see what it opens)", `<div class="dl-cases">${DL_CASES.map(dlCase).join("")}</div>`],
]]);
