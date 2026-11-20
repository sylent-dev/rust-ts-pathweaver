// The overflow of the right column of the Overview (2j4): twelve variants, three at each of four
// temperatures (normal, high, explosive, fun), of what gives way when « New at N », the skills and the
// inventory don't fit in the 668 px of the column (14 skills at most at a level of the corpus, 9 at its
// median). The tab « Overflow » at the top of the page applies one to every Overview of the page
// (js/overview.js); sections/column-overflow.js shows the twelve side by side. Their styles are in
// css/side-overflow.css. Once one is chosen, the others go and this file keeps only its rules.

const OVERFLOW_VARIANTS = {
  n1: ["N1", "Normal", "The column scrolls: the scroll bar of the window of « N changes », a shade at the bottom while more is below"],
  n2: ["N2", "Normal", "The skills folded to the rows that fit, « and N more » unfolds them in place, the column then scrolls"],
  n3: ["N3", "Normal", "The inventory pinned at the bottom: « New at N » and the skills scroll in the room above it"],
  h1: ["H1", "High", "Folding titles: « New at N » folds to its count when the column overflows, each title folds its part"],
  h2: ["H2", "High", "« New at N » in one line of counts when the column overflows, then the skills folded to fit"],
  h3: ["H3", "High", "The inventory drawn smaller (24 px a cell) when the column overflows, then the skills folded to fit"],
  e1: ["E1", "Explosive", "Skills and Inventory as two tabs under « New at N », each the whole height left"],
  e2: ["E2", "Explosive", "The inventory a drawer: a bar of thumbnails at the bottom, the drawing rises over the skills on hover"],
  e3: ["E3", "Explosive", "The inventory as thumbnails only, the drawing left to the Inventory tab: everything fits"],
  f1: ["F1", "Fun", "The column scrolls, its bar a rail of its three parts, the part in view lit, a click jumps to one"],
  f2: ["F2", "Fun", "The skills that don't fit as a fan of their marks after « and N more », spread into a card on hover"],
  f3: ["F3", "Fun", "The rows packed at 15 px, the row under the pointer and its neighbours swelling like a dock, the rest folded"],
};

// The case of the worst overflow (tools/make-data.py, CROWDED): the 14 skills of a build of the corpus
// at 53, where 20 things are new, beside the inventory of the build shown.
SKILL_SOURCES.crowded = level => BUILDS.crowded.skills
  .filter(skill => appliesAt(skill.levels, level))
  .map(skill => ({ ...skill, supports: skill.supports.filter(support => appliesAt(support.levels, level)) }));

// The variants that fold the skills to what fits, and those that let the column scroll.
const FOLDING = ["n2", "h2", "h3", "e2", "e3", "f2", "f3"];
const SCROLLING = ["n1", "n3", "h1", "f1"];

// « New at N » in one line of counts (H2): what comes, by category, and « all N » that opens the window.
function newAtCounts(record) {
  const list = record ? changeList(record) : [];
  const count = category => list.filter(change => change.category === category && change.sign !== "−")
    .reduce((sum, change) => sum + (change.count ?? 1), 0);
  const words = [["skill", "skill"], ["support", "support"], ["passives", "passive"], ["gear", "item"], ["note", "note"]]
    .map(([category, word]) => [count(category), word]).filter(([n]) => n > 0).map(([n, word]) => plural(n, word));
  return `<p class="ov-counts">+ ${words.join(" · ")} <button type="button" class="app-new-more" data-action="new-more">all ${list.length}</button></p>`;
}

// The inventory as thumbnails (E2's bar, E3): a box per hinted slot, its card on hover as in the drawing.
function inventoryThumbs(level, hints) {
  return `<div class="app-inventory ov-thumbs">${hints.map(hint => [hint, hintItem(hint)]).map(([hint, item]) =>
    `<span class="app-slot is-hinted${item.unknown ? " is-unknown" : ""}" ${hintAttributes(hint, item, level)}>${item.art ? itemArt(item) : item.unknown ? UNKNOWN_MARK : '<span class="app-slot-text">…</span>'}</span>`).join("")}</div>`;
}
const inventoryHead = () => `<div class="app-inventory-head"><h2 class="app-side-title app-title">Inventory</h2>${inventorySetSwitch()}</div>`;

