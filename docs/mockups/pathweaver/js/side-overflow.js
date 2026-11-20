// The overflow of the right column of the Overview (2j4): E2 of twelve variants (the owner, 2026-11-20:
// « the only one that avoids scrolling, and it keeps a use to the Inventory tab »; the others in the
// history of Git). The inventory is a drawer at the bottom of the column: a bar with its title, the
// switch of the weapon set and a thumbnail per hinted slot, which never moves; the drawing unrolls
// upward from it over the skills when the pointer stays 200 ms on the bar. The drawer always, even when
// the drawing would fit (the owner, 2026-11-20: the main lines of the layout stay the same, so as not to
// lose the user). The skills take the room left (14 at the worst case of the corpus); past it, the last
// ones fold under « and N more skills ». Its styles are in css/side-overflow.css.

// The case of the worst overflow (tools/make-data.py, CROWDED): the 14 skills of a build of the corpus
// at 53, where 20 things are new, beside the inventory of the build shown.
SKILL_SOURCES.crowded = level => skillsOf(BUILDS.crowded.skills, level);

// A link of the column to a tab of the build (the owner, 2026-11-20): the title Skills, and « and N more skills »
// under the skills folded; not the title of the bar, whose hover unrolls the drawing, nor a link under
// the drawing (tried, removed by the owner). In the colour of its words, the accent and a line on hover.
const sideLink = (tab, words, className = "app-side-link") =>
  `<button type="button" class="${className}" data-action="tab-go" data-tab="${tab}"><span class="app-side-link-words">${words}</span></button>`;

// The bar of the drawer: a box per hinted slot, its card on hover as in the drawing.
function inventoryThumbs(level, hints) {
  return `<div class="app-inventory ov-thumbs">${hints.map(hint => [hint, hintItem(hint)]).map(([hint, item]) =>
    `<span class="app-slot is-hinted${item.unknown ? " is-unknown" : ""}" ${hintAttributes(hint, item, level)}>${item.art ? itemArt(item) : item.unknown ? UNKNOWN_MARK : '<span class="app-slot-text">…</span>'}</span>`).join("")}</div>`;
}

// The right column at a level: of the build shown, or of a case (`record` its changes, `source` its
// skills, `hints` its inventory). The drawing comes before the bar, so that it unrolls above it.
function sideColumn(level, { record = BUILDS.changes.shown.levels[level], source, hints = slotsAt(level, STATE.inventorySet) } = {}) {
  return `<aside class="app-side ov">
    <div class="ov-new">${newAtBox(level, record)}</div>
    <div class="ov-skills">${skillList(level, source)}</div>
    <div class="ov-drawer">
      <div class="ov-drawer-doll">${inventoryBox(level, hints)}</div>
      <div class="ov-drawer-bar"><div class="app-inventory-head"><h2 class="app-side-title app-title">Inventory</h2>${inventorySetSwitch()}</div>${inventoryThumbs(level, hints)}</div>
    </div>
  </aside>`;
}

const overflows = box => box.scrollHeight > box.clientHeight;

// The skills folded to the room left above the bar: the last skills hidden one at a time, a skill with
// the rows it triggers, until they fit, then « and N more skills » in their place, which leads to the Skills tab.
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
    more.innerHTML = sideLink("skills", `and ${plural(hidden, "more skill", "more skills")}`, "app-new-more");
  }
}

// Once drawn: the drawer cut to the height of its bar (--bar), which the skills leave free, then the
// skills folded to the room left.
function settleColumn(column) {
  const drawer = column.querySelector(".ov-drawer");
  column.style.setProperty("--bar", `${drawer.offsetHeight - drawer.querySelector(".ov-drawer-bar").offsetTop}px`);
  foldSkills(column);
}
AFTER_RENDER.push(() => document.querySelectorAll(".app-side.ov").forEach(settleColumn));
