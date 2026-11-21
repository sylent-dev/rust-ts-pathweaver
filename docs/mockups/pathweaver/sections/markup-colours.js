// The named colours of the author's markup on Frost Night (2n4, specs.md, The author's texts): each readable on the
// cards, 4.5 to 1 at least on the lightest surface an author's text shows on (the band, #0f1726); black a grey at
// 4.5 to 1 (B2 of three, the owner, 2026-11-22: as written, 1.1 to 1, and as grey set aside; css/tokens.css).

const MARKUP_NAMES = ["white", "grey", "black", "red", "green", "blue", "yellow", "orange", "gold", "purple", "cyan", "magenta"];
// The ratios on the band, the lightest surface.
const MARKUP_RATIOS = { white: "17.9", grey: "5.3", black: "4.5", red: "4.6", green: "8.1", blue: "5.8", yellow: "11.7", orange: "7.3", gold: "7.7", purple: "5.0", cyan: "9.8", magenta: "4.9" };

addSection(() => {
  const line = name => `<${name}>{${name}${MARKUP_RATIOS[name] ? ` · ${MARKUP_RATIOS[name]} to 1` : ""}: hold the skill on bosses}`;
  const note = { head: "Spark", text: MARKUP_NAMES.map(line).join("\n") };
  const words = `<grey>{Prefixes:} gain damage as extra > <black>{increased spell damage} > <gold>{cold damage}`;
  return ["The named colours of the author's markup on Frost Night: each at 4.5 to 1 or more, black a grey", [
    ["The twelve named colours in the note of an author, the card opaque over rows", staticNoteCard(note)],
    ["A hint as an author writes it, black between grey and gold", staticNoteCard({ head: "Weapon · Pyrophyte Staff", text: words })],
  ]];
});
