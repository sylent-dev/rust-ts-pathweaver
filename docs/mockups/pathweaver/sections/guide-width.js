// The guide of the colophon on one line, inside its pane (4g4b, its third review: the site of a guide broke after
// a hyphen, « mobalytics.gg- », and one of 40 characters ran 83 pixels over the description). Its site is read as
// a chip of the description reads it, its end only past 28 characters, after « … », its whole address in
// its tooltip. Every fact under its title, the guide across the pane, 204 pixels, its end only past 28 characters
// (C of three, the owner, 2026-11-25; A, beside its title, 136 pixels and 18 characters, cut forum.pathofexile.com;
// B, the guide alone under its title, mixed two rules). The cases: a site of the corpus, a site of guides
// of 21 characters, and a site made to read as another, cut by a chip at 40.

const GUIDE_CASES = [
  ["maxroll.gg, a site of the corpus", "https://maxroll.gg/poe2/build-guides/ice-shot-amazon-build-guide"],
  ["forum.pathofexile.com, 21 characters", "https://forum.pathofexile.com/forum/view-thread/3712345"],
  ["A site made to read as another, of 40 characters and more", "https://mobalytics.gg-guides-and-builds-for-poe2.evil.io/x"],
];

addSection(() => ["The guide of the colophon on one line, inside its pane, its end only past 28 characters",
  [[GUIDE_CASES.map(([label]) => label).join(" · "),
    `<div class="guide-width">${GUIDE_CASES.map(([, link]) => `<div class="app-ab"><div class="ab-colophon">${abColophon({ ...BUILDS.abouts.shown, link })}</div></div>`).join("")}</div>`]]]);
