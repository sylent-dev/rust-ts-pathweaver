// The five tabs of a build (2h, the owner, 2026-11-19: F3 of twelve variants, the others in the
// history of Git): words, without counts, on the light shade of the page; the current one in the
// colour of the text over the cursor of the level laid down, a white bar of 28 × 4 pixels, which
// slides to the tab clicked. ← → stay for the level (the owner, 2026-11-19): a tab is reached by
// Tab and opened by Enter or Space, as any button.

STATE.tab = "overview";
// The tab shown before the last change, so that the bar slides from it; false once it has slid.
STATE.tabBefore = false;

const BUILD_TABS = { overview: "Overview", skills: "Skills", tree: "Tree", inventory: "Inventory", about: "About" };

function buildTabs() {
  return `<div class="app-tabs" role="tablist">${Object.entries(BUILD_TABS).map(([key, label]) =>
    `<button type="button" role="tab" class="app-tab" aria-selected="${STATE.tab === key}" data-action="tab-go" data-tab="${key}">${label}</button>`).join("")}<span class="app-tabs-bar" aria-hidden="true"></span></div>`;
}

// Shows a tab: a click on it, or on a line of the window of what changes.
function showTab(tab) {
  if (tab === STATE.tab) return;
  STATE.tabBefore = STATE.tab;
  STATE.tab = tab;
}
ACTIONS["tab-go"] = element => { showTab(element.dataset.tab); return true; };

// The bar under a tab: its left edge, centred on the words of the tab.
const BAR_WIDTH = 28;
const barX = tab => tab.offsetLeft + (tab.offsetWidth - BAR_WIDTH) / 2;
const setBar = (bar, x, width = BAR_WIDTH) => { bar.style.setProperty("--bar-x", `${x}px`); bar.style.setProperty("--bar-width", `${width}px`); };
const nextFrame = then => requestAnimationFrame(() => requestAnimationFrame(then));

// The bar set under the tab shown before, then moved to the current one, after the motion chosen:
// 1 · Slide, with the small bounce of the cursor set down; 2 · Ghost, the same, a grey bar left under
// the tab before, fading; 3 · Stretch, the bar reaching the new tab first, then letting go of the
// old one. Nothing moves when the system asks for less motion (css/build-tabs.css).
AFTER_RENDER.push(() => {
  const before = STATE.tabBefore;
  STATE.tabBefore = false;
  for (const row of document.querySelectorAll(".app-tabs")) {
    const bar = row.querySelector(".app-tabs-bar");
    const to = barX(row.querySelector(`[data-tab="${STATE.tab}"]`));
    if (!before) { setBar(bar, to); continue; }
    const from = barX(row.querySelector(`[data-tab="${before}"]`));
    setBar(bar, from);
    if (chosen.tabMotion === "ghost") {
      row.insertAdjacentHTML("beforeend", `<span class="app-tabs-ghost" style="--bar-x:${from}px" aria-hidden="true"></span>`);
    }
    nextFrame(() => {
      bar.classList.add(`is-${chosen.tabMotion}`);
      row.querySelector(".app-tabs-ghost")?.classList.add("is-fading");
      if (chosen.tabMotion !== "stretch") { setBar(bar, to); return; }
      // Reach: the bar spans from the tab before to the new one; then it lets go of the tab before.
      setBar(bar, Math.min(from, to), Math.abs(to - from) + BAR_WIDTH);
      setTimeout(() => setBar(bar, to), 160);
    });
  }
});
