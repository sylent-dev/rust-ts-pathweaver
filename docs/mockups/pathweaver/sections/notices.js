// The notices (2l3, css/notices.css; specs.md, Window layout): the files refused while a build
// opens, a damaged share link, private browsing. Each stays until it is closed. A band under the
// band of the site, over the band of the open builds (the owner, 2026-11-18: a tab touches the
// page it shows), so that a notice is at the same place on every page. The first visit has no
// bands: there, the zone says what went wrong, and its foot that nothing is kept.

// A notice: `kind` error (the red of the errors) or info (grey: private browsing isn't an error,
// Pathweaver works the same); no icon, the shade and the words say it (the owner, 2026-11-18); its
// title; the files refused, each its name, its reason and the line of the error when there is
// one; or a note; its close button, a square in the corner.
const noticeFile = ([name, reason, line]) => `<li><span class="app-notice-file">${escapeHtml(name)}</span> <span class="app-notice-reason">${reason}</span>${line ? `<code>${escapeHtml(line)}</code>` : ""}</li>`;
const notice = ({ kind = "error", title, files = [], note = "" }) => `<div class="app-notice is-${kind}" role="${kind === "error" ? "alert" : "status"}">
    <div class="app-notice-text"><strong>${title}</strong>${files.length ? `<ul>${files.map(noticeFile).join("")}</ul>` : ""}${note ? `<span class="app-notice-note">${note}</span>` : ""}</div>
    <button type="button" class="app-notice-close" aria-label="Close" title="Close">${icon(16, ICONS.close)}</button>
  </div>`;
// The notices of a window, the errors first.
const notices = list => `<div class="app-notices">${list.join("")}</div>`;

const NOTICES = {
  refused: notice({ title: "3 of the 4 files dropped weren't opened", files: [
    ["passive-tree.png", "is an image, not a build."],
    ["Ritualist poison.build", "isn't valid JSON at line 12:", '"level": 12,,'],
    ["Mercenary.build", "has a text where a number goes, in skills › 3 › level."]] }),
  refusedOne: notice({ title: "1 of the 2 files dropped wasn't opened", files: [["notes.txt", "isn't JSON: it starts with “Act 1”.", ""]] }),
  link: notice({ title: "That link can't be opened",
    note: "It was cut: it ends after 1,204 of its characters. Ask for the link again, or for the .build file." }),
  // Shown at every visit: a private window forgets everything once closed, its close included.
  private: notice({ kind: "info", title: "This browser keeps nothing",
    note: "Private browsing: the builds you open will be gone once it's closed. Download .build keeps the file of a build." }),
};

// The page of a build with its notices between the two bands.
const noticeWindow = list => `<div class="app-window" style="width:960px">${siteBand()}${notices(list)}${buildsBand(960)}${buildHeader()}${levelBand()}${buildTabs()}${overview()}</div>`;

addSection(() => ["Notices · a damaged share link, and private browsing: the same band as the files refused",
  [["A damaged link while builds are open: the build shown before stays, the notice says why", noticeWindow([NOTICES.link])],
   ["A damaged link with no build open: the library, the notice at the same place, under the band of the site",
    libraryHome({ builds: LIBRARY.map(build => ({ ...build, open: false })), notices: notices([NOTICES.link]) })],
   ["A damaged link at the first visit: no bands, the zone says why, like a file refused",
    dropHome({ zone: refusedZone("That link can't be opened", "It was cut: it ends after 1,204 of its characters."), state: "is-refused" })],
   ["Private browsing: grey, not an error; Pathweaver works the same; shown at every visit", noticeWindow([NOTICES.private])],
   ["Private browsing at the first visit: its foot says it, rather than a notice", dropHome({ local: HOME_TEXT.private })],
   ["Both at once: the error first", noticeWindow([NOTICES.link, NOTICES.private])]]]);

addSection(() => ["Notices · the files refused while a build opens: a band between the two bands, until it is closed",
  [["Four files dropped, one build opened and shown: the notice names the three others and why; hover its close button", noticeWindow([NOTICES.refused])],
   ["One file refused", noticeWindow([NOTICES.refusedOne])]]]);
