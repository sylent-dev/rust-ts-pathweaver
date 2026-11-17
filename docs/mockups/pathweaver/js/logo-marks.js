// The marks proposed for the logo (2c), drawn from the owner's picks of the moodboard of
// 2026-11-17: R461 (preferred: P and W joined in sharp slanted strokes), R303 (a P of two flat
// planes), R375 (dots joined by bridges) and R382 (nodes and lines in a figure). Ideas only,
// each drawn from scratch on a grid of 64 units.
//
// Numbered after the 29 styles, once and for good. Each mark is SVG in two inks: `ink` (the
// lines and planes, --logo-ink) and `mark` (the detail, --logo-detail); `soft` is the detail
// faded; `ground` is the colour behind the mark, to cut through it. The strokes read their
// width and their corners from the tokens, so that the variants (2c, next commit) only change
// them.

// Four series, as the owner asked (2026-11-17): normal, high, explosive and free.
const LOGO_SERIES = {
  normal: "Normal: the picks, close",
  high: "High: bolder, cut and carved",
  explosive: "Explosive: what a game would wear",
  free: "Free: playing with the name and the game",
};

const LOGO_MARKS = [
  { id: 30, name: "Wedge", picks: "R461", series: "normal", svg: `
    <polyline class="ink line" points="7,12 19,52 32,34 45,52 57,12"/>
    <path class="mark line" d="M7 12 H24 A9 9 0 0 1 24 30 H13"/>` },
  { id: 31, name: "Thread", picks: "R461", series: "normal", svg: `
    <path class="ink line thin" d="M6 10 L15 52 L24 26 L33 52 L42 10 H50 A9 9 0 0 1 50 28 H38"/>` },
  { id: 32, name: "Sharp P", picks: "R461", series: "normal", svg: `
    <polyline class="ink line" points="16,58 16,8 48,8"/>
    <polyline class="mark line" points="48,8 30,33 16,33"/>` },
  { id: 33, name: "Two planes", picks: "R303", series: "normal", svg: `
    <rect class="soft" x="10" y="30" width="18" height="26"/>
    <path class="ink" d="M24 8 H34 A16 16 0 0 1 34 40 V52 H24 Z"/>` },
  { id: 34, name: "Folded W", picks: "R303, R461", series: "normal", svg: `
    <polyline class="ink line" points="7,12 19,52 32,20"/>
    <polyline class="mark line" points="32,20 45,52 57,12"/>` },
  { id: 35, name: "Planes PW", picks: "R303, R461", series: "normal", svg: `
    <path class="soft" d="M22 20 L30 20 L37 42 L44 20 L52 20 L41 56 L33 56 Z"/>
    <path class="ink" d="M10 8 H24 A12 12 0 0 1 24 32 H20 V56 H10 Z"/>` },
  { id: 36, name: "Passive P", picks: "R375, R382", series: "normal", svg: `
    <polyline class="ink edge" points="18,56 18,32 18,8 34,8 46,20 34,32 18,32"/>
    <g class="ink"><circle cx="18" cy="56" r="5.5"/><circle cx="18" cy="32" r="5.5"/><circle cx="18" cy="8" r="5.5"/><circle cx="34" cy="8" r="5.5"/><circle cx="34" cy="32" r="5.5"/></g>
    <circle class="mark" cx="46" cy="20" r="6.5"/>` },
  { id: 37, name: "Node W", picks: "R375", series: "normal", svg: `
    <polyline class="ink edge" points="8,14 20,50 32,24 44,50 56,14"/>
    <g class="ink"><circle cx="8" cy="14" r="5.5"/><circle cx="20" cy="50" r="5.5"/><circle cx="44" cy="50" r="5.5"/><circle cx="56" cy="14" r="5.5"/></g>
    <circle class="mark" cx="32" cy="24" r="6.5"/>` },
  { id: 38, name: "Ring of nodes", picks: "R382", series: "normal", svg: `
    <circle class="soft-line" cx="32" cy="32" r="27"/>
    <polyline class="ink edge" points="14,24 23,44 32,28 41,44 50,24"/>
    <g class="ink"><circle cx="14" cy="24" r="4.5"/><circle cx="23" cy="44" r="4.5"/><circle cx="41" cy="44" r="4.5"/><circle cx="50" cy="24" r="4.5"/></g>
    <circle class="mark" cx="32" cy="28" r="5.5"/>` },
  { id: 39, name: "Sigil P", picks: "R382, R375", series: "normal", svg: `
    <circle class="soft-line" cx="32" cy="32" r="28"/>
    <polyline class="ink edge" points="24,50 24,32 24,14 35,14 43,23 35,32 24,32"/>
    <g class="ink"><circle cx="24" cy="50" r="4.5"/><circle cx="24" cy="32" r="4.5"/><circle cx="24" cy="14" r="4.5"/><circle cx="35" cy="14" r="4.5"/><circle cx="35" cy="32" r="4.5"/></g>
    <circle class="mark" cx="43" cy="23" r="5.5"/>` },
  { id: 40, name: "Wedge of nodes", picks: "R461, R375", series: "normal", svg: `
    <polyline class="ink edge" points="7,12 19,52 32,34 45,52 57,12"/>
    <path class="ink edge" d="M7 12 H24 A9 9 0 0 1 24 30 H13"/>
    <g class="ink"><circle cx="7" cy="12" r="5"/><circle cx="19" cy="52" r="5"/><circle cx="45" cy="52" r="5"/><circle cx="57" cy="12" r="5"/></g>
    <circle class="mark" cx="32" cy="34" r="6"/>` },
  { id: 41, name: "Path through P", picks: "R303, R461", series: "normal", svg: `
    <path class="ink" d="M12 6 H34 A18 18 0 0 1 34 42 H28 V58 H12 Z"/>
    <polyline class="cut" points="4,50 20,30 30,40 44,18 60,18"/>
    <circle class="mark" cx="44" cy="18" r="5"/>` },
  // High temperature: bolder shapes, cut and carved, still for a tool.
  { id: 42, name: "Carved W", picks: "R461", series: "high", svg: `
    <path class="ink" d="M4 8 H60 L32 60 Z"/>
    <polyline class="cut" points="14,14 24,40 32,24 40,40 50,14"/>` },
  { id: 43, name: "Shield P", picks: "R461, R303", series: "high", svg: `
    <path class="ink" d="M8 6 H56 V36 L32 60 L8 36 Z"/>
    <path class="cut" d="M24 50 V16 H36 A8 8 0 0 1 36 32 H24"/>` },
  { id: 44, name: "Grid PW", picks: "R461", series: "high", svg: `
    <path class="ink line" d="M8 58 V8 H26 V30 H8"/>
    <path class="mark line" d="M34 8 V56 H45 V30 V56 H56 V8"/>` },
  { id: 45, name: "Ring P", picks: "R382", series: "high", svg: `
    <line class="ink line" x1="18" y1="60" x2="18" y2="8"/>
    <circle class="mark line" cx="34" cy="22" r="13"/>` },
  { id: 46, name: "Pixel P", picks: "R375", series: "high", svg: `
    <g class="ink"><rect x="16" y="4" width="9" height="9"/><rect x="27" y="4" width="9" height="9"/><rect x="16" y="15" width="9" height="9"/><rect x="38" y="15" width="9" height="9"/><rect x="16" y="26" width="9" height="9"/><rect x="27" y="26" width="9" height="9"/><rect x="16" y="37" width="9" height="9"/><rect x="16" y="48" width="9" height="9"/></g>
    <rect class="mark" x="38" y="4" width="9" height="9"/>` },
  { id: 47, name: "Weave", picks: "R375", series: "high", svg: `
    <path class="mark line" d="M6 22 H58 M6 42 H58"/>
    <path class="ink line" d="M22 6 V58 M42 6 V58"/>
    <path class="cut wide" d="M34 22 H50 M14 42 H30"/>
    <path class="mark line" d="M34 22 H50 M14 42 H30"/>
    <path class="cut wide" d="M22 14 V30 M42 34 V50"/>
    <path class="ink line" d="M22 14 V30 M42 34 V50"/>` },
  { id: 48, name: "Route W", picks: "R461", series: "high", svg: `
    <polyline class="ink line" points="6,12 18,52 31,28 44,52 54,22"/>
    <path class="mark" d="M60 6 L58 28 L48 18 Z"/>` },
  { id: 49, name: "Badge W", picks: "R461, R303", series: "high", svg: `
    <rect class="ink" x="4" y="4" width="56" height="56" rx="14"/>
    <polyline class="cut wide" points="13,18 22,46 32,28 42,46 51,18"/>
    <circle class="mark" cx="32" cy="28" r="4.5"/>` },
  { id: 50, name: "Split P", picks: "R303", series: "high", svg: `
    <path class="ink" d="M12 6 H34 A18 18 0 0 1 34 42 H28 V58 H12 Z"/>
    <line class="cut" x1="4" y1="54" x2="58" y2="4"/>
    <circle class="mark" cx="48" cy="52" r="6"/>` },
  { id: 51, name: "Road W", picks: "R461", series: "high", svg: `
    <polyline class="ink line road" points="6,12 18,52 32,28 46,52 58,12"/>
    <polyline class="cut" points="6,12 18,52 32,28 46,52 58,12"/>
    <polyline class="mark dashes" points="6,12 18,52 32,28 46,52 58,12"/>` },
  // Explosive: what a game would wear, past what a tool usually dares.
  { id: 52, name: "Starburst P", picks: "R382", series: "explosive", svg: `
    <g class="mark rays"><path d="M32 1 V9 M32 55 V63 M1 32 H9 M55 32 H63 M10 10 L16 16 M48 48 L54 54 M54 10 L48 16 M10 54 L16 48"/></g>
    <path class="ink" d="M22 14 H34 A10 10 0 0 1 34 34 H30 V50 H22 Z"/>` },
  { id: 53, name: "Spiral P", picks: "R382", series: "explosive", svg: `
    <path class="ink line thin" d="M20 60 V22 A15 15 0 1 1 35 37 A9 9 0 1 1 28 26"/>
    <circle class="mark" cx="28" cy="26" r="5"/>` },
  { id: 54, name: "Glitch W", picks: "R461", series: "explosive", svg: `
    <polyline class="soft line" points="10,14 22,52 35,32 48,52 60,14"/>
    <polyline class="mark line" points="7,12 19,50 32,30 45,50 57,12"/>
    <polyline class="ink line" points="4,10 16,48 29,28 42,48 54,10"/>` },
  { id: 55, name: "Thorn rune", picks: "R382", series: "explosive", svg: `
    <line class="ink line" x1="20" y1="4" x2="20" y2="60"/>
    <polyline class="mark line" points="20,16 44,32 20,48"/>` },
  { id: 56, name: "Maze", picks: "R375", series: "explosive", svg: `
    <polyline class="ink edge" points="6,6 58,6 58,58 14,58 14,14 50,14 50,50 22,50 22,22 42,22 42,42 32,42"/>
    <circle class="mark" cx="32" cy="42" r="5"/>` },
  { id: 57, name: "Rising W", picks: "R461", series: "explosive", svg: `
    <line class="ink" x1="6" y1="12" x2="18" y2="52" stroke-width="2"/>
    <line class="ink" x1="18" y1="52" x2="31" y2="28" stroke-width="4.5"/>
    <line class="ink" x1="31" y1="28" x2="44" y2="52" stroke-width="7"/>
    <line class="mark" x1="44" y1="52" x2="58" y2="8" stroke-width="10"/>` },
  { id: 58, name: "P over W", picks: "R461, R303", series: "explosive", svg: `
    <polyline class="mark line" points="6,14 18,54 32,30 46,54 58,14"/>
    <path class="cut over" d="M18 58 V8 H32 A11 11 0 0 1 32 30 H18"/>
    <path class="ink line" d="M18 58 V8 H32 A11 11 0 0 1 32 30 H18"/>` },
  { id: 59, name: "Constellation", picks: "R382, R375", series: "explosive", svg: `
    <polyline class="soft-line" points="8,50 14,14 28,10 30,26 16,32 34,54 46,30 52,52 58,12"/>
    <g class="ink"><circle cx="8" cy="50" r="3"/><circle cx="14" cy="14" r="4"/><circle cx="28" cy="10" r="3"/><circle cx="30" cy="26" r="3.5"/>
    <circle cx="16" cy="32" r="3"/><circle cx="34" cy="54" r="4"/><circle cx="52" cy="52" r="3"/><circle cx="58" cy="12" r="4"/></g>
    <path class="mark" d="M46 22 L50 30 L46 38 L42 30 Z"/>` },
  { id: 60, name: "Shuttle", picks: "R303", series: "explosive", svg: `
    <path class="mark line thin" d="M32 32 C44 44 52 50 60 60"/>
    <path class="ink" d="M2 32 C14 14 50 14 62 32 C50 50 14 50 2 32 Z"/>
    <rect class="cut-fill" x="22" y="28" width="20" height="8" rx="4"/>
    <circle class="mark" cx="32" cy="32" r="3"/>` },
  { id: 61, name: "Shattered P", picks: "R303", series: "explosive", svg: `
    <path class="ink" d="M12 6 H26 V24 L12 40 Z M12 45 L26 29 V58 H12 Z M30 6 H40 L50 16 V20 L30 26 Z"/>
    <path class="mark" d="M30 30 L50 24 V28 L42 38 H30 Z"/>` },
  // Free: playing with the words of the name and the world of the game.
  { id: 62, name: "Footsteps P", picks: "R375", series: "free", svg: `
    <path class="ink dots" d="M18 60 V8 H34 A13 13 0 0 1 34 34 H18"/>
    <circle class="mark" cx="18" cy="60" r="5"/>` },
  { id: 63, name: "Needle", picks: "R461", series: "free", svg: `
    <path class="mark line thin" d="M54 12 C40 2 14 2 8 14 L18 50 L30 26 L42 50 L50 28"/>
    <path class="ink" d="M52 2 H58 L57 50 L55 62 L53 50 Z"/>
    <ellipse class="cut-fill" cx="55" cy="10" rx="1.6" ry="4"/>` },
  { id: 64, name: "Loom W", picks: "R382", series: "free", svg: `
    <path class="soft-line" d="M10 4 V60 M21 4 V60 M32 4 V60 M43 4 V60 M54 4 V60"/>
    <polyline class="ink line" points="6,12 18,52 32,26 46,52 58,12"/>` },
  { id: 65, name: "Keystone P", picks: "R375, R382", series: "free", svg: `
    <polyline class="ink edge" points="18,58 18,32 18,8 36,8 46,20 36,32 18,32"/>
    <g class="ink"><circle cx="18" cy="58" r="4"/><circle cx="18" cy="8" r="4"/><circle cx="36" cy="8" r="4"/><circle cx="36" cy="32" r="4"/><circle cx="18" cy="32" r="6"/></g>
    <path class="mark" d="M46 10 L56 20 L46 30 L36 20 Z"/>` },
  { id: 66, name: "Compass", picks: "R382", series: "free", svg: `
    <circle class="soft-line" cx="32" cy="32" r="26"/>
    <path class="ink" d="M32 2 L37 27 L62 32 L37 37 L32 62 L27 37 L2 32 L27 27 Z"/>
    <path class="mark" d="M32 2 L37 27 L32 32 L27 27 Z"/>` },
  { id: 67, name: "Pin P", picks: "R303", series: "free", svg: `
    <path class="ink" d="M22 62 V24 A18 18 0 1 1 40 42 H34 L22 62 Z"/>
    <circle class="cut-fill" cx="40" cy="24" r="7"/>
    <circle class="mark" cx="40" cy="24" r="3"/>` },
  { id: 68, name: "Ribbon W", picks: "R303, R461", series: "free", svg: `
    <line class="ink line wide" x1="6" y1="10" x2="18" y2="52"/>
    <line class="soft line wide" x1="18" y1="52" x2="32" y2="26"/>
    <line class="ink line wide" x1="32" y1="26" x2="46" y2="52"/>
    <line class="soft line wide" x1="46" y1="52" x2="58" y2="10"/>` },
  { id: 69, name: "8-bit P", picks: "R375", series: "free", svg: `
    <path class="ink" d="M16 4 H40 V12 H48 V28 H40 V36 H24 V60 H16 Z M24 12 V28 H40 V12 Z" fill-rule="evenodd"/>
    <rect class="mark" x="40" y="4" width="8" height="8"/>` },
  { id: 70, name: "Gem", picks: "R382", series: "free", svg: `
    <path class="ink" d="M18 6 H46 L58 22 L32 60 L6 22 Z"/>
    <path class="cut thin-cut" d="M6 22 H58 M18 6 L25 22 L32 60 M46 6 L39 22 L32 60"/>
    <path class="mark" d="M25 22 H39 L32 60 Z"/>` },
  { id: 71, name: "Orbit", picks: "R382", series: "free", svg: `
    <ellipse class="soft-line" cx="32" cy="32" rx="28" ry="12" transform="rotate(-30 32 32)"/>
    <circle class="ink" cx="32" cy="32" r="13"/>
    <circle class="mark" cx="52" cy="17" r="5"/>` },
];

const logoMark = (mark, size) =>
  `<svg class="logo-mark" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${mark.svg}</svg>`;
