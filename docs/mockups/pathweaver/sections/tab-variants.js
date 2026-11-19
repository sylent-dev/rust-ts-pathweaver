// The tabs of a build (2h, the owner, 2026-11-19): twelve variants, three at each of four
// temperatures (normal, high, explosive, free), on the page of the build shown, under its level
// band, their counts at its level. ← → stay for the level everywhere (the owner, 2026-11-19): a tab
// is reached by Tab and opened by Enter or Space. The views of the tabs come with 2k: a click only
// makes a tab the current one. Removed once one is chosen.

// The current tab of each variant (each is drawn once on the page).
STATE.tabVariants = {};
// Where the bar of F3 was before the last click, so that it slides from there.
STATE.tabBarFrom = {};

// What a tab says at the level: its count, and how many of the changes of the level it shows.
function tabFacts(level) {
  const record = changesHere("shown", level);
  const changed = { overview: 0, skills: 0, tree: 0, inventory: 0, about: 0 };
  for (const change of record ? changeList(record) : []) changed[changeTab(change)] += 1;
  const skills = skillsAt(level);
  return [
    { key: "overview", label: "Overview", changed: 0 },
    { key: "skills", label: "Skills", count: skills.length, unit: ["gem", "gems"], changed: changed.skills, skills },
    { key: "tree", label: "Tree", count: passivesAt(level, 0).length, unit: ["point", "points"], changed: changed.tree,
      max: Math.max(...[1, MAX_LEVEL].map(at => passivesAt(at, 0).length)) },
    { key: "inventory", label: "Inventory", count: slotsAt(level).length, unit: ["hint", "hints"], changed: changed.inventory },
    { key: "about", label: "About", changed: 0 },
  ];
}

const tabButton = (variant, tab, current, body, extra = "") =>
  `<button type="button" role="tab" class="tabv-tab ${tab.key === current ? "is-current" : ""}" aria-selected="${tab.key === current}"
    data-action="tab-variant" data-variant="${variant}" data-tab="${tab.key}" ${extra}>${body}</button>`;
const count = tab => tab.count === undefined ? "" : `<span class="tabv-count app-number">${tab.count}</span>`;
const words = tab => `<span class="tabv-label">${tab.label}</span>${count(tab)}`;

// The pictograms of E2, 28 px: what each tab holds, drawn small.
const PICTOGRAMS = {
  overview: '<rect x="2" y="3" width="15" height="22" rx="1"/><rect x="19" y="3" width="7" height="9" rx="1"/><rect x="19" y="14" width="7" height="11" rx="1"/>',
  tree: '<path d="M14 4V12M14 12L6 18M14 12L22 18M6 18V24M22 18L18 24M22 18L26 24"/><g fill="currentColor"><circle cx="14" cy="4" r="2"/><circle cx="14" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="22" cy="18" r="2"/><circle cx="6" cy="24" r="1.6"/><circle cx="18" cy="24" r="1.6"/><circle cx="26" cy="24" r="1.6"/></g>',
  inventory: '<rect x="2" y="3" width="6" height="12"/><rect x="11" y="3" width="6" height="6"/><rect x="20" y="3" width="6" height="12"/><rect x="11" y="11" width="6" height="9"/><rect x="5" y="18" width="5" height="6"/><rect x="18" y="18" width="5" height="6"/>',
  about: '<path d="M6 3H17L23 9V25H6Z"/><path d="M17 3V9H23"/><path d="M10 14H19M10 18H19M10 22H15"/>',
};
const pictogram = tab => tab.key === "skills"
  ? `<span class="tabv-gems">${tab.skills.slice(0, 3).map(skill => gemMark(skill.colour)).join("")}</span>`
  : `<svg class="tabv-pictogram" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${PICTOGRAMS[tab.key]}</svg>`;

// F1: a little summary of what a tab holds, in place of its count.
function summary(tab) {
  if (tab.key === "skills") return `<span class="tabv-gems">${tab.skills.map(skill => gemMark(skill.colour)).join("")}</span>`;
  if (tab.key === "tree") return `<span class="tabv-gauge" title="${tab.count} of ${tab.max} points"><span style="width:${Math.round(100 * tab.count / tab.max)}%"></span></span><span class="tabv-count app-number">${tab.count}</span>`;
  if (tab.key === "inventory") {
    // The slots of weapon set I, as the Overview shows them first.
    const slots = slotsAt(STATE.level, 1);
    const hinted = (base, cell) => slots.some(slot => slot.id === (base === "Weapon" || base === "Offhand" ? `${base}1` : base) && (cell === undefined || slot.x === cell));
    return `<span class="tabv-slots">${INVENTORY_LAYOUT.map(([base, , , , , cell]) => `<i class="${hinted(base, cell) ? "is-hinted" : ""}"></i>`).join("")}</span>`;
  }
  return "";
}

