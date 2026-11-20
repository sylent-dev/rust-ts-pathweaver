// The skills of the right column of the Overview: a row per skill that applies at the level.
//
// N2 of twelve variants (2j2, the owner, 2026-11-20; the others in the history of Git): the mark of the
// skill, its name, the note of its author, and its supports as their marks at the right, in the order
// of the file, each named on hover. The column is 330 px wide and holds « New at N » and the inventory
// too: the names of the supports written out would add about 40 lines; the Skills tab lists them (2k).
// The skill a spirit gem triggers (Comet under Cast on Critical) is a skill, indented under it.
//
// What is new at the level: a skill that starts says « new » after its name; a support that comes onto
// a skill already there has a mark that stays (the list « New support », three to choose) and a flash
// when the level changes (flashNewGems): the flash alone is missed by whoever opens the build at its
// level or looks at the tree while it plays (the owner, 2026-11-20, the underline of N2 set aside).

// Two open decisions, a list each in the header of the mock-up (they apply at once).
const SKILL_CHOICES = {
  newSupport: {
    label: "New support",
    options: { word: "A · « new » after the name", halo: "B · a halo of the accent", count: "C · « +N » before the marks" },
    fallback: "word",
  },
  spiritMark: {
    label: "Spirit gem",
    options: { ring: "The hexagon in a ring", hollow: "The hexagon hollow", core: "Hollow, a core in it", double: "Two hexagons" },
    fallback: "ring",
  },
};
for (const [key, choice] of Object.entries(SKILL_CHOICES)) {
  VARIANTS[key] = { ...choice, select: true };
  chosen[key] = accepts(VARIANTS[key], params.get(key)) ? params.get(key) : choice.fallback;
}

// The four marks of the spirit gem, a gem that stays on while it reserves spirit.
Object.assign(GEM_SHAPES, {
  "spirit-hollow": '<polygon points="8,1.6 13.5,4.8 13.5,11.2 8,14.4 2.5,11.2 2.5,4.8" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  "spirit-core": '<polygon points="8,1.6 13.5,4.8 13.5,11.2 8,14.4 2.5,11.2 2.5,4.8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="8" r="2.4" fill="currentColor"/>',
  "spirit-ring": '<circle cx="8" cy="8" r="7.1" fill="none" stroke="currentColor" stroke-width="1.4"/><polygon points="8,3.6 11.8,5.8 11.8,10.2 8,12.4 4.2,10.2 4.2,5.8" fill="currentColor"/>',
  "spirit-double": '<polygon points="8,0.8 14.2,4.4 14.2,11.6 8,15.2 1.8,11.6 1.8,4.4" fill="none" stroke="currentColor" stroke-width="1.3"/><polygon points="8,4.4 11.1,6.2 11.1,9.8 8,11.6 4.9,9.8 4.9,6.2" fill="currentColor"/>',
});

// The mark of a gem of a row: a support a square on its tip, a skill a hexagon, a spirit gem its own.
const skillMark = gem => gemMark(gem.colour, gem.kind === "support" ? "support" : gem.kind === "spirit" ? `spirit-${chosen.spiritMark}` : "skill");
const NEW_WORD = '<span class="app-accent app-skill-new">new</span>';

// A skill at the level: whether it starts there, its supports (each new when it comes onto the skill
// at this level), and the skills it triggers apart.
function skillRow(skill, level) {
  const isNew = startsAt(skill.levels, level);
  const gems = skill.supports.map(gem => ({ ...gem, isNew: !isNew && startsAt(gem.levels, level) }));
  const supports = gems.filter(gem => gem.kind === "support");
  return { ...skill, isNew, supports, triggered: gems.filter(gem => gem.kind !== "support"), newSupports: supports.filter(gem => gem.isNew).length };
}

// The head of a row: its mark, its name, the note of its author, « new ». A gem that starts at the
// level flashes (is-new) when the level changes.
const skillHead = (gem, wordToo = false) => `<span class="app-skill-gem ${gem.isNew ? "is-new" : ""}">${skillMark(gem)}</span><span class="app-skill-name">${escapeHtml(gem.name)}</span>${noteMark(Boolean(gem.note))}${gem.isNew || wordToo ? NEW_WORD : ""}`;

function skillLine(row) {
  const choice = chosen.newSupport;
  const marks = row.supports.map(gem => `<span class="app-skill-support ${gem.isNew ? `is-new ${choice === "halo" ? "is-halo" : ""}` : ""}" title="${escapeHtml(gem.name)}${gem.isNew ? " · new" : ""}">${skillMark(gem)}</span>`).join("");
  const count = choice === "count" && row.newSupports > 0 ? `<b class="app-accent app-skill-count">+${row.newSupports}</b>` : "";
  const triggered = row.triggered.map(gem =>
    `<li class="app-skill is-triggered"><span class="app-weak app-skill-hook" aria-hidden="true">↳</span>${skillHead(gem)}</li>`).join("");
  return `<li class="app-skill">${skillHead(row, choice === "word" && row.newSupports > 0)}<span class="app-skill-supports">${count}${marks}</span></li>${triggered}`;
}

function skillList(level) {
  const rows = skillsAt(level).map(skill => skillRow(skill, level));
  return `<h2 class="app-side-title app-title">Skills · ${rows.length}</h2><ul class="app-skills" data-level="${level}">${rows.map(skillLine).join("")}</ul>`;
}

// The flash of what is new, in the language of the title of « New at N » (M3, 2j): when the level of
// a list changes, its new gems light up to white, grow a little and come back in 400 ms. Only then:
// not at the first drawing, nor when another control draws the page again; none when the system asks
// for less motion.
const skillLevelBefore = new Map();
function flashNewGems(list, index) {
  const before = skillLevelBefore.get(index);
  skillLevelBefore.set(index, list.dataset.level);
  if (before === undefined || before === list.dataset.level || lessMotion()) return;
  for (const gem of list.querySelectorAll(".is-new > .app-gem-mark")) {
    gem.animate([{ color: "#ffffff", transform: "scale(1.6)", filter: "drop-shadow(0 0 3px var(--accent))" }, { color: getComputedStyle(gem).color, transform: "scale(1)", filter: "none" }],
      { duration: 400, easing: "ease-out" });
  }
}
AFTER_RENDER.push(() => document.querySelectorAll(".app-skills").forEach(flashNewGems));