// E1: the tab shown, Skills or Inventory, the same in every column of the page.
STATE.overflowTab = "skills";
ACTIONS["overflow-tab"] = element => {
  STATE.overflowTab = element.dataset.tab;
  return true;
};

// The right column at a level: of the build shown, or of a case (`record` its changes, `source` its
// skills, `hints` its inventory), in the variant chosen.
function sideColumn(level, { record = BUILDS.changes.shown.levels[level], source, hints = slotsAt(level, STATE.inventorySet), variant = chosen.overflow } = {}) {
  const part = (name, html) => `<div class="ov-part ov-${name}">${html}</div>`;
  const newAt = part("new", newAtBox(level, record) + (variant === "h2" ? newAtCounts(record) : ""));
  const skills = part("skills", skillList(level, source));
  const inventory = part("inventory", inventoryBox(level, hints));
  const column = inner => `<aside class="app-side ov ov-${variant}" data-overflow="${variant}">${inner}</aside>`;
  if (variant === "n3") return column(`<div class="ov-scroll">${newAt}${skills}</div>${inventory}`);
  if (variant === "f1") return column(`<div class="ov-scroll">${newAt}${skills}${inventory}</div><div class="ov-rail" aria-hidden="true"></div>`);
  if (variant === "e1") {
    const count = (source ? SKILL_SOURCES[source] : skillsAt)(level).length;
    const tab = (key, words) => `<button type="button" class="app-title" data-action="overflow-tab" data-tab="${key}" aria-pressed="${STATE.overflowTab === key}">${words}</button>`;
    return column(`${newAt}<div class="ov-tabs">${tab("skills", `Skills <span class="app-number">${count}</span>`)}${tab("inventory", "Inventory")}${STATE.overflowTab === "inventory" ? inventorySetSwitch() : ""}</div>
      ${STATE.overflowTab === "skills" ? skills : inventory}`);
  }
  if (variant === "e2") return column(`${newAt}${skills}<div class="ov-drawer">${inventoryHead()}${inventoryThumbs(level, hints)}<div class="ov-drawer-doll">${inventoryBox(level, hints)}</div></div>`);
  if (variant === "e3") return column(`${newAt}${skills}<div class="ov-part ov-inventory">${inventoryHead()}${inventoryThumbs(level, hints)}</div>`);
  return column(newAt + skills + inventory);
}

// What fits is measured once the column is drawn: a column overflows when what it holds is taller than
// it (E2: the skills taller than the room above the drawer).
const overflows = box => box.scrollHeight > box.clientHeight;

