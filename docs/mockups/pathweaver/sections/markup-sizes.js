// The markup of the author's texts as the documentation of Grinding Gear Games writes it (4g1, read on
// 2026-11-24; specs.md, The author's texts): the sizes s, m and l, small, medium and large (css/tokens.css),
// and its fourteen named colours on Frost Night, each at 4.5 to 1 or more on the
// band, black a grey (2n4), unique the gold of a unique item; purple, cyan and magenta, which it doesn't
// name, as plain text. The notes are those of the corpus, as their authors wrote them.

// The fourteen named colours and their ratios on the band, the lightest surface (css/tokens.css).
const MARKUP_RATIOS = {
  white: "17.9", grey: "5.3", black: "4.5", red: "4.6", orange: "7.3", yellow: "11.7", green: "8.1",
  blue: "5.8", indigo: "5.0", violet: "5.0", bronze: "5.2", silver: "8.3", gold: "7.7", unique: "7.8",
};

addSection(() => {
  const colours = Object.entries(MARKUP_RATIOS).map(([name, ratio]) => `<${name}>{${name} · ${ratio} to 1: hold the skill on bosses}`).join("\n");
  const unnamed = ["purple", "cyan", "magenta"].map(name => `<${name}>{${name}: not named by Grinding Gear Games}`).join("\n");
  return ["The markup of Grinding Gear Games: the sizes s, m and l, and its fourteen named colours", [
    ["Maxroll: a head in b and m, its text in s and i", staticNoteCard({ head: "Skill Gem Quality", text: "<b>{<m>{Allocation Step #1}}\r\n<s>{- }<i>{<s>{Next node: Skill Gem Quality}}" })],
    ["Mobalytics: a head in m and gold over a text without a size", staticNoteCard({ head: "Comet", text: "<m>{<gold>{THE NUKE - Set 1}}\n<gold>{91 spirit qualitied. Level Comet max. For rares/bosses/juice - not for white packs.}" })],
    ["Grinding Gear Games, its sample: a whole note in m", staticNoteCard({ head: "Strength", text: "<m>{<red>{Strength +5 is recommended}}" })],
    ["Grinding Gear Games, its sample: silver over grey", staticNoteCard({ head: "Weapon · Any Two Handed Mace", text: "<silver>{Any Two Handed Mace}\n\n<grey>{Stat Priority\n-------------------\n1. Prioritize highest physical dps}" })],
    ["poe2.tools: bronze among the other colours", staticNoteCard({ head: "Weapon · Recurve Bow", text: "Get <green>{lvl 5} <yellow>{Shortbow} at <red>{Red Vale} - <blue>{Trans + Aug}\nLook for <green>{lvl 11} <yellow>{Warden Bow} - Highest DMG\nLook for <green>{lvl 16} <yellow>{Recurve Bow} - <bronze>{Craft 2 sockets + 6 mod}" })],
    ["The fourteen named colours, then the three the documentation doesn't name, as plain text", staticNoteCard({ head: "Spark", text: `${colours}\n${unnamed}` })],
    ["A size in the large l, written by no author of the corpus", staticNoteCard({ head: "Orb of Storms", text: "<l>{Large head}\n<m>{Medium head}\n<s>{Small text, the text of a note}\nText without a size" })],
    ["The Amazon of Maxroll in the About tab: its description in s, m, i, u and rgb", aboutTabWindow("amazon")],
  ]];
});
