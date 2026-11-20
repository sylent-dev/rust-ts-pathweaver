// « New at N », the box at the top of the right column of the Overview: what is new at the level.

function newAtBox(level) {
  const changes = changesAt(level);
  const lines = [
    ...changes.skills.map(skill => {
      const supports = skill.supports.filter(support => appliesAt(support.levels, level));
      const skillsWith = supports.filter(gem => gem.kind !== "support");
      const with_ = [...skillsWith.map(gem => escapeHtml(gem.name)), supports.length > skillsWith.length ? plural(supports.length - skillsWith.length, "support") : ""].filter(Boolean);
      return `+ ${escapeHtml(skill.name)}${with_.length > 0 ? `, with ${with_.join(" and ")}` : ""}`;
    }),
    ...changes.supports.map(support => `+ ${escapeHtml(support.name)} on ${escapeHtml(support.skill)}`),
    ...changes.slots.map(slot => `+ a hint on the ${SLOT_NAMES[slot.id].toLowerCase()}`),
    changes.passives > 0 ? `+ ${plural(changes.passives, "passive")}, ringed on the tree` : "",
    changes.removedPassives > 0 ? `− ${plural(changes.removedPassives, "passive")}` : "",
  ].filter(Boolean);
  if (lines.length === 0) return `<div class="app-new is-empty app-weak">Nothing new at ${level}</div>`;
  return `<div class="app-new"><span class="app-accent">New at ${level}</span>${lines.map(line => `<span class="app-new-line">${line}</span>`).join("")}</div>`;
}
