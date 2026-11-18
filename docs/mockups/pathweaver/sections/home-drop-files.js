// What the drop zone of E1b does with the files dropped (2l, the owner, 2026-11-18: « il faut un
// bouton OK ? »), two ways side by side, with the case of a file that isn't a build:
// - they open at once (Claude Code's recommendation: the files dropped together come in one drop,
//   and a file reads in an instant): the build is shown, a refused file is named in a notice (2l3);
//   a drop of refused files only leaves the page as it was, its zone saying why;
// - the zone fills, and « Open N builds » opens them: what was read, what is refused and why, a
//   file taken out, before opening.

// Three files dropped together: two builds of a guide of the corpus, and an image dropped by mistake.
const DROPPED = [
  { file: "lvl 1-14 - 0.5.5 Fubgun Flameblast Oil G.build", build: BUILDS.open[1], levels: "1–14", size: "3 KB" },
  { file: "lvl 15-32 - 0.5.5 Fubgun Flameblast Oil .build", build: BUILDS.open[2], levels: "15–32", size: "4 KB" },
  { file: "passive-tree.png", reason: "Not a build: it isn't JSON (line 1)" },
];

const droppedRow = ({ file, build, levels, size, reason }) => reason
  ? `<div class="drop-file is-refused" title="${escapeHtml(file)}">
      <span class="drop-file-mark">${icon(18, ICONS.warning)}</span>
      <span class="drop-file-text"><span class="drop-file-name">${escapeHtml(file)}</span><span class="drop-file-meta">${reason}</span></span>
      <button type="button" class="drop-file-out" aria-label="Take it out">${icon(12, ICONS.close)}</button>
    </div>`
  : `<div class="drop-file" title="${escapeHtml(file)}">
      <img class="drop-file-portrait" src="pathweaver/img/portraits-square/${build.portrait}.webp" width="36" height="36" alt="">
      <span class="drop-file-text"><span class="drop-file-name">${escapeHtml(build.name)}</span><span class="drop-file-meta">${escapeHtml(build.ascendancy)} · levels ${levels} · ${size}</span></span>
      <button type="button" class="drop-file-out" aria-label="Take it out">${icon(12, ICONS.close)}</button>
    </div>`;

// The zone filled: the files, then a line to drop more and the button that opens the builds.
const filledZone = files => {
  const builds = files.filter(file => !file.reason).length;
  return `<div class="drop-files">${files.map(droppedRow).join("")}</div>
    <div class="drop-files-foot">
      <span class="drop-files-more">${icon(16, ICONS.plus)}Drop more, or click to choose them</span>
      <button type="button" class="home-cta drop-files-open" ${builds ? "" : "disabled"}>Open ${builds} build${builds === 1 ? "" : "s"}</button>
    </div>`;
};

// The zone that refuses a drop of files that aren't builds: it says why, and waits for the next.
const refusedZone = `${icon(40, ICONS.warning)}
  <strong>That isn't a .build file</strong>
  <span>passive-tree.png can't be read: it isn't JSON (line 1).</span>
  <span>Drop a .build file here, or click to choose it</span>`;

addSection(() => ["E1b · The files dropped: open at once (recommended), or fill the zone and open with a button; and a file that isn't a build",
  [["At once · an image dropped alone: nothing opens, the zone says why (with a build, the build opens and a notice names the image, 2l3)", dropHome({ zone: refusedZone, state: "is-refused" })],
   ["With a button · one build dropped: it waits in the zone", dropHome({ zone: filledZone(DROPPED.slice(0, 1)), state: "is-filled" })],
   ["With a button · three files, the image refused with its reason: « Open 2 builds »", dropHome({ zone: filledZone(DROPPED), state: "is-filled" })]]]);
