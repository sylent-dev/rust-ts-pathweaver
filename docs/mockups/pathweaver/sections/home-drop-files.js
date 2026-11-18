// What the drop zone of E1b does with the files dropped (2l): they open at once, without a button
// (the owner, 2026-11-18): the files dropped together come in one drop, and a file reads in an
// instant. The build is shown, a refused file is named in a notice (2l3); a drop of refused files
// only leaves the page as it was, its zone saying why, until the next drop.
//
// The zone that refuses (the owner, 2026-11-18): no icon, the message alone at its centre, its
// reason in red, the call to drop again at its foot. The reason names what the file is when it
// isn't text (a line means nothing in an image), and the line where the JSON breaks when it is.
// « Error red » at the top of the page: the red, on trial.
const refusedZone = (title, reason) => `<div class="home-drop-error">
    <strong>${title}</strong>
    <span class="home-drop-reason">${reason}</span>
  </div>
  <span class="home-drop-again">Drop a .build file here, or click to choose it</span>`;

addSection(() => ["E1b · A file that isn't a build: the files dropped open at once, without a button; « Error red » at the top of the page",
  [["An image dropped alone: nothing opens, the zone says why (with a build, the build opens and a notice names the image, 2l3)",
    dropHome({ zone: refusedZone("That isn't a .build file", "passive-tree.png is an image, not a build."), state: "is-refused" })],
   ["A .build file whose JSON is broken: the line where it breaks",
    dropHome({ zone: refusedZone("That build can't be read", "Ritualist poison.build isn't valid JSON at line 12."), state: "is-refused" })]]]);
