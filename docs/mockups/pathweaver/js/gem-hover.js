// The hover of a gem (2j2, specs.md, Skills): its name and its kind, its tags and its description from
// the game data, the level it comes at, then the note of its author with the markup of the game
// (markupHtml, js/tree-hover.js); in the language of the card of a passive (B, 2i3): beside the gem,
// without a border, see-through at 10 %, fading in and out in 120 ms (css/tree-hover.css). On the mark
// of a gem, and on the name of a skill in its row.

const GEM_KIND_NAMES = { active: "Skill gem", spirit: "Spirit gem", support: "Support gem" };
const gemKindName = gem => gem.lineage ? "Lineage support" : GEM_KIND_NAMES[gem.kind] ?? "Skill gem";

// The gem a mark or a name stands for: the skill of its row at the level of its list, or one of the
// gems under it (a support, or the skill a spirit gem triggers).
function gemOfRow(element) {
  const row = element.closest(".app-skill"), list = element.closest(".app-skills");
  const skill = skillsAt(Number(list.dataset.level)).find(entry => entry.name === row.dataset.skill);
  if (!skill) return undefined;
  return skill.name === element.dataset.gem && !row.classList.contains("is-triggered")
    ? skill : skill.supports.find(gem => gem.name === element.dataset.gem);
}

function gemHoverHtml(gem, level) {
  const comes = gem.levels[0] === level ? `Comes at ${level}` : gem.levels[0] > 1 ? `From ${gem.levels[0]}` : "From the start";
  const tags = gem.tags.filter(tag => tag !== "Support" && tag !== "Lineage");
  return `<div class="app-hover-head"><strong>${escapeHtml(gem.name)}</strong><span class="app-weak">${gemKindName(gem)}</span></div>
    ${tags.length ? `<div class="app-gem-tags">${tags.map(escapeHtml).join(" · ")}</div>` : ""}
    ${gem.text ? `<p class="app-gem-text">${escapeHtml(gem.text)}</p>` : ""}
    <div class="app-hover-state">${comes}</div>
    ${gem.note ? `<div class="app-hover-hint">${markupHtml(gem.note)}</div>` : ""}`;
}

// One card for the page, fixed, so that the narrow column doesn't cut it: just left of the column,
// over the tree, rather than over the rows it would hide; the column is always at the right of the
// window, the tree beside it. Centred on the gem, kept inside the height of the window.
const gemCard = document.createElement("div");
gemCard.className = "app-hover app-gem-hover";
document.body.append(gemCard);
function showGemHover(element) {
  const gem = gemOfRow(element);
  if (!gem) return;
  gemCard.innerHTML = gemHoverHtml(gem, Number(element.closest(".app-skills").dataset.level));
  gemCard.classList.add("is-shown");
  const box = element.getBoundingClientRect(), [w, h] = [gemCard.offsetWidth, gemCard.offsetHeight];
  const column = element.closest(".app-side")?.getBoundingClientRect() ?? box;
  const left = column.left - w - 8;
  gemCard.style.left = `${left}px`;
  gemCard.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, box.top + box.height / 2 - h / 2))}px`;
}
document.addEventListener("mouseover", event => {
  const element = event.target.closest?.(".app-skills [data-gem]");
  if (element) showGemHover(element);
  else gemCard.classList.remove("is-shown");
});
document.addEventListener("scroll", () => gemCard.classList.remove("is-shown"), { capture: true, passive: true });
