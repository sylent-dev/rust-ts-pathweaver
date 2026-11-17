// The logo (2c): a logo in text for version 1, the name in a font and its P as the icon of the
// browser tab (the owner, 2026-11-17). The 42 marks drawn before (30 to 71) were set aside; they
// are in the history of Git (commit 35aa8db), and a symbol waits in docs/backlog.md.
//
// Fourteen open fonts (SIL Open Font License, from Google Fonts while the font is chosen),
// numbered after the marks, from sober to bold; each with the weight that suits it, and a smaller
// size for the widest, so that the name fits the box.

const LOGO_FONTS = [
  { id: 72, name: "Geist", weight: 600, note: "the font of Frost today" },
  { id: 73, name: "Space Grotesk", weight: 600, note: "a grotesque with quirks" },
  { id: 74, name: "Sora", weight: 600, note: "round and wide" },
  { id: 75, name: "Manrope", weight: 700, note: "modern, open" },
  { id: 76, name: "Instrument Sans", weight: 600, note: "narrow and precise" },
  { id: 77, name: "Bricolage Grotesque", weight: 600, note: "warm, ink traps" },
  { id: 78, name: "Syne", weight: 700, note: "wide, a little odd" },
  { id: 79, name: "Unbounded", weight: 600, size: 30, note: "very wide, rounded" },
  { id: 80, name: "Chakra Petch", weight: 600, note: "cut corners, a game interface" },
  { id: 81, name: "Rajdhani", weight: 700, note: "condensed, squared" },
  { id: 82, name: "Michroma", weight: 400, size: 28, note: "wide, technical" },
  { id: 83, name: "Big Shoulders Display", weight: 700, note: "tall and condensed" },
  { id: 84, name: "Fraunces", weight: 600, note: "a soft serif" },
  { id: 85, name: "Cinzel", weight: 700, note: "carved capitals, fantasy" },
];

const LOGO_STYLES = ["frost", "frost-night", "ember"];

const logoIcon = (size, kind) =>
  `<span class="logo-icon is-${kind}" style="width:${size}px;height:${size}px;font-size:${Math.round(size * .74)}px">P</span>`;

const logoCard = font => `<div class="logo-card" style="--logo-font:'${font.name}';--logo-weight:${font.weight}">
  <div class="logo-card-title">${font.id} · ${escapeHtml(font.name)} <small>${escapeHtml(font.note)}</small></div>
  <div class="logo-styles">${LOGO_STYLES.map(style => `
    <div class="logo-style" data-sample-theme="${style}" title="${THEMES[style].title}">
      <div class="logo-big logo-name" style="font-size:${font.size ?? 38}px">Pathweaver</div>
      <div class="logo-bar">${logoIcon(22, "square")}<span class="logo-name">Pathweaver</span></div>
      <div class="logo-tab">${logoIcon(16, "square")}<span>${escapeHtml(BUILDS.open[0].name)} · Pathweaver</span></div>
      <div class="logo-icons">${logoIcon(64, "square")}${logoIcon(32, "square")}${logoIcon(16, "square")}${logoIcon(32, "plain")}${logoIcon(16, "plain")}</div>
    </div>`).join("")}
  </div>
</div>`;

addSection(() => ["The logo · the name in fourteen open fonts, with its P as the icon of the tab: large, in the app bar, in the tab of the browser, alone at 64, 32 and 16 px, on Frost, Frost Night and Ember",
  LOGO_FONTS.map(font => ["", logoCard(font)])]);
