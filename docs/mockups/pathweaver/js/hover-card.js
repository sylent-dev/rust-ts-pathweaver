// The construction of every card on hover (2k, the owner, 2026-11-20, from the card of a skill drawn on
// docs/wireframes/gem-card.excalidraw; its look in css/hover-card.css), so that the cards can't drift
// apart: the card of a gem (js/gem-hover.js), of a note of the author (js/note-hover.js), of a passive
// (js/tree-hover.js) and of a slot of the inventory (js/slot-hover.js).
// - Its head, as high as an icon: the title, the subtitle right under it on one line, cut by an
//   ellipsis and whole in a native tooltip (titleIfCut), and the art at the right (the icon of a gem, of
//   a passive, the mark of an unknown id; none for a note or an item).
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
// square (the round icon of a support or a passive), grown by √2 so that its round edge falls outside
// the box: the square inscribed in a circle is 71 % of its width (the owner, 2026-11-20).
const HC_DISC_ZOOM = Math.SQRT2;
const hoverArtImage = (src, disc = false) =>
  `<img src="${src}" alt=""${disc ? ` style="transform:scale(${HC_DISC_ZOOM})"` : ""}>`;

// The art of a card from a sheet of the game, the icon at `rect` ([x, y, width, height] in the sheet),
// a disc cut to a square as above (the icon of a passive, TREE.sheets): its sheet as the background of
// the box, grown so that the icon covers the box by √2, centred. None while the sheet is loading.
const HC_ART = 48;   // the box of the art, --hc-art of css/hover-card.css
function hoverArtSprite(sheet, [x, y, width, height]) {
  if (!sheet.naturalWidth) return "";
  const zoom = (HC_ART * HC_DISC_ZOOM) / Math.min(width, height);
  const [left, top] = [(HC_ART - width * zoom) / 2 - x * zoom, (HC_ART - height * zoom) / 2 - y * zoom];
  return `<span class="hc-sprite" style="background-image:url('${sheet.src}');background-size:${sheet.naturalWidth * zoom}px ${sheet.naturalHeight * zoom}px;background-position:${left}px ${top}px"></span>`;
}

// The subtitles cut by their ellipsis show whole in a native tooltip (the owner, 2026-11-20); none
// when they fit. Called once a card is drawn: on hover, and for the cards drawn in place.
function titleIfCut(root) {
  for (const subtitle of root.querySelectorAll(".hc-sub")) {
    if (subtitle.scrollWidth > subtitle.clientWidth) subtitle.title = subtitle.textContent;
    else subtitle.removeAttribute("title");
  }
}
AFTER_RENDER.push(() => titleIfCut(document.getElementById("sheet")));
