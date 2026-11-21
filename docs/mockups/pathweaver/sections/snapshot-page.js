// A snapshot in the page of a build at 1,920 px (2k5): the snapshot of the band (2g2), a character of Path
// of Building, the same at every level; its band as decided at 2g2, the tree without a ring nor « new at N »
// in its legend; the column without « New at N » (N1 of two, the owner, 2026-11-21: one knows what one opens, and
// the track says it already; « A snapshot: nothing changes » in its place set aside); and the inventory of a file that names no
// gear, as the three snapshots of the corpus (and 6 files of 32 in all), its drawer kept (the owner,
// 2026-11-20: the main lines of the layout stay the same), its bar saying so and unrolling nothing.
// The tree is the one of the build shown, a stand-in: the mock-up has the passives of that build only.

SKILL_SOURCES.snapshot = level => skillsOf(BUILDS.snapshot.skills, level);

const snapshotColumn = level => `<aside class="app-side ov">
  <div class="ov-skills">${skillList(level, "snapshot")}</div>
  <div class="ov-drawer is-empty"><div class="ov-drawer-bar">
    <div class="app-inventory-head"><h2 class="app-side-title app-title">Inventory</h2></div>
    <p class="ov-no-gear app-weak">The file names no gear</p>
  </div></div>
</aside>`;

function snapshotWindow() {
  const about = BUILDS.abouts.snapshot;
  const tab = { name: about.name, ascendancy: about.ascendancy, portrait: about.portrait };
  const level = bandLevel("snapshot");
  return `<div class="app-window" style="width:1920px">${appBar(1920, { builds: [tab, ...BUILDS.open.slice(1)] })}
    ${buildHeader(about, 0, { name: about.file, size: abSize(about.size) })}${levelBand({ key: "snapshot" })}${buildTabs("overview")}
    <div class="app-overview">${treePanel(level, { view: "snapshot", snapshot: true })}${snapshotColumn(level)}</div>
  </div>`;
}

addSection(() => [`A snapshot in the page of a build · 1,920 px: ${escapeHtml(BUILDS.abouts.snapshot.name.trim())}, the same at every level, no gear in its file (the tree a stand-in, the build shown's)`, [
  ["No « New at N »: the skills from the top of the column; « The file names no gear » in the bar of the inventory", snapshotWindow()],
]]);
