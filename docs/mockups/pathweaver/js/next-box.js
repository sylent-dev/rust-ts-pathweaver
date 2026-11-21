// The box of What's next (2k6, specs.md, Window layout: the band of the site): what version 2 brings, the
// community (specs.md, Versions), in the shade and the construction of the window of « N changes ». It opens with
// the burst (9 · Burst of the openings of the menu of « +N ▾ », the owner, 2026-11-18, commit 4d866fd): it bursts
// out small and turned, with a flash of the accent around it that fades, its lines flying in after it; its turn
// and its flash tuned to its size on the sliders of the page; a plain fade when the system asks for less motion.
// Two places, on trial (sections/next-box.js): out of the link (W1), out of the middle of the window (W2).

const NEXT_LINES = [
  ["Accounts", "your builds published, for others to open"],
  ["Short links", "a build shared in a chat as a link"],
  ["Votes and search", "the best builds, by ascendancy"],
  ["Versions of a build", "what changed between two"],
];
// The window whose box is open (its data-next-case).
STATE.nextOpen = false;

const nextBox = way => `<div class="nx-box is-${way}" role="dialog" aria-label="What's next">
  ${way === "w2" ? `<button type="button" class="nx-close" data-action="next-close" aria-label="Close">${icon(12, ICONS.close)}</button>` : ""}
  <p class="nx-kicker" style="--row:0">What's next</p>
  <h2 class="nx-title app-title" style="--row:1">The community</h2>
  <p class="nx-lead" style="--row:2">Pathweaver is for yourself today. Its next version opens it to everyone:</p>
  <ul class="nx-lines">${NEXT_LINES.map(([name, what], index) => `<li style="--row:${index + 3}"><b>${name}</b> · ${what}</li>`).join("")}</ul>
  <p class="nx-foot" style="--row:${NEXT_LINES.length + 3}">Until then, a build is shared as its .build file.</p>
</div>`;

// What's next opens the box of its window, or closes it, and closes the other windows and menus.
ACTIONS["next-toggle"] = (element, event) => {
  event.preventDefault();   // a link of the band, whose # would scroll the page to its top
  const owner = element.closest("[data-next-case]");
  if (!owner) return false;
  STATE.nextOpen = STATE.nextOpen === owner.dataset.nextCase ? false : owner.dataset.nextCase;
  STATE.changesOpen = false;
  STATE.buildsMenu = false;
  STATE.downloadOpen = false;
  return true;
};
ACTIONS["next-close"] = () => {
  STATE.nextOpen = false;
  return true;
};
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && STATE.nextOpen !== false) {
    STATE.nextOpen = false;
    renderSheet();
  }
});
document.addEventListener("click", event => {
  if (STATE.nextOpen === false || event.target.closest(".nx-box, [data-action='next-toggle']")) return;
  STATE.nextOpen = false;
  renderSheet();
});
