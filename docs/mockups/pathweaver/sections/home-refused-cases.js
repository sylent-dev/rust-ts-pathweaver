// The zone that refuses, the case the first mock-up didn't draw (4e3a, 2026-11-23): several files
// dropped, all refused: « These files can't be read », then a line each as in the notice of the
// page of a build (sections/notices.js), the list scrolling in the zone past four. The reasons are
// those of the core, which says a file isn't text, not that it is an image; no period at the end
// of a reason, and no text of the line where a JSON breaks: its number says enough (the owner,
// 2026-11-23), here and in the notice.

// One file refused: its title, its name and its reason.
const refusedOneZone = (title, [name, reason]) => `<div class="home-drop-error">
    <strong>${title}</strong>
    <span class="home-drop-reason"><span class="home-drop-file">${escapeHtml(name)}</span> ${reason}</span>
  </div>
  <span class="home-drop-again">Drop a .build file here, or click to choose it</span>`;

// Several files refused: a line each, the list scrolling past four.
const refusedListZone = files => `<div class="home-drop-error is-list">
    <strong>These files can't be read</strong>
    <ul class="home-drop-files">${files.map(([name, reason]) => `<li><span class="home-drop-file">${escapeHtml(name)}</span>
      <span class="home-drop-reason">${reason}</span></li>`).join("")}</ul>
  </div>
  <span class="home-drop-again">Drop a .build file here, or click to choose it</span>`;

const REFUSED_FILES = [
  ["passive-tree.png", "isn't a text file"],
  ["Ritualist poison.build", "isn't valid JSON at line 12"],
  ["Mercenary.build", "has a value of the wrong type at skills[2].level"],
  ["notes.txt", "isn't valid JSON at line 1"],
  ["Monk invoker.build", "misses the field passives[0].id"],
  ["video.mp4", "is 48,234,112 bytes, larger than 1,048,576"],
  ["Witch.build", "isn't a build: an object with a name"],
];

addSection(() => ["Home · the zone that refuses: a file whose JSON breaks, and several files at once",
  [["An image dropped alone: what the core knows, that it isn't text",
    dropHome({ zone: refusedOneZone("That isn't a .build file", REFUSED_FILES[0]), state: "is-refused" })],
   ["A .build file whose JSON breaks: the number of its line",
    dropHome({ zone: refusedOneZone("That build can't be read", REFUSED_FILES[1]), state: "is-refused" })],
   ["Three files dropped, all refused: a line each, as in the notice",
    dropHome({ zone: refusedListZone(REFUSED_FILES.slice(0, 3)), state: "is-refused" })],
   ["Seven files refused: the list scrolls in the zone past four (scroll it)",
    dropHome({ zone: refusedListZone(REFUSED_FILES), state: "is-refused" })]]]);
