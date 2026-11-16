// The five tabs of a build, each with what it counts at the level (specs.md, Window layout).

STATE.tab = "overview";

function buildTabs() {
  const level = STATE.level;
  const tabs = [
    ["overview", "Overview"],
    ["skills", `Skills · ${skillsAt(level).length}`],
    ["tree", `Tree · ${plural(passivesAt(level, 0).length, "point")}`],
    ["inventory", `Inventory · ${plural(slotsAt(level).length, "hint")}`],
    ["about", "About"],
  ];
  return `<div class="app-tabs" role="tablist">${tabs.map(([key, label]) =>
    `<button type="button" role="tab" class="app-tab" aria-selected="${STATE.tab === key}">${label}</button>`).join("")}</div>`;
}
