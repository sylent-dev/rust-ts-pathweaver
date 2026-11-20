// The Skills tab (2k): the skills at the level, each with its supports written out, where the right
// column of the Overview only has room for their marks (js/side-skills.js). Of twelve variants, three at
// each of four temperatures, the owner kept H1 as the base and N3 beside it (2026-11-20; the others in
// the history of Git), chosen with the tabs « Skills tab » (VARIANTS.skillsTab, js/page.js). Both draw
// the same data: a skill per entry that applies at the level, in the order of the file; its supports
// that apply with it; the skill a spirit gem triggers apart; what is new at the level marked « new »;
// the mark of a note of the author; the card of a gem on hover of its mark or its name
// (js/gem-hover.js), the card of a note on its mark.
//
// The tab is as high as the Overview (668 px) and scrolls inside when its skills don't fit.

// The skills at a level, of the build shown or of a case (`source`, a key of SKILL_SOURCES).
const stSkills = (level, source) => (source ? SKILL_SOURCES[source] : skillsAt)(level).map(skill => skillRow(skill, level));

// A gem: its mark and its name, each showing its card on hover; « new » when it starts at the level.
const stNew = gem => (gem.isNew ? '<span class="st-new">new</span>' : "");
const stGem = (gem, className = "st-gem") =>
  `<span class="${className}">${skillMark(gem)}<span class="st-name" data-gem="${escapeHtml(gem.name)}">${escapeHtml(gem.name)}</span>${stNew(gem)}</span>`;
// The note of a skill, or of a support with the skill it supports as its place.
const stNote = (gem, skill) => noteMark(skill ? { place: skill.name, head: gem.name, text: gem.note } : { head: gem.name, text: gem.note });
// The root of a skill: what the card of a gem reads back (data-skill, its row; is-triggered, a skill a
// spirit gem triggers, drawn as a skill of its own).
const stSkillAttributes = (skill, triggered = false) => `data-skill="${escapeHtml(skill.name)}"${triggered ? ' data-triggered=""' : ""}`;
const stList = (level, source, className, body) =>
  `<div class="app-st ${className}" data-level="${level}"${source ? ` data-source="${source}"` : ""}>${body}</div>`;

// A support in a list: its mark, its name, « new », its note.
const stSupport = (gem, skill) => `<li class="st-support" ${stSkillAttributes(skill)}>${stGem(gem)}${stNote(gem, skill)}</li>`;
// The skills a spirit gem triggers, each a head of its own under its skill.
const stTriggered = skill => skill.triggered.map(gem =>
  `<div class="st-triggered" ${stSkillAttributes(skill, true)}><span class="app-weak st-hook" aria-hidden="true">↳</span>${stGem(gem)}${stNote(gem)}</div>`).join("");

// Variants of N3 (the owner, 2026-11-21: « the line, and so much information that the skills don't stand
// out from their supports when there are many »): no line, the icon of the skill as its badge, never on
// a support; K3 and K6 kept of six (a badge before the name, a badge beside the block, the supports in
// words, two sizes apart, set aside; in the history of Git).
// The badge of a skill: its icon, the mark of its gem when the data give none; its card on hover.
const stBadge = gem => gem.icon
  ? `<span class="st-badge" data-gem="${escapeHtml(gem.name)}"><img src="pathweaver/img/skills/${gem.icon}" alt=""></span>`
  : skillMark(gem);
