// The phone page (2m, specs.md, Screens): under 600 px, one message in place of the application, on every
// page (the owner, 2026-11-21: the players use a computer, no window drawn again for the phone), as the message
// under the disappointed robot of Stepwise. Its look in css/phone-page.css.

// The texts, in the translation file like every text: one sentence a line (the owner, 2026-11-21), without the
// address of the website.
const PHONE_TEXT = {
  title: "Pathweaver needs a computer",
  why: ["It is made for a computer next to the game:", "its passive tree needs a large screen."],
};

// The face (2m, U14 of twenty-three, the owner, 2026-11-21): the sticky note of an unknown id, in its yellow,
// turned, a light shadow under it, two eyes and a mouth in a slash drawn on it (the frown too expressive for a
// message that blames nobody; flat, short, wavy and to the side set aside). Faces of a line, a disc, a square, a
// gem, a passive, in pixels, squeezed, shaking, the mark as a head, and the note taped, pinned, peeling, stacked,
// falling or holding the whole message set aside (in the history of Git).
const phoneFace = () => `<svg class="ph-note" width="92" height="92" viewBox="0 0 48 48" fill="none"
  stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
  <rect class="ph-note-paper" x="5" y="5" width="38" height="38" stroke="none"/>
  <circle cx="18" cy="21" r="1.8" fill="currentColor" stroke="none"/><circle cx="30" cy="21" r="1.8" fill="currentColor" stroke="none"/>
  <path d="M19 33.5l10-3"/></svg>`;

// A phone of 390 × 844 px, on Frost Night as the home page: the brand at its top, the message in the middle.
const phoneWindow = () => `<div class="app-window ph-window" style="width:390px;height:844px">
  <div class="ph-brand">${logoMark(22)}<span class="logo-name">Pathweaver</span></div>
  <div class="ph-message">
    ${phoneFace()}
    <h2 class="ph-title">${PHONE_TEXT.title}</h2>
    ${PHONE_TEXT.why.map(line => `<p>${line}</p>`).join("")}
  </div>
</div>`;
