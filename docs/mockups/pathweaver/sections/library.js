// The library (2l2, css/library.css; specs.md, Window layout): the home page once a build was
// opened, reached from My library and from the + of the band of the open builds. The two bands at
// its top (the owner, 2026-11-18), no tab the current one; under them a calm page on the graph
// paper of the blocks, without the fluid and the watermark of the first visit: its title, a strip
// to drop the files on, then a row per build, the last opened first.

// When each build of the sample was opened last (the file doesn't say: the browser keeps it).
const LAST_OPENED = ["today, 18:02", "today, 17:40", "today, 17:40", "today, 17:38", "today, 17:12", "yesterday, 21:30",
  "yesterday, 20:05", "12 Nov", "10 Nov", "8 Nov", "8 Nov", "2 Nov", "30 Oct", "29 Oct"];
const LIBRARY = BUILDS.library.map((build, index) => ({ ...build, opened: LAST_OPENED[index] ?? "1 Oct", open: index < BUILDS.open.length }));

// The strip to drop the files on: the zone of the first visit, low and wide, its icon on the left;
// a click chooses the files. While a file is over the page, it lights up like the zone. On its
// right, Paste JSON, a button in the style of the + of the band of the open builds (the owner,
// 2026-11-18), which turns the strip into a field, taller.
const libraryPaste = label => `<button type="button" class="library-paste"><span>${label}</span></button>`;
const libraryDrop = ({ drag = false, paste = false } = {}) => paste
  ? `<div class="library-drop-row"><div class="home-drop-zone library-drop is-paste is-focus">${pasteZone()}</div>${libraryPaste("Drop a file instead")}</div>`
  : `<div class="library-drop-row"><div class="home-drop-zone library-drop" role="button" tabindex="0">${dropMark(32)}
      <span class="library-drop-text"><strong>${drag ? "Let go to open it" : "Add a build"}</strong>
      <span>${drag ? "1 file over the page" : "Drop .build files here, or click to choose them"}</span></span>
    </div>${libraryPaste("Paste JSON")}</div>`;

const libraryMeta = build => [build.author && `by ${escapeHtml(build.author)}`, `${escapeHtml(build.ascendancy)} (${escapeHtml(build.class)})`,
  build.levels ? `levels ${build.levels[0]}–${build.levels[1]}` : "snapshot"].filter(Boolean).join(" · ");

// A row: the portrait square the full height of the row, the name over who wrote it, the
// ascendancy and the levels; when it was opened last; Open, greyed when its tab is already in the
// band (the owner, 2026-11-18, rather than a mark « open »); the bin. `state`: is-hover to show the hover; is-asking when the bin was clicked: the row asks,
// in its place, and says that the tab closes too when the build is open; a long name is cut, never
// the question.
const rowPortrait = build => `<img class="library-portrait" src="pathweaver/img/portraits-square/${build.portrait}.webp" width="56" height="56" alt="">`;
const libraryRow = (build, state = "") => {
  const name = escapeHtml(build.name.trim());
  if (state === "is-asking") {
    return `<li class="library-row is-asking">
      ${rowPortrait(build)}
      <span class="library-ask"><span>Remove “</span><span class="library-ask-name">${name}</span><span>” from the library for good?</span>${build.open ? `<span class="app-weak">Its tab closes too.</span>` : ""}</span>
      <button type="button" class="library-remove">Remove</button>
      <button type="button" class="library-cancel">Cancel</button>
    </li>`;
  }
  return `<li class="library-row ${state}" title="${name}">
    ${rowPortrait(build)}
    <span class="library-text"><span class="library-name">${name}</span><span class="library-meta">${libraryMeta(build)}</span></span>
    <span class="library-date">${build.opened}</span>
    ${build.open
    ? `<a class="app-site-link library-open is-disabled" role="link" aria-disabled="true" title="Already open: its tab is in the band"><span class="app-site-label">Open</span></a>`
    : `<a class="app-site-link library-open" href="#" role="button"><span class="app-site-label">Open</span></a>`}
    <button type="button" class="library-bin" aria-label="Remove from the library" title="Remove from the library">${icon(16, ICONS.bin)}</button>
  </li>`;
};

// The page: the bands, the band of the open builds while one is open; `rows` the states of the rows
// by index; `drag` a file over the page; `paste` the strip become a field.
const libraryHome = ({ builds = LIBRARY, rows = {}, drag = false, paste = false } = {}) => {
  const open = builds.filter(build => build.open);
  return `<div class="app-window home-window home-library ${drag ? "is-drag" : ""}" ${drag ? "data-held" : ""} data-sample-theme="frost-night" style="width:${homeWidth()}px;height:${HOME_HEIGHT}px">
    ${siteBand({ library: true })}${open.length ? buildsBand(homeWidth(), { builds: open, current: -1, menuOpen: false }) : ""}
    <div class="library-page">
      <div class="library-inner">
        <div class="library-head"><h1>My library</h1><span>${builds.length} ${builds.length === 1 ? "build" : "builds"} · the last opened first</span></div>
        ${libraryDrop({ drag, paste })}
        <ol class="library-list">${builds.map((build, index) => libraryRow(build, rows[index])).join("")}</ol>
        <p class="library-foot">${HOME_TEXT.local}</p>
      </div>
    </div>
  </div>`;
};

addSection(() => ["Home · the library: the page once a build was opened, the two bands at its top",
  [["Fourteen builds, five open (their Open greyed): hover a row, its name in full in its title", libraryHome({ rows: { 6: "is-hover" } })],
   ["The bin clicked: the row asks once, in its place; an open build says that its tab closes too", libraryHome({ rows: { 4: "is-asking" } })],
   ["A file over the page: the strip lights up, wherever the file is let go", libraryHome({ drag: true })],
   ["Paste JSON: the strip becomes a field, taller, and a paste opens the build at once", libraryHome({ paste: true })],
   ["The last build removed: the library is empty, and the first visit comes back (the section below)",
    libraryHome({ builds: LIBRARY.slice(6, 7), rows: { 0: "is-asking" } })]]]);
