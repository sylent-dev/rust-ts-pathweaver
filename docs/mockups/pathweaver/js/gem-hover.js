// The hover of a gem (2j2, specs.md, Skills): its name and its kind, its tags and its description from
// the game data, the levels it applies at, then the note of its author with the markup of the game
// (markupHtml, js/tree-hover.js); in the language of the card of a passive (B, 2i3), without a
// border, fading in and out in 120 ms (css/tree-hover.css). On the mark of a gem, and on the name of a
// skill in its row.

const GEM_KIND_NAMES = { active: "Skill gem", spirit: "Spirit gem", support: "Support gem" };
// What the cards say of an id the game data don't know (2j3b): a gem, an item, a slot.
const NOT_IN_GAME_DATA = `Not in the game data of ${BUILDS.treeVersion}`;
const gemKindName = gem => gem.lineage ? "Lineage support" : GEM_KIND_NAMES[gem.kind] ?? "Skill gem";

// The gem a mark or a name stands for: the skill of its row at the level of its list, or one of the
// gems under it (a support, or the skill a spirit gem triggers). A list of a case of the mock-up names
// its own skills (data-source, a key of SKILL_SOURCES); the others are the build shown. In the right
// column a row is an .app-skill of an .app-skills; in the Skills tab (js/skills-tab.js), the nearest
// element that names its skill (data-skill) and its level (data-level).
const SKILL_SOURCES = { shown: skillsAt };
function gemOfRow(element) {
  const row = element.closest("[data-skill]"), list = element.closest("[data-level]");
  const skills = SKILL_SOURCES[list.dataset.source ?? "shown"] ?? skillsAt;
  const skill = skills(Number(list.dataset.level)).find(entry => entry.name === row.dataset.skill);
  if (!skill) return undefined;
  return skill.name === element.dataset.gem && !row.classList.contains("is-triggered") && !row.hasAttribute("data-triggered")
    ? skill : skill.supports.find(gem => gem.name === element.dataset.gem);
}

// The levels of a gem, or of a hint of the inventory (js/slot-hover.js), the word « level » written out (the owner, 2026-11-20: « From 23 », 23 what?):
// « New at level 59 » in the word of « New at N », « From level 23 », « From the start », and where it
// stops when before 100 (« From level 15 to 64 », « New at level 59, until 70 »): a guide of leveling
// replaces its gems.
function levelsWords(entry, level) {
  const [low, high] = entry.levels;
  const from = low === level ? `New at level ${level}` : low > 1 ? `From level ${low}` : "From the start";
  if (high >= MAX_LEVEL) return from;
  return low > 1 && low !== level ? `${from} to ${high}` : `${from}, until ${high}`;
}

// The card of a gem (2j2; 2k, the owner, 2026-11-20: the construction of every card on hover,
// js/hover-card.js): its name, its tags as the game names them under it, without its kind for now, and
// its icon at the right, a square (the disc of a support cut to a square); its description from the game
// data and its levels; the note of its author with the markup of the game (markupHtml, js/tree-hover.js).
// A gem the game data don't know (2j3b, the owner, 2026-11-20: « we'd like to know why », then « no need
// to be too explicit »): its name, the end of its id, its kind from its place in the file as its
// subtitle, the yellow sticky note of the unknown as its art, « Not in the game data of 0.5.2 » in the
// colour of the unknown.
function gemHoverHtml(gem, level) {
  const note = gem.note ? markupHtml(gem.note) : "";
  const levels = `<div class="app-hover-state">${levelsWords(gem, level)}</div>`;
  if (gem.known === false) {
    return hoverCardHtml({
      title: escapeHtml(gem.name), subtitle: gemKindName(gem), art: '<span class="app-unknown">?</span>', note,
      body: `<p class="app-hover-missing is-unknown">${NOT_IN_GAME_DATA}</p>${levels}`,
    });
  }
  const tags = gem.tags.filter(tag => tag !== "Support" && tag !== "Lineage");
  return hoverCardHtml({
    title: escapeHtml(gem.name), subtitle: tags.map(escapeHtml).join(" · "), note,
    art: gem.icon ? hoverArtImage(`pathweaver/img/skills/${gem.icon}`, gem.kind === "support") : "",
    body: `${gem.text ? `<p class="app-gem-text">${escapeHtml(gem.text)}</p>` : ""}${levels}`,
  });
}

