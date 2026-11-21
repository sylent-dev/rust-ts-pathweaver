// The phone page (2m, specs.md, Screens): under 600 px, one message in place of the application, on every
// page (the owner, 2026-11-21: the players use a computer, no window drawn again for the phone), as the message
// under the disappointed robot of Stepwise. Its look in css/phone-page.css.

// The texts, in the translation file like every text: one sentence a line (the owner, 2026-11-21), without the
// address of the website (« Open it there » taken off).
const PHONE_TEXT = {
  title: "Pathweaver needs a computer",
  why: ["It is made for a computer next to the game:", "its passive tree needs a large screen."],
};

// The parts of a face drawn in a box of 48 × 48: the eyes, the mouths.
const EYES = (y = 20, r = 1.7, dx = 7) => `<circle cx="${24 - dx}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/><circle cx="${24 + dx}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
const FROWN = (y = 33, w = 8, depth = 6) => `<path d="M${24 - w} ${y}q${w} ${-depth} ${2 * w} 0"/>`;
const faceSvg = (cls, size, body, { stroke = 2 } = {}) => `<svg class="ph-face ${cls}" width="${size}" height="${size}" viewBox="0 0 48 48"
  fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

// A pixel face drawn on the cells of the graph paper: one letter a cell, « # » filled.
const PIXEL_FACE = [
  "....####....", "..##....##..", ".#........#.", ".#........#.", "#..##..##..#", "#..##..##..#",
  "#..........#", "#..........#", "#...####...#", ".#.#....#.#.", ".#........#.", "..##....##..", "....####....",
];
const pixelFace = cell => `<svg class="ph-face ph-pixel" width="${12 * cell}" height="${13 * cell}" aria-hidden="true">${PIXEL_FACE.flatMap((row, y) =>
  [...row].map((c, x) => c === "#" ? `<rect x="${x * cell}" y="${y * cell}" width="${cell - 1}" height="${cell - 1}"/>` : "")).join("")}</svg>`;

// The disappointed faces compared (2m): U1 to U4 first (in the history of Git), then twelve, U5 to U16, three at
// each of four temperatures (the owner, 2026-11-21).
const PHONE_FACES = {
  // Normal.
  u5: ["U5 · normal: a line, its mouth flat, unimpressed", () => faceSvg("ph-soft", 88,
    `<circle cx="24" cy="24" r="21"/>${EYES()}<path d="M17 32.5h14"/>`)],
  u6: ["U6 · normal: a disc of the weak grey, its features cut in the page", () => faceSvg("ph-disc", 88,
    `<circle class="ph-fill" cx="24" cy="24" r="21" stroke="none"/><g class="ph-cut">${EYES()}${FROWN()}</g>`, { stroke: 2.4 })],
  u7: ["U7 · normal: a square face, square corners as every box", () => faceSvg("ph-soft", 84,
    `<rect x="4" y="4" width="40" height="40"/>${EYES(20, 1.7, 8)}${FROWN(33, 9, 6)}`, { stroke: 2 })],
  // High.
  u8: ["U8 · high: a faceted hexagon, the mark of a gem, in the accent", () => faceSvg("ph-accent-line", 92,
    `<path d="M24 3l18.2 10.5v21L24 45 5.8 34.5v-21z"/><path d="M24 3v6M42.2 13.5l-5 3M42.2 34.5l-5-3M24 45v-6M5.8 34.5l5-3M5.8 13.5l5 3" stroke-width="1" opacity=".5"/>${EYES(21)}${FROWN(33, 7, 5)}`, { stroke: 1.8 })],
  u9: ["U9 · high: its eyes the diamonds of What's next, in the accent", () => faceSvg("ph-accent-line", 88,
    `<circle cx="24" cy="24" r="21"/><path d="M17 17l2.6 2.6L17 22.2l-2.6-2.6zM31 17l2.6 2.6L31 22.2l-2.6-2.6z" fill="currentColor" stroke="none"/>${FROWN()}`)],
  u10: ["U10 · high: a notable passive, its double ring, its eyes two passives unlit", () => faceSvg("ph-node", 92,
    `<circle cx="24" cy="24" r="22" stroke-width="1.6"/><circle cx="24" cy="24" r="19" stroke-width=".7" opacity=".5"/>
    <circle cx="17" cy="20" r="3" stroke-width="1.2"/><circle cx="31" cy="20" r="3" stroke-width="1.2"/><path d="M20 20h8" stroke-width=".7" opacity=".5"/>${FROWN(34, 7, 5)}`)],
  // Explosive.
  u11: ["U11 · explosive: in pixels, on the cells of the graph paper, in the accent", () => pixelFace(12)],
  u12: ["U12 · explosive: too wide for the phone, squeezed by its edges", () => `<span class="ph-squeeze">${faceSvg("ph-accent-line", 150,
    `<circle cx="24" cy="24" r="21"/>${EYES(20, 1.8, 8)}${FROWN(34, 9, 6)}`, { stroke: 1.6 })}</span>`],
  u13: ["U13 · explosive: a tear rolling, the face shaking its head", () => faceSvg("ph-shake", 110,
    `<circle cx="24" cy="24" r="21"/>${EYES(20)}${FROWN(34, 7, 5)}<path class="ph-roll" d="M31 24q2.2 3.2 0 4.8q-2.2-1.6 0-4.8z" fill="currentColor" stroke="none"/>`, { stroke: 1.8 })],
  // Fun.
  u14: ["U14 · fun: the grey sticky note of a free text, a face drawn on it", () => faceSvg("ph-note", 92,
    `<rect class="ph-fill" x="5" y="5" width="38" height="38" stroke="none"/><path d="M5 5h38v38H5z" stroke-width=".6" opacity=".3"/>${EYES(21, 1.8)}${FROWN(33, 8, 5)}`, { stroke: 2.2 })],
  u15: ["U15 · fun: its eyes looking aside for a computer, blinking, a drop of sweat", () => faceSvg("ph-blink", 92,
    `<circle cx="24" cy="24" r="21"/><g class="ph-eyes"><circle cx="20" cy="20" r="1.8" fill="currentColor" stroke="none"/><circle cx="34" cy="20" r="1.8" fill="currentColor" stroke="none"/></g>
    <path d="M19 33q5-3.5 10-1.5"/><path class="ph-sweat" d="M10 12q2.4 3.4 0 5q-2.4-1.6 0-5z" stroke-width="1.2"/>`)],
  u16: ["U16 · fun: the triangle of the mark as a head, in the accent", () => faceSvg("ph-accent-line", 96,
    `<path d="M3 7h42L24 44z"/>${EYES(17, 1.8, 6)}<path d="M19.5 27q4.5-3.5 9 0"/>`, { stroke: 2 })],
};

// A phone of 390 × 844 px, on Frost Night as the home page: the brand at its top, the message in the middle.
const phoneWindow = face => `<div class="app-window ph-window" data-sample-theme="frost-night" style="width:390px;height:844px">
  <div class="ph-brand">${logoMark(22)}<span class="logo-name">Pathweaver</span></div>
  <div class="ph-message">
    ${PHONE_FACES[face][1]()}
    <h2 class="ph-title">${PHONE_TEXT.title}</h2>
    ${PHONE_TEXT.why.map(line => `<p>${line}</p>`).join("")}
  </div>
</div>`;
