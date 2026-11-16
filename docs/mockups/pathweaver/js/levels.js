// The rules of the levels (specs.md, The level), as the core will apply them: which entries
// apply at a level, the markers of the build, what changes at a marker. The mock-up computes
// them from the real build, so that every number on the page is a real one.

const SHOWN = BUILDS.shown;
const MAX_LEVEL = 100;
const ASCENDANCY_POINTS = 8;

const appliesAt = ([low, high], level) => low <= level && level <= high;
const startsAt = ([low], level) => low === level;
// Stopped just before the level: listed as removed at it.
const stoppedAt = ([, high], level) => high === level - 1;

// The passives of the tree that apply at the level, for a weapon set (0: the shared ones only).
const passivesAt = (level, set) => TREE.taken.filter(([, low, high, s]) => s === set && appliesAt([low, high], level));

// Every level where a skill, a support or an inventory hint starts or stops, or where passives
// stop (a respec); a passive that starts makes no marker.
function markers() {
  const levels = new Set();
  const add = ([low, high], withStart = true) => {
    if (withStart && low > 1) levels.add(low);
    if (high < MAX_LEVEL) levels.add(high + 1);
  };
  for (const skill of SHOWN.skills) {
    add(skill.levels);
    for (const support of skill.supports) add(support.levels);
  }
  for (const slot of SHOWN.slots) add(slot.levels);
  for (const [, low, high] of TREE.taken) add([low, high], false);
  return [...levels].sort((a, b) => a - b);
}

// The skills at the level, each with the supports that apply with it.
const skillsAt = level => SHOWN.skills
  .filter(skill => appliesAt(skill.levels, level))
  .map(skill => ({ ...skill, supports: skill.supports.filter(support => appliesAt(support.levels, level)) }));

// The hints of the inventory at the level: of both weapon sets, or of one (1 or 2).
const slotsAt = (level, set) => SHOWN.slots.filter(slot => appliesAt(slot.levels, level) && (set === undefined || slotSet(slot.id) !== otherSet(set)));
// The slots of the weapons belong to a weapon set: Weapon1 and Offhand1 to set I, Weapon2 and Offhand2 to set II.
const slotSet = id => /^(Weapon|Offhand)([12])$/.exec(id)?.[2] ?? "0";
const otherSet = set => (set === 1 ? "2" : "1");

// What changes at a level: what starts, as new; what stopped just before it, as removed.
function changesAt(level) {
  const skills = SHOWN.skills.filter(skill => startsAt(skill.levels, level));
  const supports = SHOWN.skills.filter(skill => appliesAt(skill.levels, level) && !startsAt(skill.levels, level))
    .flatMap(skill => skill.supports.filter(support => startsAt(support.levels, level)).map(support => ({ ...support, skill: skill.name })));
  const slots = SHOWN.slots.filter(slot => startsAt(slot.levels, level));
  const passives = TREE.taken.filter(([, low, high]) => startsAt([low, high], level)).length
    + TREE.ascendancyTaken.filter(([, low, high]) => startsAt([low, high], level)).length;
  const removed = SHOWN.skills.filter(skill => stoppedAt(skill.levels, level)).length
    + SHOWN.skills.flatMap(skill => skill.supports).filter(support => stoppedAt(support.levels, level)).length
    + SHOWN.slots.filter(slot => stoppedAt(slot.levels, level)).length;
  const removedPassives = TREE.taken.filter(([, low, high]) => stoppedAt([low, high], level)).length;
  return { skills, supports, slots, passives, removed, removedPassives };
}

const plural = (count, one, many = one + "s") => `${count} ${count === 1 ? one : many}`;

// The names of the inventory slots: texts of the interface, not game data (docs/game-data.md).
const SLOT_NAMES = {
  Weapon1: "Weapon", Weapon2: "Weapon", Offhand1: "Offhand", Offhand2: "Offhand", Helm1: "Helmet",
  BodyArmour1: "Body", Gloves1: "Gloves", Boots1: "Boots", Belt1: "Belt", Amulet1: "Amulet",
  Ring1: "Ring", Ring2: "Ring", Flask1: "Flask", Flask2: "Flask", Charm1: "Charm", Trinket1: "Trinket",
};
