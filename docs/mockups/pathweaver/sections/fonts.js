// A font per role (2d, js/role-fonts.js): the titles, the text and the numbers, chosen by the lists
// « Titles », « Text » and « Numbers » at the top of the page, tuned on Frost Night, the reference
// style. Two sections: the board of every candidate, then, at the top, the page of a build and the
// library with the fonts of the lists. The big titles of the home page and of the library keep
// Archivo, the font of the name, until the owner says otherwise.
loadRoleFonts();

// The board: every font in a small box, sorted by kind, with a title, a line of text and the numbers
// of the page in it. A click on a box adds it to the favourites or takes it out, as on the
// moodboards; its three buttons give it a role at once. The favourites stay in the browser, show at
// the top with a button that copies their numbers for the chat, and may be shown alone.
const FONT_FAVOURITES_KEY = "pathweaver-mockup:font-favourites";
STATE.fontFavourites = new Set();
try { JSON.parse(localStorage.getItem(FONT_FAVOURITES_KEY) || "[]").forEach(key => STATE.fontFavourites.add(key)); } catch { /* no storage: the favourites last until the reload */ }
STATE.fontFavouritesOnly = false;
// The fonts whose figures aren't all one width, measured once they have loaded (markUnevenFigures).
STATE.unevenFigures = new Set();

const FONT_ROLES = { fontTitle: "Title", fontText: "Text", fontNumber: "Numbers" };
const fontSample = SHOWN.skills[0];

// Its weights: « 100–900 », a range or the lightest and the heaviest of a list.
const fontWeights = font => { const weights = font.weights.split(/\.\.|;/); return weights.length > 1 ? `${weights[0]}–${weights.at(-1)}` : weights[0]; };

const fontBox = font => `<div class="font-box ${STATE.fontFavourites.has(font.key) ? "is-favourite" : ""} ${STATE.unevenFigures.has(font.key) ? "is-uneven" : ""}"
    data-action="font-favourite" data-font="${font.key}" style="--box-font:'${font.family}'" title="${escapeHtml(font.family)}: a click adds it to the favourites">
  <small>${font.id} · ${escapeHtml(font.family)} · ${fontWeights(font)}<span class="font-box-uneven">uneven figures</span></small>
  <span class="font-box-title">${escapeHtml(SHOWN.name)}</span>
  <span class="font-box-text">${escapeHtml(fontSample.name)}, with ${escapeHtml(fontSample.supports.map(gem => gem.name).join(", "))}. Skills · Tree · Inventory</span>
  <span class="font-box-number">Level 47 · 12 / 88 · 1234567890</span>
  <span class="font-box-roles">${Object.entries(FONT_ROLES).map(([role, label]) =>
    `<button type="button" data-action="font-role" data-role="${role}" data-font="${font.key}" aria-pressed="${chosen[role] === font.key}">${label}</button>`).join("")}</span>
</div>`;

const fontFavouriteList = () => ROLE_FONT_LIST.filter(font => STATE.fontFavourites.has(font.key));

ACTIONS["font-favourite"] = element => {
  const key = element.dataset.font;
  if (STATE.fontFavourites.has(key)) STATE.fontFavourites.delete(key); else STATE.fontFavourites.add(key);
  try { localStorage.setItem(FONT_FAVOURITES_KEY, JSON.stringify([...STATE.fontFavourites])); } catch { /* idem */ }
  return true;
};
ACTIONS["font-role"] = element => {
  chosen[element.dataset.role] = element.dataset.font;
  keepInAddress();
  render();
  return false;
};
ACTIONS["font-favourites-only"] = () => {
  STATE.fontFavouritesOnly = !STATE.fontFavouritesOnly;
  return true;
};
ACTIONS["font-favourites-copy"] = () => {
  navigator.clipboard?.writeText(fontFavouriteList().map(font => `${font.id} ${font.family}`).join(", "));
  return false;
};

const fontFavouritesBar = () => {
  const favourites = fontFavouriteList();
  return `<div class="font-favourites">Favourites: <b>${favourites.length
    ? favourites.map(font => `${font.id} ${escapeHtml(font.family)}`).join(", ") : "none yet"}</b>
    <button type="button" data-action="font-favourites-copy">Copy the favourites</button>
    <button type="button" data-action="font-favourites-only" aria-pressed="${STATE.fontFavouritesOnly}">Favourites only</button></div>`;
};

const fontKinds = () => Object.keys(ROLE_FONTS).map(kind => {
  const shown = ROLE_FONT_LIST.filter(font => font.kind === kind && (!STATE.fontFavouritesOnly || STATE.fontFavourites.has(font.key)));
  return shown.length ? `<div class="font-kind"><h3>${kind}</h3><div class="font-grid">${shown.map(fontBox).join("")}</div></div>` : "";
}).join("");

addSection(() => ["Fonts · every candidate, 222 to 306, sorted by kind, in the title weight and spacing of the sliders: a click adds a font to the favourites, its buttons give it a role",
  [["", `<div class="font-board">${fontFavouritesBar()}${fontKinds()}</div>`]]]);

// The figures of a font are one width when ten 1 and ten 0 in tabular figures are as wide. Measured
// once a font has loaded; a box marked « uneven figures » can't hold the numbers.
function markUnevenFigures() {
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;font-size:40px;font-variant-numeric:tabular-nums;white-space:nowrap";
  document.body.append(probe);
  for (const font of ROLE_FONT_LIST) {
    if (!document.fonts.check(`40px "${font.family}"`)) continue;
    probe.style.fontFamily = `"${font.family}", monospace`;
    probe.textContent = "1111111111";
    const ones = probe.getBoundingClientRect().width;
    probe.textContent = "0000000000";
    if (Math.abs(probe.getBoundingClientRect().width - ones) > 0.5) STATE.unevenFigures.add(font.key);
    else STATE.unevenFigures.delete(font.key);
  }
  probe.remove();
  for (const box of document.querySelectorAll(".font-box")) box.classList.toggle("is-uneven", STATE.unevenFigures.has(box.dataset.font));
}
AFTER_RENDER.push(markUnevenFigures);
document.fonts.addEventListener("loadingdone", markUnevenFigures);

// The page of a build and the library with the fonts of the lists: every title, text and number of
// the windows reads the tokens of the roles.
addSection(() => [`Fonts · the page of a build and the library in the fonts of the lists: titles ${roleFont(chosen.fontTitle).id} · ${roleFont(chosen.fontTitle).family}, text ${roleFont(chosen.fontText).id} · ${roleFont(chosen.fontText).family}, numbers ${roleFont(chosen.fontNumber).id} · ${roleFont(chosen.fontNumber).family}`,
  [[`Overview · level ${STATE.level} · ${escapeHtml(SHOWN.name)}`, buildWindow(960, overview())],
   ["The library: its big title stays in Archivo, the font of the name", libraryHome()]]]);
