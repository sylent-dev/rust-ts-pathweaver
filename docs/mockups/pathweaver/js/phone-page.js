// The phone page (2m, specs.md, Screens): under 600 px, one message in place of the application, on every
// page (the owner, 2026-11-21: the players use a computer, no window drawn again for the phone), as the message
// under the disappointed robot of Stepwise. Its look in css/phone-page.css.

// The texts, in the translation file like every text. The address is a stand-in until the deployment (step 3)
// chooses where on sylent.tools the website lives.
const PHONE_TEXT = {
  title: "Pathweaver needs a computer",
  why: "It is made for a computer next to the game: its passive tree needs a large screen.",
  open: "Open it there:",
  address: "pathweaver.sylent.tools",
};

// The disappointed faces compared (2m), numbered U1 to U4, at three temperatures.
const PHONE_FACES = {
  // U1 · normal: a face drawn with a line, in the colour of the text.
  line: () => `<svg class="ph-face ph-line" width="88" height="88" viewBox="0 0 48 48" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="24" cy="24" r="21"/>
    <circle cx="17" cy="20" r="1.6" fill="currentColor" stroke="none"/><circle cx="31" cy="20" r="1.6" fill="currentColor" stroke="none"/>
    <path d="M16 34q8-7 16 0"/></svg>`,
  // U2 · high: the mark of Pathweaver fallen on its side, gone grey, its accent left only in a tear.
  mark: () => `<span class="ph-face ph-mark">${logoMark(88)}<span class="ph-tear"></span></span>`,
  // U3 · high: a notable passive of the tree left unlit, its frame the ring of the face, the face drawn over
  // its grey icon.
  passive: () => `<span class="ph-face ph-passive">${passiveIcon(7, 72)}<svg width="96" height="96" viewBox="0 0 48 48"
    fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true">
    <circle cx="24" cy="24" r="22.5" stroke-width="1.5"/><circle cx="24" cy="24" r="19.5" stroke-width="0.75" opacity=".5"/>
    <circle cx="18" cy="21" r="1.8" fill="currentColor" stroke="none"/><circle cx="30" cy="21" r="1.8" fill="currentColor" stroke="none"/>
    <path d="M17.5 33q6.5-5.5 13 0" stroke-width="2"/></svg></span>`,
  // U4 · explosive: a round face in the accent, larger, its head tilted, sighing.
  accent: () => `<svg class="ph-face ph-accent" width="120" height="120" viewBox="0 0 48 48" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle class="ph-accent-disc" cx="24" cy="24" r="21"/>
    <path d="M14.5 19.5q3 1.6 5.5 0M28 19.5q2.5 1.6 5.5 0"/><path d="M17 34.5q7-5 14 0"/>
    <path class="ph-accent-drop" d="M36.5 25.5q2 3 0 4.4q-2-1.4 0-4.4z" fill="currentColor" stroke="none"/></svg>`,
};

// A phone of 390 × 844 px, on Frost Night as the home page: the brand at its top, the message in the middle.
const phoneWindow = face => `<div class="app-window ph-window" data-sample-theme="frost-night" style="width:390px;height:844px">
  <div class="ph-brand">${logoMark(22)}<span class="logo-name">Pathweaver</span></div>
  <div class="ph-message">
    ${PHONE_FACES[face]()}
    <h2 class="ph-title">${PHONE_TEXT.title}</h2>
    <p>${PHONE_TEXT.why}</p>
    <p class="ph-open">${PHONE_TEXT.open}<code>${PHONE_TEXT.address}</code></p>
  </div>
</div>`;