// The skills folded to the rows that fit (N2, H2, H3, E2, E3 when its thumbnails don't make room, F2, F3): the last skills hidden one at a time,
// a skill with the rows it triggers, until the column fits, then « and N more » in their place.
function foldSkills(column) {
  const variant = column.dataset.overflow;
  const box = variant === "e2" ? column.querySelector(".ov-skills") : column;
  const list = column.querySelector(".ov-skills .app-skills");
  if (!list || !overflows(box)) return;
  const groups = [];
  for (const row of list.querySelectorAll(":scope > .app-skill")) {
    if (row.classList.contains("is-triggered") && groups.length) groups.at(-1).push(row);
    else groups.push([row]);
  }
  const more = document.createElement("li");
  more.className = "ov-more";
  list.append(more);
  let hidden = 0;
  while (overflows(box) && hidden < groups.length - 1) {
    hidden += 1;
    for (const row of groups[groups.length - hidden]) row.classList.add("is-folded");
    more.innerHTML = moreHtml(variant, hidden, groups.slice(-hidden).flat(), list);
  }
}
function moreHtml(variant, hidden, rows, list) {
  const words = `and ${hidden} more`;
  if (variant === "n2") return `<button type="button" class="app-new-more ov-unfold">${words}</button>`;
  if (variant !== "f2") return `<span class="app-new-more ov-more-words" title="In the Skills tab">${words}</span>`;
  // The marks of the fan only show: the card of their rows on hover tells what they are.
  const marks = rows.filter(row => !row.classList.contains("is-triggered"))
    .map(row => (row.querySelector(".app-skill-gem")?.outerHTML ?? "").replace(/ data-gem="[^"]*"/, "")).join("");
  const copy = rows.map(row => row.outerHTML.replace(" is-folded", "")).join("");
  return `<span class="ov-fan">${marks}</span><span class="app-new-more ov-more-words">${words}</span>
    <div class="ov-fan-card app-hover"><ul class="app-skills" data-level="${list.dataset.level}"${list.dataset.source ? ` data-source="${list.dataset.source}"` : ""}>${copy}</ul></div>`;
}

// The shade at the bottom of a column that scrolls, while more is below; F1's rail, its part in view lit.
function scroller(column) {
  return column.querySelector(".ov-scroll") ?? column;
}
function updateScroll(column) {
  const box = scroller(column);
  box.classList.toggle("has-more", box.scrollTop + box.clientHeight < box.scrollHeight - 1);
  const rail = column.querySelector(".ov-rail");
  if (!rail) return;
  const total = box.scrollHeight;
  rail.innerHTML = [...box.querySelectorAll(".ov-part")].map(part => {
    const top = part.offsetTop, height = part.offsetHeight;
    const seen = top < box.scrollTop + box.clientHeight && top + height > box.scrollTop;
    return `<button type="button" class="ov-rail-part${seen ? " is-seen" : ""}" data-top="${top}" style="top:${(top / total) * 100}%;height:${(height / total) * 100}%" title="${part.querySelector(".app-title")?.textContent.trim() ?? ""}"></button>`;
  }).join("");
}

// What each variant does once the column is drawn, before it is seen.
function settleColumn(column) {
  const variant = column.dataset.overflow;
  if (variant === "h1" && overflows(column)) column.querySelector(".ov-new")?.classList.add("is-folded");
  if (variant === "h2" && overflows(column)) column.classList.add("is-compact");
  if (variant === "h3" && overflows(column)) column.classList.add("is-small");
  if (FOLDING.includes(variant)) foldSkills(column);
  if (SCROLLING.includes(variant)) updateScroll(column);
  column.classList.add("is-settled");   // F3: its rows swell only once measured packed
  if (variant === "h1") {
    for (const part of column.querySelectorAll(".ov-part")) {
      const title = part.querySelector(".app-side-title");
      title.classList.add("ov-fold-title");
      const count = part.matches(".ov-new") ? part.querySelectorAll(".app-new-lines li").length + Number(/\d+/.exec(part.querySelector(".app-new-more")?.textContent ?? "")?.[0] ?? 0)
        : part.matches(".ov-skills") ? part.querySelectorAll(".app-skill:not(.is-triggered)").length : 0;
      if (count) title.dataset.count = count;
    }
  }
}
AFTER_RENDER.push(() => document.querySelectorAll(".app-side.ov").forEach(settleColumn));

// N2: « and N more » unfolds the skills in place, « Fewer » folds them again. H1: a title folds its
// part. F1: a part of the rail scrolls to it.
document.addEventListener("click", event => {
  const unfold = event.target.closest(".ov-unfold");
  if (unfold) {
    const column = unfold.closest(".ov");
    const open = column.classList.toggle("is-open");
    unfold.dataset.words ??= unfold.textContent;
    unfold.textContent = open ? "Fewer" : unfold.dataset.words;
    updateScroll(column);
    return;
  }
  const title = event.target.closest(".ov-fold-title");
  if (title) {
    title.closest(".ov-part").classList.toggle("is-folded");
    updateScroll(title.closest(".ov"));
    return;
  }
  const rail = event.target.closest(".ov-rail-part");
  if (rail) scroller(rail.closest(".ov")).scrollTo({ top: Number(rail.dataset.top) - 12, behavior: lessMotion() ? "auto" : "smooth" });
});
document.addEventListener("scroll", event => {
  const column = event.target.closest?.(".ov");
  if (column && SCROLLING.concat("n2").includes(column.dataset.overflow)) updateScroll(column);
}, { capture: true, passive: true });
