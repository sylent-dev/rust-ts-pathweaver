// The page of a build at 1,920 px (2k4): how the Overview, Skills, Inventory and About use a window twice as
// wide as the 960 px they were drawn at, three ways each, chosen with the tabs « Wide overview », « Wide
// skills », « Wide inventory » and « Wide about » (js/page.js). The height stays that of the tabs at 960 px
// (668 px): a screen of 1,920 × 1,080. The side panel of the open builds waits in docs/backlog.md.

const WIDE = {
  overview: {
    o1: { title: "O1 · The tree grows", text: "The column stays 330 px; the tree takes the rest, 1,590 px." },
    o2: { title: "O2 · The column in two", text: "The column twice as wide: « New at N » and the skills, then the inventory drawn open beside them, without its drawer; the tree 1,260 px." },
    o3: { title: "O3 · Three columns", text: "« New at N », the skills and the inventory, each a column of 330 px; the tree 930 px, about the width it has at 960." },
  },
  skills: {
    s1: { title: "S1 · Six columns", text: "The cards in six columns instead of three." },
    s2: { title: "S2 · Four columns, centred", text: "The cards in four columns, 1,280 px at most, in the middle." },
    s3: { title: "S3 · A band per skill", text: "A skill a band across: its head at the left, its supports in four columns beside it." },
  },
  inventory: {
    i1: { title: "I1 · As at 960", text: "The drawing and « Upcoming » at the left, the box over the rest, its words 640 px at most." },
    i2: { title: "I2 · Three blocks across", text: "The drawing, « Upcoming » in a column of its own, the box: the three blocks side by side." },
    i3: { title: "I3 · Three blocks, the drawing larger", text: "As I2, the drawing at 56 px a cell (504 px) instead of 44." },
  },
  about: {
    a1: { title: "A1 · As at 960", text: "The colophon, the description at the width of a page of text, the rest of the width empty." },
    a2: { title: "A2 · The description in two columns", text: "The description in two columns of text, 1,240 px at most." },
    a3: { title: "A3 · The warnings beside", text: "The colophon, the description, the warnings in a column of their own at the right." },
  },
};

// The body of a view at 1,920 px, in the way chosen.
const wideOverview = level => {
  const way = chosen.wideOverview;
  if (way === "o1") return overview();
  const columns = way === "o2"
    ? [`${newAtBox(level)}${skillList(level)}`, inventoryBox(level)]
    : [newAtBox(level), skillList(level), inventoryBox(level)];
  return `<div class="app-overview">${treePanel(level)}<aside class="app-side wide-side is-${way}">${columns.map(column => `<div class="wide-col">${column}</div>`).join("")}</aside></div>`;
};
const wideSkills = level => `<div class="wide-skills is-${chosen.wideSkills}">${skillsTab(level)}</div>`;
const wideInventory = level => `<div class="wide-inventory is-${chosen.wideInventory}">${inventoryTab(level, undefined, { middle: chosen.wideInventory !== "i1", cell: chosen.wideInventory === "i3" ? 56 : 44 })}</div>`;
const wideAbout = (level, source) => `<div class="wide-about is-${chosen.wideAbout}">${aboutTab(level, source, { aside: chosen.wideAbout === "a3" })}</div>`;

// A window of 1,920 px: the bar of the app, the header, the band, the tabs, the view.
const wideWindow = (tab, body, header = buildHeader()) =>
  `<div class="app-window" style="width:1920px">${appBar(1920)}${header}${levelBand()}${buildTabs(tab)}${body}</div>`;
// The header of the leveling guide of the corpus with 18 warnings: the button ⚠ in yellow.
const warnedHeader = () => {
  const about = BUILDS.abouts.warnings;
  return buildHeader(about, about.warnings.length, { name: about.file, size: abSize(about.size) });
};
