// The place of Copy link and Download .build (2f2, css/header-actions.css): nine variants on the
// header of a build, three at a normal temperature, three high, three explosive (the owner,
// 2026-11-18), with the two bands above and the level band below. A state shown without the mouse
// (a menu open, a corner turned) has a slot of its own. The accent is the colour of what can be
// clicked. The length of the link and the size of the file are those of the build shown (its file
// in the corpus, 44 KB); the address is a stand-in until the deployment (step 3) names it.

const SHARE = { length: "3,960 characters", size: "44 KB", file: "ENDGAME COC COMET - Annotated v2 (Ches).build",
  link: "pathweaver.sylent.tools/#b=H4sIAAAAAAAAA+2d3XLbNhKF7/0UKN9vxSRF6idx" };

const copyLabel = "Copy link", downloadLabel = "Download .build";
const actionWindow = (header, { bar = appBar(960) } = {}) =>
  `<div class="app-window hx-window" style="width:960px">${bar}${header}${levelBand()}</div>`;

const HEADER_ACTIONS = [
  // Normal.
  ["N1 · Two quiet links: on the right, in the accent, each with its icon", () => actionWindow(buildHeader({ variant: "hx-n1",
    actions: `<a class="hx-link" href="#" onclick="return false">${icon(14, ICONS.link)}${copyLabel}</a><a class="hx-link" href="#" onclick="return false">${icon(14, ICONS.download)}${downloadLabel}</a>` }))],
  ["N2 · Two blocks the full height: at the right end, the mirror of the portrait, the icon over its word", () => actionWindow(buildHeader({ variant: "hx-n2",
    actions: `<button type="button" class="hx-block">${icon(18, ICONS.link)}<span>${copyLabel}</span></button><button type="button" class="hx-block">${icon(18, ICONS.download)}<span>Download</span></button>` }))],
  ["N3 · In the line of the author: after the class, in the accent, the header left alone", () => actionWindow(buildHeader({ variant: "hx-n3",
    by: ` · <a class="hx-inline" href="#" onclick="return false">${copyLabel}</a> · <a class="hx-inline" href="#" onclick="return false">${downloadLabel}</a>` }))],
  // High.
  ["H1 · One block, Share: white and the full height like the + of the band above; it opens a menu, as « +N ▾ » does", () => actionWindow(buildHeader({ variant: "hx-h1",
    actions: `<button type="button" class="hx-share">${icon(14, ICONS.link)}Share${icon(12, ICONS.down)}</button>` }))],
  ["H1 · open: each way to share says what it gives", () => actionWindow(buildHeader({ variant: "hx-h1",
    actions: `<span class="hx-share-wrap"><button type="button" class="hx-share is-open">${icon(14, ICONS.link)}Share${icon(12, ICONS.down)}</button>
      <div class="hx-menu" role="menu">
        <div class="hx-menu-item" role="menuitem">${icon(16, ICONS.link)}<span><b>${copyLabel}</b><small>${SHARE.length}, to paste anywhere</small></span></div>
        <div class="hx-menu-item" role="menuitem">${icon(16, ICONS.download)}<span><b>${downloadLabel}</b><small>${SHARE.size}, for the game</small></span></div>
      </div></span>` }))],
  ["H2 · On the tab of the build: its two icons beside its close, the header left alone", () => actionWindow(buildHeader({ variant: "hx-h2" }), {
    bar: appBar(960).replace('<button type="button" class="app-builds-close"',
      `<button type="button" class="hx-tab-action" title="${copyLabel}" aria-label="${copyLabel}">${icon(13, ICONS.link)}</button><button type="button" class="hx-tab-action" title="${downloadLabel}" aria-label="${downloadLabel}">${icon(13, ICONS.download)}</button><button type="button" class="app-builds-close"`) })],
  ["H3 · The link first: a wide block in the accent, the file a square beside it, both the full height", () => actionWindow(buildHeader({ variant: "hx-h3",
    actions: `<button type="button" class="hx-primary">${icon(16, ICONS.link)}${copyLabel}</button><button type="button" class="hx-square" title="${downloadLabel}" aria-label="${downloadLabel}">${icon(18, ICONS.download)}</button>` }))],
  // Explosive.
  ["X1 · The things themselves: the link written out, a click copies it; the file as a file, a click or a drag takes it", () => actionWindow(buildHeader({ variant: "hx-x1",
    actions: `<button type="button" class="hx-url"><code>${SHARE.link}…</code><small>${icon(12, ICONS.link)}Copy · ${SHARE.length}</small></button>
      <button type="button" class="hx-file" draggable="true"><span class="hx-file-icon">.build</span><span><b>${escapeHtml(SHARE.file)}</b><small>${icon(12, ICONS.download)}Download · ${SHARE.size}</small></span></button>` }))],
  ["X2 · The turned corner: a corner of the header in the accent, folded down; on hover it unfolds into the two", () => actionWindow(buildHeader({ variant: "hx-x2",
    actions: `<button type="button" class="hx-corner" aria-label="Share"></button>` }))],
  ["X2 · unfolded", () => actionWindow(buildHeader({ variant: "hx-x2",
    actions: `<div class="hx-unfold"><button type="button">${icon(16, ICONS.link)}${copyLabel}</button><button type="button">${icon(16, ICONS.download)}${downloadLabel}</button></div>` }))],
  ["X3 · Cut at 60°, as the edges of the mark: the end of the header in the accent, the two split by a slanted line", () => actionWindow(buildHeader({ variant: "hx-x3",
    actions: `<div class="hx-cut"><button type="button">${icon(16, ICONS.link)}${copyLabel}</button><span class="hx-cut-line"></span><button type="button">${icon(16, ICONS.download)}${downloadLabel}</button></div>` }))],
];

addSection(() => ["Copy link and Download .build: where they go, nine variants (normal N, high H, explosive X)", HEADER_ACTIONS.map(([label, draw]) => [label, draw()])]);
