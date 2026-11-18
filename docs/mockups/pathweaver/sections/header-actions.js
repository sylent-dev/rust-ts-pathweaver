// Download .build in the header of a build (2f2, css/header-actions.css): of the nine places drawn,
// the owner kept X1, the thing itself, a file a click downloads (and a drag takes, where the browser
// allows it: Chrome); the share link left version 1 (the owner, 2026-11-18), so the file stands
// alone. Six thumbnails of it, with the two bands above and the level band below; each answers the
// hover. The size is that of the file of the build shown, in the corpus; the name of the file, the
// name of the build, is in the tooltip of the variants that don't show it.

const BUILD_FILE = { name: `${SHOWN.name}.build`, size: "44 KB" };

// A file: a page with a corner folded at 45°, « .build » written on it. Its colours come from the
// CSS (--file-page, --file-ink).
const fileIcon = (width = 26) => `<svg class="hx-file-icon" width="${width}" height="${Math.round(width * 32 / 26)}" viewBox="0 0 26 32" aria-hidden="true">
    <path d="M0 0H17L26 9V32H0Z" fill="var(--file-page)"/><path d="M17 0V9H26Z" fill="var(--file-ink)" fill-opacity=".35"/>
    <text x="13" y="26" text-anchor="middle" font-size="7.5" font-weight="700" font-family="Manrope, sans-serif" fill="var(--file-ink)">.build</text></svg>`;

const fileWindow = (variant, inner) => `<div class="app-window hx-window" style="width:960px">${appBar(960)}${buildHeader({ variant,
  actions: `<button type="button" class="hx-file" draggable="true" title="${escapeHtml(BUILD_FILE.name)}">${inner}</button>` })}${levelBand()}</div>`;

const FILE_THUMBNAILS = [
  ["F1 · X1 without the name: the file, « Download .build » in the accent over its size, on a darker field", () => fileWindow("hx-f1",
    `${fileIcon()}<span class="hx-file-text"><b>Download .build</b><small>${BUILD_FILE.size}</small></span>`)],
  ["F2 · The same without its field: it sits on the header, a field shows on hover", () => fileWindow("hx-f2",
    `${fileIcon()}<span class="hx-file-text"><b>Download .build</b><small>${BUILD_FILE.size}</small></span>`)],
  ["F3 · At the right end, the full height: the mirror of the portrait, in the shade of the bands", () => fileWindow("hx-f3",
    `${fileIcon(28)}<span class="hx-file-text"><b>Download .build</b><small>${BUILD_FILE.size}</small></span>`)],
  ["F4 · The file in the accent: the page is what can be clicked, the words in white and grey", () => fileWindow("hx-f4",
    `${fileIcon()}<span class="hx-file-text"><b>Download</b><small>.build · ${BUILD_FILE.size}</small></span>`)],
  ["F5 · The file alone, larger: its size beside it; on hover an arrow comes down on the page and « Download » shows", () => fileWindow("hx-f5",
    `<span class="hx-file-drop">${fileIcon(34)}<span class="hx-file-arrow">${icon(14, ICONS.download)}</span></span><span class="hx-file-text"><b>Download</b><small>${BUILD_FILE.size}</small></span>`)],
  ["F6 · With its name, as X1 was drawn: the name of the file, then « Download · 44 KB » in the accent", () => fileWindow("hx-f6",
    `${fileIcon()}<span class="hx-file-text"><span class="hx-file-name">${escapeHtml(BUILD_FILE.name)}</span><small>${icon(12, ICONS.download)}Download · ${BUILD_FILE.size}</small></span>`)],
];

addSection(() => ["Download .build: the file in the header, six thumbnails (hover each)", FILE_THUMBNAILS.map(([label, draw]) => [label, draw()])]);