// The twelve variants: [id, temperature, title, the class of their row, a tab drawn].
const TAB_VARIANTS = [
  ["n1", "Normal", "Words, as the links of the band of the site: in the accent, white on hover with its line drawn from the left; the current one white, its line kept", tab => words(tab)],
  ["n2", "Normal", "Blocks by contrast, as the tabs of the open builds: in the darker shade of the level band, the current one in the shade of the page it opens on", tab => words(tab)],
  ["n3", "Normal", "Without counts: words in grey, the current one white under a bar of the accent against the level band", tab => `<span class="tabv-label">${tab.label}</span>`],
  ["h1", "High", "The count first, as the level: the number in Archivo over its name in small capitals", tab =>
    `<span class="tabv-big app-number">${tab.count ?? (tab.key === "overview" ? "◆" : "i")}</span><span class="tabv-small">${tab.count === undefined ? tab.label : tab.count === 1 ? tab.unit[0] : tab.unit[1]}</span>`],
  ["h2", "High", "What changes at the level, on its tab: blocks as N2, and « +N » in the accent on each tab that shows a change of the level (◀ ▶ change it)", tab =>
    `${words(tab)}${tab.changed ? `<span class="tabv-changed">+${tab.changed}</span>` : ""}`],
  ["h3", "High", "Titles: the names in Archivo 800, the others faded, the counts raised after them", tab =>
    `<span class="tabv-label">${tab.label}</span>${tab.count === undefined ? "" : `<sup class="app-number">${tab.count}</sup>`}`],
  ["e1", "Explosive", "A rail on the left, out of the row (the one that leaves the language: it takes 132 px of the page at 960 px)", tab => words(tab)],
  ["e2", "Explosive", "A pictogram per tab: what it holds, drawn small (the gems of the first three skills), grey and dimmed but the current one", tab =>
    `${pictogram(tab)}<span class="tabv-words">${words(tab)}</span>`],
  ["e3", "Explosive", "The current tab named large, the others small: a click swaps their sizes", tab => words(tab)],
  ["f1", "Free", "Each tab a little summary of what it holds: the colours of its gems, the points as a gauge of the build, the slots with a hint lit", tab =>
    `<span class="tabv-label">${tab.label}</span>${summary(tab)}`],
  ["f2", "Free", "A dock: the tab under the pointer and its neighbours swell, the current one marked by a dot of the accent", tab => words(tab)],
  ["f3", "Free", "The cursor of the level, laid down: a white bar of 28 × 4 px under the current tab, which slides to the next with the bounce of the cursor", tab => words(tab)],
];

function tabVariantRow(id, draw) {
  const current = STATE.tabVariants[id] ?? "overview";
  const tabs = tabFacts(STATE.level).map(tab => tabButton(id, tab, current, draw(tab)));
  const bar = id === "f3" ? '<span class="tabv-bar" aria-hidden="true"></span>' : "";
  return `<div class="tabv tabv-${id}" role="tablist" data-variant="${id}">${tabs.join("")}${bar}</div>`;
}

// A window: the level band, the row, then the top of the Overview, cut.
const tabVariantWindow = ([id, , , draw]) => id === "e1"
  ? `<div class="app-window" style="width:960px">${levelBand()}<div class="tabv-e1-page">${tabVariantRow(id, draw)}<div class="tabv-page">${overview()}</div></div></div>`
  : `<div class="app-window" style="width:960px">${levelBand()}${tabVariantRow(id, draw)}<div class="tabv-page">${overview()}</div></div>`;

ACTIONS["tab-variant"] = element => {
  const { variant, tab } = element.dataset;
  const bar = element.parentElement.querySelector(".tabv-bar");
  if (bar) STATE.tabBarFrom[variant] = bar.style.getPropertyValue("--bar-x");
  STATE.tabVariants[variant] = tab;
  return true;
};

// F3: the bar under the current tab, set where it was, then slid to its tab.
AFTER_RENDER.push(() => {
  for (const row of document.querySelectorAll(".tabv-f3")) {
    const bar = row.querySelector(".tabv-bar");
    const current = row.querySelector(".is-current");
    const x = `${current.offsetLeft + current.offsetWidth / 2 - 14}px`;
    const from = STATE.tabBarFrom[row.dataset.variant];
    delete STATE.tabBarFrom[row.dataset.variant];
    bar.style.setProperty("--bar-x", from || x);
    if (from && from !== x) requestAnimationFrame(() => requestAnimationFrame(() => { bar.classList.add("is-sliding"); bar.style.setProperty("--bar-x", x); }));
  }
});

// F2: the dock, its tabs swelling after their distance to the pointer.
document.getElementById("sheet").addEventListener("pointermove", event => {
  const row = event.target.closest(".tabv-f2");
  if (!row) return;
  for (const tab of row.querySelectorAll(".tabv-tab")) {
    const box = tab.getBoundingClientRect();
    const distance = Math.abs(event.clientX - (box.left + box.width / 2));
    tab.style.setProperty("--swell", Math.max(0, 1 - distance / 220).toFixed(3));
  }
});
document.getElementById("sheet").addEventListener("pointerout", event => {
  const row = event.target.closest(".tabv-f2");
  if (row && !row.contains(event.relatedTarget)) for (const tab of row.querySelectorAll(".tabv-tab")) tab.style.setProperty("--swell", 0);
});

for (const temperature of ["Free", "Explosive", "High", "Normal"]) {
  addSection(() => [`The tabs of a build · ${temperature.toLowerCase()} temperature: hover a tab, click one, change the level with ◀ ▶`,
    TAB_VARIANTS.filter(([, t]) => t === temperature).map(variant => [`${variant[0].toUpperCase()} · ${variant[2]}`, tabVariantWindow(variant)])]);
}
