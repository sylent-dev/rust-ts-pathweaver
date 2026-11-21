// The phone page (2m, specs.md, Screens): under 600 px, one message in place of the application, on every
// page (the owner, 2026-11-21: the players use a computer, no window drawn again for the phone), as the message
// under the disappointed robot of Stepwise. Its look in css/phone-page.css.

// The texts, in the translation file like every text: one sentence a line (the owner, 2026-11-21), without the
// address of the website (« Open it there » taken off).
const PHONE_TEXT = {
  title: "Pathweaver needs a computer",
  why: ["It is made for a computer next to the game:", "its passive tree needs a large screen."],
};

// The open decisions of the phone page: the mouth of the face and the colour of its note, applied at once to
// every face (lists, since they combine).
const MOUTHS = { slash: "Slash", flat: "Flat", short: "Short", wavy: "Wavy", side: "Side", frown: "Frown" };
const NOTE_TONES = { yellow: "Yellow, as the « ? » of an unknown id", grey: "Grey, as a free text" };
VARIANTS.mouth = { label: "Mouth", select: true, options: MOUTHS, fallback: "slash" };
VARIANTS.note = { label: "Note", select: true, options: NOTE_TONES, fallback: "yellow" };
for (const key of ["mouth", "note"]) chosen[key] = accepts(VARIANTS[key], params.get(key)) ? params.get(key) : VARIANTS[key].fallback;

// The face drawn on a note, in a box of 48 × 48: two eyes, then the mouth chosen (the owner, 2026-11-21: the
// frown too expressive for a message that blames nobody).
const MOUTH_PATHS = {
  frown: "M17 33q7-5.5 14 0",
  slash: "M19 33.5l10-3",
  flat: "M17.5 32h13",
  short: "M21 32h6",
  wavy: "M16.5 32.5q1.9-2 3.75 0t3.75 0t3.75 0t3.75 0",
  side: "M22 31.5q4.5-1 9 1.6",
};
const noteFace = (size = 92) => `<svg class="ph-note-face" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none"
  stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect class="ph-note-paper" x="5" y="5" width="38" height="38" stroke="none"/>
  <circle cx="18" cy="21" r="1.8" fill="currentColor" stroke="none"/><circle cx="30" cy="21" r="1.8" fill="currentColor" stroke="none"/>
  <path d="${MOUTH_PATHS[chosen.mouth]}"/></svg>`;

// The faces compared (2m): U1 to U16 in the history of Git; U14 kept (the owner, 2026-11-21), then six more that
// explore the note further. A face may hold the whole message (`whole`).
const PHONE_FACES = {
  u14: ["U14 · the note, turned, a light shadow under it", () => `<span class="ph-note">${noteFace()}</span>`],
  u18: ["U18 · hanging from a strip of tape, swinging a little", () => `<span class="ph-note is-taped">${noteFace()}<i class="ph-tape"></i></span>`],
  u19: ["U19 · pinned by a pin in the accent", () => `<span class="ph-note is-pinned">${noteFace()}<i class="ph-pin"></i></span>`],
  u20: ["U20 · its corner peeling off", () => `<span class="ph-note is-peeling">${noteFace()}<i class="ph-curl"></i></span>`],
  u21: ["U21 · a stack of three notes, fanned", () => `<span class="ph-note is-stacked"><i></i><i></i>${noteFace()}</span>`],
  u22: ["U22 · the whole message written on a large note", () => "", true],
  u23: ["U23 · falling from the top of the screen, landing with a bounce", () => `<span class="ph-note is-falling">${noteFace()}</span>`],
};

// A phone of 390 × 844 px, on Frost Night as the home page: the brand at its top, the message in the middle.
const phoneMessage = face => `<h2 class="ph-title">${PHONE_TEXT.title}</h2>
    ${PHONE_TEXT.why.map(line => `<p>${line}</p>`).join("")}`;
const phoneWindow = face => {
  const [, draw, whole] = PHONE_FACES[face];
  return `<div class="app-window ph-window" data-sample-theme="frost-night" data-note="${chosen.note}" style="width:390px;height:844px">
  <div class="ph-brand">${logoMark(22)}<span class="logo-name">Pathweaver</span></div>
  <div class="ph-message">
    ${whole ? `<div class="ph-sheet">${noteFace(56)}${phoneMessage()}</div>` : draw() + phoneMessage()}
  </div>
</div>`;
};
