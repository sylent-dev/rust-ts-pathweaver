// The skills of the right column of the Overview: a row per skill that applies at the level.
//
// N2 of twelve variants (2j2, the owner, 2026-11-20; the others in the history of Git): the mark of the
// skill, its name, the note of its author, and its supports as their marks at the right, in the order
// of the file, each with its card on hover (js/gem-hover.js). The column is 330 px wide and holds « New at N » and the inventory
// too: the names of the supports written out would add about 40 lines; the Skills tab lists them (2k).
// The skill a spirit gem triggers (Comet under Cast on Critical) is a skill, indented under it.
//
// What is new at the level (the owner, 2026-11-20): no mark in the row, which « New at N » just above
// already says in words; a flash of the new gems when the level changes (flashNewGems), and the gem
// of a line of « New at N » lit in the row while the pointer is on that line (litFromNewAt). The
// underline of N2, a halo, « new » and « +N » were set aside.

// The mark of a gem of a row, in a span that the flash and the light of « New at N » find.
// Its name and its description on hover (js/gem-hover.js). The mark of a gem the game data don't know
// is-unknown, an amber « ? » (css/side-skills.css, 2j3b); its name the end of its id.
const unknownClass = gem => gem.known === false ? " is-unknown" : "";
const skillMark = gem => `<span class="app-skill-gem${gem.isNew ? " is-new" : ""}${unknownClass(gem)}" data-gem="${escapeHtml(gem.name)}">${gemMark(gem)}</span>`;
const skillName = gem => `<span class="app-skill-name" data-gem="${escapeHtml(gem.name)}">${escapeHtml(gem.name)}</span>`;

// A skill at the level: whether it starts there, its supports (each new when it comes onto the skill
// at this level), and the skills it triggers apart.
function skillRow(skill, level) {
  const isNew = startsAt(skill.levels, level);
  const gems = skill.supports.map(gem => ({ ...gem, isNew: !isNew && startsAt(gem.levels, level) }));
  return { ...skill, isNew, supports: gems.filter(gem => gem.kind === "support"), triggered: gems.filter(gem => gem.kind !== "support") };
}

// A row: the mark of the skill, its name, the note of its author, the marks of its supports at the
// right; the skills it triggers under it, each a row that belongs to it (data-skill).
function skillLine(row) {
  const skill = escapeHtml(row.name);
  const triggered = row.triggered.map(gem =>
    `<li class="app-skill is-triggered" data-skill="${skill}"><span class="app-weak app-skill-hook" aria-hidden="true">↳</span>${skillMark(gem)}${skillName(gem)}${noteMark(Boolean(gem.note))}</li>`).join("");
  return `<li class="app-skill" data-skill="${skill}">${skillMark(row)}${skillName(row)}${noteMark(Boolean(row.note))}<span class="app-skill-supports">${row.supports.map(skillMark).join("")}</span></li>${triggered}`;
}

// The skills at a level, of the build shown or of a case of the mock-up that names its own (`source`,
// a key of SKILL_SOURCES, js/gem-hover.js, which the card of a gem reads too).
function skillList(level, source) {
  const rows = (source ? SKILL_SOURCES[source] : skillsAt)(level).map(skill => skillRow(skill, level));
  return `<h2 class="app-side-title app-title">Skills</h2><ul class="app-skills" data-level="${level}"${source ? ` data-source="${source}"` : ""}>${rows.map(skillLine).join("")}</ul>`;
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

// The gem of a line of « New at N » lit in the rows of its column while the pointer is on the line:
// the words above, the gem below, read as one.
function litFromNewAt(event) {
  const line = event.target.closest?.(".app-new-lines li[data-gem]");
  if (!line) return;
  const lit = event.type === "mouseover";
  const selector = `.app-skill[data-skill="${CSS.escape(line.dataset.on)}"] .app-skill-gem[data-gem="${CSS.escape(line.dataset.gem)}"]`;
  line.closest(".app-side")?.querySelectorAll(selector).forEach(gem => gem.classList.toggle("is-lit", lit));
}
document.addEventListener("mouseover", litFromNewAt);
document.addEventListener("mouseout", litFromNewAt);
