// The page of a build at 1,920 px (2k4): the Overview, Skills, Inventory and About, three ways each, with the
// tabs « Wide overview », « Wide skills », « Wide inventory », « Wide about »; About twice, the build shown and
// the leveling guide of the corpus with 18 warnings, its button ⚠ in yellow in its header.

addSection(() => {
  const title = (view, key) => WIDE[view][chosen[key]].title;
  const label = (view, key) => `${title(view, key)}: ${WIDE[view][chosen[key]].text}`;
  return [`The page of a build · 1,920 px: ${title("overview", "wideOverview")}, ${title("skills", "wideSkills")}, ${title("inventory", "wideInventory")}, ${title("about", "wideAbout")}`, [
    [`Overview · ${label("overview", "wideOverview")}`, wideWindow("overview", wideOverview(STATE.level))],
    [`Skills · ${label("skills", "wideSkills")}`, wideWindow("skills", wideSkills(STATE.level))],
    [`Inventory · ${label("inventory", "wideInventory")}`, wideWindow("inventory", wideInventory(STATE.level))],
    [`About · ${label("about", "wideAbout")}`, wideWindow("about", wideAbout(STATE.level, "shown"))],
    ["About · the leveling guide with 18 warnings, its button ⚠ in yellow in the header", wideWindow("about", wideAbout(STATE.level, "warnings"), warnedHeader())],
  ]];
});
