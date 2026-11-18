// The icon of the drop zone (2l, the owner, 2026-11-18: « travailler l'icône d'upload »): a series
// drawn for Pathweaver, as SVG lines in a 16-unit box, numbered once; a click on one puts it in
// the zone of E1b (« Icon » at the top of the page keeps it in the address).
// Nothing is uploaded: the files stay in the browser. So the series favours opening and dropping
// over sending (no cloud, no arrow leaving), and the icon of Download .build (an arrow onto a line)
// stays out, so that the two never read alike.

const FILE_OUTLINE = '<path d="M9.5 1.8H4.2a1 1 0 0 0-1 1v10.4a1 1 0 0 0 1 1h7.6a1 1 0 0 0 1-1V5.1z"/><path d="M9.5 1.8v3.3h3.3"/>';
const CORNERS = '<path d="M2 5V3a1 1 0 0 1 1-1h2M11 2h2a1 1 0 0 1 1 1v2M14 11v2a1 1 0 0 1-1 1h-2M5 14H3a1 1 0 0 1-1-1v-2"/>';

const DROP_ICONS = {
  1: ["Tray, arrow up (the current one)", '<path d="M8 10.5V2.5M4.8 5.7 8 2.5l3.2 3.2"/><path d="M2.5 10v2.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V10"/>'],
  2: ["Tray, arrow down: into it", '<path d="M8 2.5v8M4.8 7.3 8 10.5l3.2-3.2"/><path d="M2.5 10v2.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V10"/>'],
  3: ["A file and its +", FILE_OUTLINE + '<path d="M8 7.5v4.5M5.75 9.75h4.5"/>'],
  4: ["A file, arrow down", FILE_OUTLINE + '<path d="M8 6.8v5M6 9.8l2 2 2-2"/>'],
  5: ["Two files: several at once", '<path d="M5.8 1.8h4.6l2.4 2.4v6.6"/><path d="M8.6 4.3H3.8a.8.8 0 0 0-.8.8v8.3a.8.8 0 0 0 .8.8h6.4a.8.8 0 0 0 .8-.8V6.7z"/><path d="M8.6 4.3v2.4H11"/>'],
  6: ["A file with a path in it", FILE_OUTLINE + '<path d="M5.4 12 6.9 9.6l2 1 1.6-3"/><circle cx="5.4" cy="12" r=".7"/><circle cx="10.5" cy="7.6" r=".7"/>'],
  7: ["+ in a circle", '<circle cx="8" cy="8" r="6.2"/><path d="M8 5v6M5 8h6"/>'],
  8: ["+ in a dashed square", '<rect x="2" y="2" width="12" height="12" rx="2" stroke-dasharray="2.2 2"/><path d="M8 5.5v5M5.5 8h5"/>'],
  9: ["Corners of a zone, arrow down", CORNERS + '<path d="M8 4.5v6M5.8 8.3 8 10.5l2.2-2.2"/>'],
  10: ["Corners of a zone and a +", CORNERS + '<path d="M8 5.5v5M5.5 8h5"/>'],
  11: ["Two chevrons: let it fall", '<path d="M4 3.5l4 4 4-4M4 8.5l4 4 4-4"/>'],
  12: ["An open box, arrow in", '<path d="M2.5 8h11v4.7a.8.8 0 0 1-.8.8H3.3a.8.8 0 0 1-.8-.8z"/><path d="M2.5 8 4 5.5h1.5M10.5 5.5H12L13.5 8"/><path d="M8 1.5v6M6 5.5l2 2 2-2"/>'],
  13: ["A folder, open", '<path d="M1.8 12.5v-9a1 1 0 0 1 1-1H6l1.5 1.7h5a1 1 0 0 1 1 1V6"/><path d="M1.8 12.5 3.6 7.1a1 1 0 0 1 1-.7h9.3a.6.6 0 0 1 .6.8l-1.6 4.9a1 1 0 0 1-1 .7H2.3"/>'],
  14: ["The mark, arrow into it", '<path d="M2.2 5.5h11.6L8 14.5z"/><path d="M8 1v7.6M5.9 6.5 8 8.6l2.1-2.1"/>'],
  15: ["Passives, the next one to take", '<circle cx="3.5" cy="12" r="1.6"/><circle cx="7.6" cy="4.8" r="1.6"/><path d="M4.3 10.6 6.8 6.2M8.7 6.1l2 2.6"/><circle cx="12" cy="10.8" r="2.4" stroke-dasharray="1.6 1.3"/>'],
  16: ["A gem and its +", '<path d="M8 1.5 14 8 8 14.5 2 8z"/><path d="M8 5.6v4.8M5.6 8h4.8"/>'],
  17: ["A map, folded", '<path d="M1.8 3.6 5.5 2l5 1.6 3.7-1.6v10.4l-3.7 1.6-5-1.6-3.7 1.6z"/><path d="M5.5 2v10.4M10.5 3.6V14"/>'],
  18: ["A drop: of blood, for the veins", '<path d="M8 1.8S3.6 7 3.6 10a4.4 4.4 0 0 0 8.8 0C12.4 7 8 1.8 8 1.8z"/>'],
  19: ["A drop and its +", '<path d="M8 1.8S3.6 7 3.6 10a4.4 4.4 0 0 0 8.8 0C12.4 7 8 1.8 8 1.8z"/><path d="M8 8.2v3.6M6.2 10h3.6"/>'],
  20: ["A drop and its ripple", '<circle cx="8" cy="8" r="2.2" fill="currentColor"/><circle cx="8" cy="8" r="5.8" stroke-dasharray="2 2.2"/>'],
};

const dropIcon = size => icon(size, (DROP_ICONS[chosen.dropIcon] ?? DROP_ICONS[1])[1]);

ACTIONS.pickDropIcon = element => {
  chosen.dropIcon = element.dataset.icon;
  keepInAddress();
  renderControls();
  return true;
};
