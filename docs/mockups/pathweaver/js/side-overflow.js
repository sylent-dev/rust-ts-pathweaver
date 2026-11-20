// The overflow of the right column of the Overview (2j4): E2 of twelve variants (the owner, 2026-11-20:
// « the only one that avoids scrolling, and it keeps a use to the Inventory tab »; the others in the
// history of Git). The inventory is a drawer at the bottom of the column: a bar with its title, the
// switch of the weapon set and a thumbnail per hinted slot; the drawing rises from it over the skills.
// The skills take the room left (14 at the worst case of the corpus); past it, the last ones fold under
// « and N more ». Its styles are in css/side-overflow.css.
//
// Two decisions open, each a control at the top of the page (js/page.js, VARIANTS): when the drawer
// shows (always, or only when the column would overflow, the drawing in place otherwise), and what
// opens it (the pointer at once, the pointer held a moment, a click).

// The case of the worst overflow (tools/make-data.py, CROWDED): the 14 skills of a build of the corpus
// at 53, where 20 things are new, beside the inventory of the build shown.
SKILL_SOURCES.crowded = level => BUILDS.crowded.skills
  .filter(skill => appliesAt(skill.levels, level))
  .map(skill => ({ ...skill, supports: skill.supports.filter(support => appliesAt(support.levels, level)) }));

// The bar of the drawer: a box per hinted slot, its card on hover as in the drawing.
function inventoryThumbs(level, hints) {
  return `<div class="app-inventory ov-thumbs">${hints.map(hint => [hint, hintItem(hint)]).map(([hint, item]) =>
    `<span class="app-slot is-hinted${item.unknown ? " is-unknown" : ""}" ${hintAttributes(hint, item, level)}>${item.art ? itemArt(item) : item.unknown ? UNKNOWN_MARK : '<span class="app-slot-text">…</span>'}</span>`).join("")}</div>`;
}

// The right column at a level: of the build shown, or of a case (`record` its changes, `source` its
// skills, `hints` its inventory). Both the drawing in place and the drawer are drawn; once the column
// is measured, one of them goes (settleColumn).
function sideColumn(level, { record = BUILDS.changes.shown.levels[level], source, hints = slotsAt(level, STATE.inventorySet) } = {}) {
  return `<aside class="app-side ov" data-drawer="${chosen.drawerWhen}" data-open="${chosen.drawerOpen}">
    <div class="ov-new">${newAtBox(level, record)}</div>
    <div class="ov-skills">${skillList(level, source)}</div>
    <div class="ov-inventory">${inventoryBox(level, hints)}</div>
    <div class="ov-drawer">
      <div class="ov-drawer-bar"><div class="app-inventory-head"><h2 class="app-side-title app-title">Inventory</h2>${inventorySetSwitch()}</div>${inventoryThumbs(level, hints)}</div>
      <div class="ov-drawer-doll">${inventoryBox(level, hints)}</div>
    </div>
  </aside>`;
}

const overflows = box => box.scrollHeight > box.clientHeight;

// The skills folded to the room left above the drawer: the last skills hidden one at a time, a skill
// with the rows it triggers, until they fit, then « and N more » in their place.
function foldSkills(column) {
  const box = column.querySelector(".ov-skills"), list = box.querySelector(".app-skills");
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
    more.innerHTML = `<span class="app-new-more ov-more-words" title="In the Skills tab">and ${hidden} more</span>`;
  }
}

// Once drawn: the drawing in place when it fits and the drawer shows only then, the drawer otherwise.
function settleColumn(column) {
  column.classList.add("is-whole");
  const fits = column.dataset.drawer === "crowded" && !overflows(column);
  if (fits) return;
  column.classList.replace("is-whole", "is-drawer");
  foldSkills(column);
}
AFTER_RENDER.push(() => document.querySelectorAll(".app-side.ov").forEach(settleColumn));

// A click on the bar opens the drawer, when a click opens it; a click on the bar again, or outside the
// drawer, or Esc, closes it.
document.addEventListener("click", event => {
  const drawer = event.target.closest?.('.ov[data-open="click"] .ov-drawer');
  for (const open of document.querySelectorAll(".ov-drawer.is-open")) if (open !== drawer) open.classList.remove("is-open");
  if (drawer && event.target.closest(".ov-drawer-bar") && !event.target.closest("button")) drawer.classList.toggle("is-open");
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") document.querySelectorAll(".ov-drawer.is-open").forEach(drawer => drawer.classList.remove("is-open"));
});