// A skill and what it holds: its head (its badge, its name, its note), and when it is new at the level a
// tag on the edge of its block in place of « new » (the owner, 2026-11-21); its supports, the skills
// it triggers with their mark, without a badge (the owner, 2026-11-21: a skill placed as the support of
// another, as Comet under Cast on Critical, shows no icon).
const stName = (gem, withNew = true) => `<span class="st-name st-skill" data-gem="${escapeHtml(gem.name)}">${escapeHtml(gem.name)}</span>${withNew ? stNew(gem) : ""}`;
function stBlock(skill) {
  const triggered = skill.triggered.map(gem =>
    `<div class="st-head st-triggered" ${stSkillAttributes(skill, true)}><span class="app-weak st-hook" aria-hidden="true">↳</span>${skillMark(gem)}${stName(gem)}${stNote(gem)}</div>`).join("");
  return `<div class="st-block${skill.isNew ? " is-new" : ""}">${skill.isNew ? '<span class="st-new-tag">New</span>' : ""}
    <div class="st-head" ${stSkillAttributes(skill)}>${stBadge(skill)}${stName(skill, false)}${stNote(skill)}</div>
    ${skill.supports.length ? `<ul class="st-supports">${skill.supports.map(gem => stSupport(gem, skill)).join("")}</ul>` : ""}${triggered}
  </div>`;
}
const SKILLS_TAB_VARIANTS = {
  h1: {
    title: "H1 · A list and its detail",
    text: "The rows of the Overview on the left; a click shows a skill on the right, with its description, its levels, its notes and its supports, each with its own.",
    draw: (rows, level, source) => {
      const skill = rows.find(row => row.name === STATE.stChosen) ?? rows.find(row => row.isNew) ?? rows[0];
      const detail = gem => `<div class="st-detail-gem">
        <div class="st-detail-head">${stGem(gem, gem.kind === "support" ? "st-gem" : "st-gem st-skill")}<span class="app-weak">${gemKindName(gem)} · ${levelsWords(gem, level)}</span></div>
        ${gem.text ? `<p class="st-detail-text app-weak">${escapeHtml(gem.text)}</p>` : ""}
        ${gem.note ? `<div class="st-note-text">${markupHtml(gem.note)}</div>` : ""}</div>`;
      return stList(level, source, "st-h1", `<ul class="app-skills st-h1-list">${rows.map(row =>
        `<li class="app-skill st-h1-row${row === skill ? " is-chosen" : ""}" data-skill="${escapeHtml(row.name)}" data-action="st-choose">${skillMark(row)}${skillName(row)}${stNew(row)}<span class="app-skill-supports">${row.supports.map(skillMark).join("")}</span></li>`).join("")}</ul>
        <div class="st-h1-detail" ${stSkillAttributes(skill)}>${detail(skill)}<h3 class="st-h1-title app-title">Supports</h3>${skill.supports.map(detail).join("")}${skill.triggered.map(detail).join("")}</div>`);
    },
  },


  k3: {
    title: "K3 · The skill on a band",
    text: "The head of the skill on a band of the deep shade, its badge at the right as on its card; the supports under it on the page.",
    draw: (rows, level, source) => stList(level, source, "st-n3 st-k3", rows.map(stBlock).join("")),
  },


  k6: {
    title: "K6 · A small card per skill",
    text: "In the construction of the cards on hover: the head in the deep shade, the name and the badge at the right; the supports in the darker body.",
    draw: (rows, level, source) => stList(level, source, "st-n3 st-k6", rows.map(stBlock).join("")),
  },
  n3: {
    title: "N3 · An outline",
    text: "No box: the skills in bold, their supports indented under them, in three columns, the densest.",
    draw: (rows, level, source) => stList(level, source, "st-n3", rows.map(skill => `<div class="st-block">
      <div class="st-head" ${stSkillAttributes(skill)}>${stGem(skill, "st-gem st-skill")}${stNote(skill)}</div>
      <ul class="st-supports">${skill.supports.map(gem => stSupport(gem, skill)).join("")}</ul>${stTriggered(skill)}
    </div>`).join("")),
  },
};

// The skill shown on the right of H1, chosen by a click on its row.
ACTIONS["st-choose"] = element => { STATE.stChosen = element.dataset.skill; return true; };

// The Skills tab at a level, in the variant chosen.
function skillsTab(level = STATE.level, source) {
  const variant = SKILLS_TAB_VARIANTS[chosen.skillsTab] ?? SKILLS_TAB_VARIANTS.h1;
  return `<div class="app-skills-tab">${variant.draw(stSkills(level, source), level, source)}</div>`;
}
