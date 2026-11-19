// The five tabs of a build (2h, the owner, 2026-11-19: F3 of twelve variants, the others in the
// history of Git): words, without counts, on the light shade of the page; the current one in the
// colour of the text over the cursor of the level laid down, a white bar of 28 × 4 pixels, which
// slides to the tab clicked. ← → stay for the level (the owner, 2026-11-19): a tab is reached by
// Tab and opened by Enter or Space, as any button.

STATE.tab = "overview";
// The tab shown before the last change, so that the bar slides from it; false once it has slid.
STATE.tabBefore = false;

const BUILD_TABS = { overview: "Overview", skills: "Skills", tree: "Tree", inventory: "Inventory", about: "About" };

// `shown`: the tab of a window that always shows the same one (the Tree tab of 2i).
function buildTabs(shown = STATE.tab) {
  return `<div class="app-tabs" role="tablist">${Object.entries(BUILD_TABS).map(([key, label]) =>
    `<button type="button" role="tab" class="app-tab" aria-selected="${shown === key}" data-action="tab-go" data-tab="${key}">${label}</button>`).join("")}<span class="app-tabs-bar" aria-hidden="true"></span></div>`;
}

// Shows a tab: a click on it, or on a line of the window of what changes.
function showTab(tab) {
  if (tab === STATE.tab) return;
  STATE.tabBefore = STATE.tab;
  STATE.tab = tab;
}
ACTIONS["tab-go"] = element => { showTab(element.dataset.tab); return true; };

// The bar under a tab: its left edge, the bar centred on the words of the tab.
const barX = tab => tab.offsetLeft + (tab.offsetWidth - 28) / 2;

// The bar set under the tab shown before, then slid to the current one (css/build-tabs.css).
AFTER_RENDER.push(() => {
  const before = STATE.tabBefore;
  STATE.tabBefore = false;
  for (const row of document.querySelectorAll(".app-tabs")) {
    const bar = row.querySelector(".app-tabs-bar");
    const to = `${barX(row.querySelector('[aria-selected="true"]'))}px`;
    bar.style.setProperty("--bar-x", before ? `${barX(row.querySelector(`[data-tab="${before}"]`))}px` : to);
    if (before) requestAnimationFrame(() => requestAnimationFrame(() => { bar.classList.add("is-sliding"); bar.style.setProperty("--bar-x", to); }));
  }
});
