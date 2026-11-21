// The Skills tab (2k, the owner, 2026-11-21): the skills at the level, each with its supports written
// out, where the right column of the Overview only has room for their marks (js/side-skills.js). K6, kept
// of six variants of N3, itself kept with H1 of twelve variants at four temperatures (the others in the
// history of Git): in three columns, a small card per skill in the construction of the cards on hover
// (css/hover-card.css), so that the skills stand out from their supports however many they are:
// - its head in the deep shade, its name and its icon at the right as its badge;
// - its supports in the darker body, each with the mark of its gem, its name, the mark of a note, « NEW »
//   at the right;
// - the skill a spirit gem triggers under them, after « ↳ », with its mark, never an icon (a skill placed
//   as the support of another, as Comet under Cast on Critical);
// - a skill new at the level tagged « NEW » on the top edge of its card, just before its badge (T3 of
//   three), its title swept by a light.
// The card of a gem on hover of its badge, its mark or its name (js/gem-hover.js), the card of a note on
// its mark. The tab is as high as the Overview (668 px) and scrolls inside when its skills don't fit.

// The skills at a level, of the build shown or of a case (`source`, a key of SKILL_SOURCES).
const stSkills = (level, source) => (source ? SKILL_SOURCES[source] : skillsAt)(level).map(skill => skillRow(skill, level));

// « NEW » after a gem that starts at the level.
const stNew = gem => (gem.isNew ? '<span class="st-new">new</span>' : "");
// The note of a skill, or of a support with the skill it supports as its place.
const stNote = (gem, skill) => noteMark(skill ? { place: skill.name, head: gem.name, text: gem.note } : { head: gem.name, text: gem.note });
// The root of a skill: what the card of a gem reads back (data-skill; data-triggered, a skill a spirit
// gem triggers, drawn as a skill of its own).
const stSkillAttributes = (skill, triggered = false) => `data-skill="${escapeHtml(skill.name)}"${triggered ? ' data-triggered=""' : ""}`;
// The name of a gem, its card on hover; a skill's in bold.
const stName = (gem, className = "st-name") => `<span class="${className}" data-gem="${escapeHtml(gem.name)}">${escapeHtml(gem.name)}</span>`;

// A support: its mark, its name, its note, « NEW » at the right (the owner, 2026-11-21).
const stSupport = (gem, skill) => `<li class="st-support" ${stSkillAttributes(skill)}>${skillMark(gem)}${stName(gem)}${stNote(gem, skill)}${stNew(gem)}</li>`;
// The badge of a skill: its icon, the mark of its gem when the data give none; its card on hover.
const stBadge = gem => gem.icon
  ? `<span class="st-badge" data-gem="${escapeHtml(gem.name)}"><img src="pathweaver/img/skills/${gem.icon}" alt=""></span>`
  : skillMark(gem);

// The card of a skill.
function stCard(skill) {
  const triggered = skill.triggered.map(gem => `<div class="st-triggered" ${stSkillAttributes(skill, true)}><span class="app-weak st-hook" aria-hidden="true">↳</span>${skillMark(gem)}${stName(gem, "st-name st-skill")}${stNote(gem)}${stNew(gem)}</div>`).join("");
  return `<div class="st-card${skill.isNew ? " is-new" : ""}">${skill.isNew ? '<span class="st-new-tag">New</span>' : ""}
    <div class="st-head" ${stSkillAttributes(skill)}>${stName(skill, "st-name st-skill")}${stNote(skill)}${stBadge(skill)}</div>
    ${skill.supports.length || triggered ? `<div class="st-body">${skill.supports.length ? `<ul class="st-supports">${skill.supports.map(gem => stSupport(gem, skill)).join("")}</ul>` : ""}${triggered}</div>` : ""}
  </div>`;
}

// The Skills tab at a level, of the build shown or of a case.
const skillsTab = (level = STATE.level, source) =>
  `<div class="app-skills-tab"><div class="app-st graph-paper" data-level="${level}"${source ? ` data-source="${source}"` : ""}>${stSkills(level, source).map(stCard).join("")}</div></div>`;
