// What the drop zone of E1b does with the files dropped (2l): they open at once, without a button
// (the owner, 2026-11-18): the files dropped together come in one drop, and a file reads in an
// instant. The build is shown, a refused file is named in a notice (2l3); a drop of refused files
// only leaves the page as it was, its zone saying why, until the next drop.

// The zone that refuses a drop of files that aren't builds: it says why, and waits for the next.
const refusedZone = `${icon(40, ICONS.warning)}
  <strong>That isn't a .build file</strong>
  <span>passive-tree.png can't be read: it isn't JSON (line 1).</span>
  <span>Drop a .build file here, or click to choose it</span>`;

addSection(() => ["E1b · A file that isn't a build: the files dropped open at once, without a button",
  [["An image dropped alone: nothing opens, the zone says why (with a build, the build opens and a notice names the image, 2l3)", dropHome({ zone: refusedZone, state: "is-refused" })]]]);
