// The skills of the right column of the Overview: a row per skill that applies at the level.

function skillList(level) {
  const skills = skillsAt(level);
  return `<h2 class="app-side-title app-title">Skills · ${skills.length}</h2>
    <ul class="app-skills">${skills.map(skill => {
      const isNew = startsAt(skill.levels, level) || skill.supports.some(support => startsAt(support.levels, level));
      return `<li class="app-skill"><span class="app-gem is-${skill.colour} ${skill.kind === "spirit" ? "is-spirit" : ""}" title="${skill.kind} gem"></span><span class="app-skill-name">${escapeHtml(skill.name)}</span>${isNew ? '<span class="app-accent app-skill-new">new</span>' : ""}<span class="app-weak app-skill-supports">${plural(skill.supports.length, "support")}</span></li>`;
    }).join("")}</ul>`;
}
