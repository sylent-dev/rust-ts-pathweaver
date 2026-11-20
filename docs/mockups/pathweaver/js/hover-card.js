// The construction of every card on hover (2k, the owner, 2026-11-20, from the card of a skill drawn on
// docs/wireframes/gem-card.excalidraw; its look in css/hover-card.css), so that the cards can't drift
// apart: the card of a gem (js/gem-hover.js), of a note of the author (js/note-hover.js), of a passive
// (js/tree-hover.js) and of a slot of the inventory (js/slot-hover.js).
// - Its head, as high as an icon: the title, the subtitle right under it on one line, cut by an
//   ellipsis and whole in a native tooltip (titleIfCut), and the art at the right (the icon of a gem,
//   the mark of an unknown id; none for a note, a passive or an item).
// - Its body, a step darker.
// - The note of the author, in the shade of the head.
// Every part is HTML its caller escaped (the data come from files of strangers).
function hoverCardHtml({ title, subtitle = "", art = "", body = "", note = "" }) {
  return `<div class="hc-head">
      ${art ? `<span class="hc-art">${art}</span>` : ""}
      <div class="hc-title"><strong>${title}</strong>${subtitle ? `<div class="hc-sub">${subtitle}</div>` : ""}</div>
    </div>
    ${body ? `<div class="hc-body">${body}</div>` : ""}
    ${note ? `<div class="hc-note">${note}</div>` : ""}`;
}

// The art of a card from an image of the game: whole (the square icon of a skill), or a disc cut to a
// square (the round icon of a support), grown by √2 so that its round edge falls outside
// the box: the square inscribed in a circle is 71 % of its width (the owner, 2026-11-20).
const HC_DISC_ZOOM = Math.SQRT2;
const hoverArtImage = (src, disc = false) =>
  `<img src="${src}" alt=""${disc ? ` style="transform:scale(${HC_DISC_ZOOM})"` : ""}>`;

// The subtitles cut by their ellipsis show whole in a native tooltip (the owner, 2026-11-20); none
// when they fit. Called once a card is drawn: on hover, and for the cards drawn in place.
function titleIfCut(root) {
  for (const subtitle of root.querySelectorAll(".hc-sub")) {
    if (subtitle.scrollWidth > subtitle.clientWidth) subtitle.title = subtitle.textContent;
    else subtitle.removeAttribute("title");
  }
}
AFTER_RENDER.push(() => titleIfCut(document.getElementById("sheet")));

// Every card stays open while the pointer is on it (2k, the owner, 2026-11-20, then for every card on
// 2026-11-21: the native tooltip of a cut subtitle, the text of a note): leaving what carries it, the
// pointer has HC_GRACE ms to reach the card across the gap between them; on the card, it stays; leaving
// the card, it closes as it would leaving what carries it.
const HC_GRACE = 200;
// The delay starts once: a pointer that keeps moving off what carries the card doesn't hold it open.
function cardCloser(card) {
  let timer = null;
  const cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  const closeSoon = () => {
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      card.classList.remove("is-shown");
    }, HC_GRACE);
  };
  card.addEventListener("mouseenter", cancel);
  card.addEventListener("mouseleave", closeSoon);
  return { cancel, closeSoon };
}

// A card fixed on the page (of a gem, a note, a slot), opened by `show` on hover of what carries it
// (`selector`); a scroll of the page closes it at once, as it moves what carries it.
function openOnHover(card, selector, show) {
  const { cancel, closeSoon } = cardCloser(card);
  document.addEventListener("mouseover", event => {
    if (card.contains(event.target)) return;
    const element = event.target.closest?.(selector);
    if (element) {
      cancel();
      show(element);
    } else if (card.classList.contains("is-shown")) closeSoon();
  });
  document.addEventListener("scroll", () => card.classList.remove("is-shown"), { capture: true, passive: true });
}