// One card for the page, fixed, so that the narrow column doesn't cut it, never following the pointer
// (the owner, 2026-11-20):
// - a support, a mark at the right of a row, 300 px from the column's left edge: just above it, where
//   the eye is, its right edge on the mark, never over its own row, so that the pointer goes from one
//   support to the next; under the row when there is no room above; opaque, since it lies over rows;
// - a skill, its mark or its name at the left of the column: just left of the column, over the tree,
//   centred on the row, see-through as the card of a passive.
const gemCard = document.createElement("div");
gemCard.className = "app-hover app-gem-hover is-hover-card";
document.body.append(gemCard);
function showGemHover(element) {
  const gem = gemOfRow(element);
  if (!gem) return;
  gemCard.innerHTML = gemHoverHtml(gem, Number(element.closest("[data-level]").dataset.level));
  titleIfCut(gemCard);
  if (element.closest(".app-st:not(.st-h1) , .st-h1-detail")) return showGemBeside(element);
  const support = Boolean(element.closest(".app-skill-supports"));
  // Opaque over rows: above a support, or beside a row of the Skills tab, which has no tree beside it.
  gemCard.classList.toggle("is-over-rows", support || !element.closest(".app-side"));
  gemCard.classList.add("is-shown");
  const box = element.getBoundingClientRect(), row = element.closest(".app-skill").getBoundingClientRect();
  const [w, h] = [gemCard.offsetWidth, gemCard.offsetHeight];
  if (support) {
    gemCard.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, box.right - w))}px`;
    gemCard.style.top = `${row.top - h - 6 >= 8 ? row.top - h - 6 : row.bottom + 6}px`;
  } else {
    const column = element.closest(".app-side")?.getBoundingClientRect() ?? box;
    // Right of the column when the window has no room on its left (a column alone in a case).
    gemCard.style.left = `${column.left - w - 8 >= 8 ? column.left - w - 8 : column.right + 8}px`;
    gemCard.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, row.top + row.height / 2 - h / 2))}px`;
  }
}
// In the Skills tab (2k, while its variants are compared): just right of the gem, over what is beside it,
// opaque; left of it when there is no room on the right.
function showGemBeside(element) {
  gemCard.classList.add("is-over-rows", "is-shown");
  const box = element.getBoundingClientRect();
  const [w, h] = [gemCard.offsetWidth, gemCard.offsetHeight];
  gemCard.style.left = `${box.right + 12 + w <= innerWidth - 8 ? box.right + 12 : Math.max(8, box.left - w - 12)}px`;
  gemCard.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, box.top + box.height / 2 - h / 2))}px`;
}
// The card stays open while the pointer is on it (2k, the owner, 2026-11-20: the native tooltip of its
// cut tags, which the pointer couldn't reach): leaving a gem, the pointer has 200 ms to reach the card
// across the gap between them; leaving the card, it closes as it would leaving the gem.
let gemCardClosing;
document.addEventListener("mouseover", event => {
  clearTimeout(gemCardClosing);
  if (gemCard.contains(event.target)) return;
  const element = event.target.closest?.(".app-skills [data-gem], .app-st [data-gem]");
  if (element) showGemHover(element);
  else if (gemCard.classList.contains("is-shown")) gemCardClosing = setTimeout(() => gemCard.classList.remove("is-shown"), 200);
});
document.addEventListener("scroll", () => gemCard.classList.remove("is-shown"), { capture: true, passive: true });
