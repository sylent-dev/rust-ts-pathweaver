// The rules of the levels (specs.md, The level), as the core will apply them: which entries
// apply at a level, the markers of the build, what changes at a marker. The mock-up computes
// them from the real build, so that every number on the page is a real one.

const SHOWN = BUILDS.shown;
const MAX_LEVEL = 100;
const ASCENDANCY_POINTS = 8;

const appliesAt = ([low, high], level) => low <= level && level <= high;
const startsAt = ([low], level) => low === level;

// The passives of the tree that apply at the level, for a weapon set (0: the shared ones only).
const passivesAt = (level, set) => TREE.taken.filter(([, low, high, s]) => s === set && appliesAt([low, high], level));

// The markers of a build of BUILDS.changes (specs.md, The level): each level where what it holds
// differs from what it held at the level before, passives aside: a passive that starts makes no
// marker (a file can add one at every level), passives given back (a respec) make one.
const PASSIVES_TAKEN = ["taken", "set1", "set2", "ascendancy"];
const isMarker = record => record.count > PASSIVES_TAKEN.filter(group => record.passives[group] > 0).length;
const markers = key => Object.entries(BUILDS.changes[key].levels)
  .filter(([, record]) => isMarker(record)).map(([level]) => Number(level)).sort((a, b) => a - b);

// The skills of a build at the level, each with the supports that apply with it. A support applies only
// with its skill: its levels are those where both apply (2k: the card of a support said « From the
// start » under a skill that only comes at 59).
const within = ([low, high], [skillLow, skillHigh]) => [Math.max(low, skillLow), Math.min(high, skillHigh)];
const skillsOf = (skills, level) => skills
  .filter(skill => appliesAt(skill.levels, level))
  .map(skill => ({ ...skill, supports: skill.supports.filter(support => appliesAt(support.levels, level))
    .map(support => ({ ...support, levels: within(support.levels, skill.levels) })) }));
const skillsAt = level => skillsOf(SHOWN.skills, level);

// The hints of the inventory at the level: of both weapon sets, or of one (1 or 2).
const slotsAt = (level, set) => SHOWN.slots.filter(slot => appliesAt(slot.levels, level) && (set === undefined || slotSet(slot.id) !== otherSet(set)));
// The slots of the weapons belong to a weapon set: Weapon1 and Offhand1 to set I, Weapon2 and Offhand2 to set II.
const slotSet = id => /^(Weapon|Offhand)([12])$/.exec(id)?.[2] ?? "0";
const otherSet = set => (set === 1 ? "2" : "1");

// The name of an item without the base its author wrote after it, « (Dex Base) » (2g3, the owner,
// 2026-11-19): the window of what changes says what changes, not what the item is; the gear tab
// will show the base, read from the game data. « (Resistance Base) », not an attribute, stays.
const withoutBase = text => text.replace(/\s*\((?:Str|Dex|Int)(?:\/(?:Str|Dex|Int))? Base\)$/, "");

const plural = (count, one, many = one + "s") => `${count} ${count === 1 ? one : many}`;

// The names of the inventory slots: texts of the interface, not game data (docs/game-data.md).
const SLOT_NAMES = {
  Weapon1: "Weapon", Weapon2: "Weapon", Offhand1: "Offhand", Offhand2: "Offhand", Helm1: "Helmet",
  BodyArmour1: "Body", Gloves1: "Gloves", Boots1: "Boots", Belt1: "Belt", Amulet1: "Amulet",
  Ring1: "Ring", Ring2: "Ring", Flask1: "Flask", Flask2: "Flask", Charm1: "Charm", Trinket1: "Trinket",
};

// Where a hint is drawn (2k2c, the owner, 2026-11-21): two writings of a slot that the drawing has, brought to
// the cell the other files write, so that they aren't left in the list under the drawing.
// - The mana flask in Flask2 (Path of Building, poe2-tools: 2 files of the corpus; the campaign writes its
//   levels in blue there, in red in Flask1) is Flask1, cell 1, as Mobalytics and Maxroll write it.
// - A charm in Trinket1 (Maxroll, cells 2 to 4: 7 entries, its 2 builds) is in Charm1, its cell less 2, as
//   Mobalytics and Path of Building write it: an item the game data know as a charm, so a free text stays.
// The rule of the code is measured and tested in the core at step 6 (docs/backlog.md).
function drawnSlot(hint) {
  if (hint.id === "Flask2") return { ...hint, id: "Flask1", x: 1 };
  const kind = BUILDS.items[hint.unique || withoutBase(hint.base)]?.kind;
  if (hint.id === "Trinket1" && kind === "Charm" && hint.x >= 2 && hint.x <= 4) return { ...hint, id: "Charm1", x: hint.x - 2 };
  return hint;
}
SHOWN.slots = SHOWN.slots.map(drawnSlot);
for (const key of Object.keys(BUILDS.inventories)) BUILDS.inventories[key] = BUILDS.inventories[key].map(drawnSlot);
