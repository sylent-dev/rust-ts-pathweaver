// The page of a build at 1,920 px (2k4): the Overview, Skills, Inventory and About in the way kept for each;
// About twice, the build shown and the leveling guide of the corpus with 18 warnings, « 18 warnings » in its
// header, a link to them.

addSection(() => ["The page of a build · 1,920 px: the Overview, its tree wide; Skills in four columns; Inventory, the drawing larger; About, the warnings in a column", [
  ["Overview · the tree takes the width, the column stays 330 px", wideWindow("overview", overview())],
  ["Skills · four columns, 1,280 px at most, in the middle", wideWindow("skills", wideSkills(STATE.level))],
  ["Inventory · the drawing at 56 px a cell, « Upcoming » under it, the box over the rest", wideWindow("inventory", wideInventory(STATE.level))],
  ["About · the build shown: no warning, so no column for them", wideWindow("about", wideAbout(STATE.level, "shown"))],
  ["About · the leveling guide with 18 warnings: their column, and « 18 warnings » in the header, a link to them", wideWindow("about", wideAbout(STATE.level, "warnings"), warnedHeader())],
]]);
