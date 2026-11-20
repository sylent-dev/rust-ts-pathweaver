// The mark of an id the game data don't know (2j3b): twelve variants, three at each of four
// temperatures (normal, high, explosive, fun), each on the same case: two rows of skills (an unknown
// support on a known skill, an unknown skill), then the inventory with an unknown unique in a large
// slot (Helm1) and a small one (Ring2), and an unknown slot in the list under it (Trinket2). Only the
// styles change (css/unknown-variants.css); N1 is the mark drawn at 2j3.

const UNKNOWN_VARIANTS = [
  ["N1", "Normal", "The amber mark (2j3): a dashed outline, a square « ? », « unknown »"],
  ["N2", "Normal", "Faded: what isn't known steps back, in the weak grey, its gem hollow"],
  ["N3", "Normal", "Amber words: the name in amber with a « ? », a fine amber line, the gem hollow"],
  ["H1", "High", "Caution stripes: amber hatching behind the slot and under the name"],
  ["H2", "High", "Spell-check: an amber wavy underline, a folded corner"],
  ["H3", "High", "The corner flag: an amber triangle holding « ? », the gem replaced by « ? »"],
  ["E1", "Explosive", "Glitch: the colours split, scanlines, the « ? » jitters"],
  ["E2", "Explosive", "Missing texture: the magenta and black checkerboard of a game engine"],
  ["E3", "Explosive", "Pulse: an amber glow that breathes"],
  ["F1", "Fun", "The raw id: in the monospaced font, « ∅ » for the mark, as a developer reads it"],
  ["F2", "Fun", "Fog: the item behind a mist, its « ? » floating"],
  ["F3", "Fun", "Sticky note: a yellow note pinned on the slot and after the name"],
];

// The case: a known skill with an unknown support, then an unknown skill, as a file made for another
// version of the game shows them (the end of the id for a name).
function unknownSkills(level) {
  const [known] = SHOWN.skills;
  const rows = [
    { ...known, levels: [1, 100], supports: [known.supports[0], { ...known.supports[1], name: "SupportGemEchoingThunder", known: false, lineage: false, note: "" }] },
    { name: "SkillGemFrostBombII", kind: "active", colour: "", levels: [1, 100], known: false, lineage: false, note: "", supports: [known.supports[2]] },
  ].map(skill => skillRow(skill, level));
  return `<h2 class="app-side-title app-title">Skills</h2><ul class="app-skills" data-level="${level}">${rows.map(skillLine).join("")}</ul>`;
}
function unknownHints(level) {
  return [...sampleHints(level).filter(hint => hint.id !== "Helm1"),
    { id: "Helm1", x: 0, y: 0, levels: [1, 100], unique: "Crown of Embers", base: "", note: "", unknown: true }];
}

addSection(() => ["The mark of what the game data don't know: twelve variants (N normal, H high, E explosive, F fun)",
  UNKNOWN_VARIANTS.map(([id, temperature, label]) => [`${id} · ${temperature} · ${label}`,
    `<div class="app-window" style="width:330px"><aside class="app-side app-inventory-alone unk unk-${id.toLowerCase()}">${unknownSkills(STATE.level)}${inventoryBox(STATE.level, unknownHints(STATE.level))}</aside></div>`])]);
