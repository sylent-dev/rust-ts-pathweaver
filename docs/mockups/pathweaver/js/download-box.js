// The box of Download .build (2k6, specs.md, Downloading a build): a click on the file downloads it and opens,
// 3 px under the header, against its right edge, a box that says where the game reads the files, in the shade
// and the construction of the window of « N changes » (css/level-changes.css). The folders as the
// documentation of Grinding Gear Games gives them (pathofexile.com/developer/docs/game#buildplanner, read on
// 2026-11-21): Windows, and SteamOS under its Proton prefix; nothing for another system. The game watches the
// folder (« Our automated File Watcher system has been designed to detect changes in the BuildPlanner
// directory »). Three ways to lay it out, on trial (sections/download-box.js).

const GAME_FOLDERS = [
  { key: "windows", name: "Windows", path: "Documents\\My Games\\Path of Exile 2\\BuildPlanner" },
  { key: "deck", name: "Steam Deck", path: "/home/deck/.local/share/Steam/steamapps/compatdata/2315204395/pfx/drive_c/users/steamuser/Documents/My Games/Path of Exile 2/BuildPlanner" },
];
// The window whose box is open (its data-download-case), the system shown by D2 and D3, the folder just copied.
STATE.downloadOpen = false;
STATE.downloadSystem = "windows";
STATE.copied = false;

// A path, in the monospace font, cut anywhere to fit the box; Copy at its right, « Copied » for a moment.
const folderPath = folder => `<div class="dl-path"><code>${escapeHtml(folder.path)}</code>
  <button type="button" class="dl-copy" data-action="download-copy" data-folder="${folder.key}">${STATE.copied === folder.key ? "Copied" : "Copy"}</button></div>`;
const folderOf = key => GAME_FOLDERS.find(folder => folder.key === key);
// The switch of the system (D2, D3): its words without a box, as the switch of the weapon set under the tree.
const systemSwitch = () => `<span class="dl-systems">${GAME_FOLDERS.map(folder =>
  `<button type="button" class="dl-system ${folder.key === STATE.downloadSystem ? "is-current" : ""}" data-action="download-system" data-system="${folder.key}">${folder.name}</button>`).join("")}</span>`;
const DOWNLOAD_FOOT = '<p class="dl-foot">The game watches this folder: a file put there shows in its Build Planner.</p>';

const DOWNLOAD_WAYS = {
  // D1: both folders, one under the other.
  d1: () => `<p class="dl-head">Where the game reads it</p>
    ${GAME_FOLDERS.map(folder => `<div class="dl-folder"><span class="dl-name">${folder.name}</span>${folderPath(folder)}</div>`).join("")}${DOWNLOAD_FOOT}`,
  // D2: one folder, its system chosen (the one the browser runs on, at first).
  d2: () => `<p class="dl-head">Where the game reads it ${systemSwitch()}</p>
    <div class="dl-folder">${folderPath(folderOf(STATE.downloadSystem))}</div>${DOWNLOAD_FOOT}`,
  // D3: what to do, in two steps, the folder of D2 in the second.
  d3: () => `<ol class="dl-steps"><li><b>Saved</b> in the downloads of your browser.</li>
    <li><b>Move it</b> to the folder the game reads ${systemSwitch()}${folderPath(folderOf(STATE.downloadSystem))}</li></ol>${DOWNLOAD_FOOT}`,
};
const downloadBox = way => `<div class="dl-box" role="dialog" aria-label="Where the game reads the file">${DOWNLOAD_WAYS[way]()}</div>`;

// The file opens its box, or closes it, and closes the other windows and menus: one at a time.
ACTIONS["download-toggle"] = element => {
  const owner = element.closest("[data-download-case]");
  if (!owner) return false;
  STATE.downloadOpen = STATE.downloadOpen === owner.dataset.downloadCase ? false : owner.dataset.downloadCase;
  STATE.changesOpen = false;
  STATE.buildsMenu = false;
  return true;
};
ACTIONS["download-system"] = element => {
  STATE.downloadSystem = element.dataset.system;
  return true;
};
let copiedTimer;
ACTIONS["download-copy"] = element => {
  const folder = folderOf(element.dataset.folder);
  navigator.clipboard?.writeText(folder.path).catch(() => {});
  STATE.copied = folder.key;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => { STATE.copied = false; renderSheet(); }, 1500);
  return true;
};
// Esc, or a click outside the box and the file, closes it.
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && STATE.downloadOpen !== false) {
    STATE.downloadOpen = false;
    renderSheet();
  }
});
document.addEventListener("click", event => {
  if (STATE.downloadOpen === false || event.target.closest(".dl-box, .app-file")) return;
  STATE.downloadOpen = false;
  renderSheet();
});
