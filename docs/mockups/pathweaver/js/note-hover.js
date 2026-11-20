// The card of a note of the author (2j5, the owner, 2026-11-20: the note itself, in place of « The
// author left a note »), on hover of its mark wherever it shows: « New at N », the window of « N
// changes », the rows of the skills. In the language of the card of a gem (css/gem-hover.css), fixed on
// the page: its head names what carries it, the place first in grey when it hangs on one (« Body ·
// Wyrmscale Coat », « Spark · Efficiency II »), then the note with the markup of the game (markupHtml,
// js/tree-hover.js). A group of passives with one note is the card of that passive (« Set II · Exposure
// Effect », the set in its colour, as on the tree, never on the lines, where the green and the red say
// added and gone; the owner, 2026-11-20); with more, it lists them, the name of each a small head over its note, three,
// then « and N more notes » (the owner, 2026-11-20: the name in grey over a note the author wrote in
// grey read as the note).

const NOTE_LIST = 3;

// The mark of a note, carrying what its card says (data-note-*, read back by noteHoverHtml): the place
// and the name of what carries it, and its text, or the list of a group of passives as JSON. Nothing
// when there is no note.
function noteMark(note) {
  if (!note || !(note.text || note.list?.length)) return "";
  if (note.list?.length === 1) note = { place: note.place, set: note.set, head: note.list[0].name, text: note.list[0].note };
  const data = [["place", note.place], ["set", note.set], ["head", note.head], ["text", note.text], ["list", note.list && JSON.stringify(note.list)]]
    .filter(([, value]) => value).map(([key, value]) => ` data-note-${key}="${escapeHtml(value)}"`).join("");
  return `<span class="app-changes-note" aria-label="A note of the author"${data}>${icon(12, ICONS.note)}</span>`;
}

// A note set again, the line of the window that says so: the bubble of its sign is its mark.
const retoldMark = change => noteMark({
  place: change.kind === "gear" ? SLOT_NAMES[change.on] ?? change.on : change.kind === "support" ? change.on : "",
  head: change.name, text: change.kind === "gear" ? withoutNumbers(change.note) : change.note,
});

// The card in the construction of the card of a gem (2k, the owner, 2026-11-20; css/skill-card.css):
// its head, what carries the note and, under it, « Note of the author » as its subtitle; its body a step
// darker, the note; no icon.
function noteHoverHtml(mark) {
  const { notePlace: place, noteSet: set, noteHead: head, noteText: text, noteList: list } = mark.dataset;
  const notes = list ? JSON.parse(list) : [];
  const title = `<div class="sc-head"><div class="sc-title"><strong>${place && !list ? `<span class="app-note-place"><span${set ? ` class="is-set${set}"` : ""}>${escapeHtml(place)}</span> · </span>` : ""}${escapeHtml(head)}</strong>
    <div class="app-gem-tags">${notes.length > 1 ? `${notes.length} notes of the author` : "Note of the author"}</div></div></div>`;
  if (!list) return `${title}<div class="sc-body app-note-text">${markupHtml(text)}</div>`;
  const more = notes.length - NOTE_LIST;
  return `${title}<div class="sc-body"><ul class="app-note-list">${notes.slice(0, NOTE_LIST).map(entry =>
    `<li><span class="app-note-passive">${escapeHtml(entry.name)}</span>${markupHtml(entry.note)}</li>`).join("")}</ul>
    ${more > 0 ? `<p class="app-note-more">and ${plural(more, "more note", "more notes")}</p>` : ""}</div>`;
}

// One card for the page, as the card of a gem: in the right column, just left of the column, over the
// tree, centred on the mark (right of it when the window has no room on its left); in the window of
// « N changes », just right of the window, over the tree (left of it when there is no room).
const noteCard = document.createElement("div");
noteCard.className = "app-hover app-gem-hover app-note-hover is-skill-card";
document.body.append(noteCard);
function showNoteHover(mark) {
  noteCard.innerHTML = noteHoverHtml(mark);
  // Beside the window of « N changes », opaque as the window, over what the page shows there.
  noteCard.classList.toggle("is-over-rows", !mark.closest(".app-side"));
  noteCard.classList.add("is-shown");
  const box = mark.getBoundingClientRect();
  const beside = (mark.closest(".app-side") ?? mark.closest(".app-changes-window"))?.getBoundingClientRect() ?? box;
  const [w, h] = [noteCard.offsetWidth, noteCard.offsetHeight];
  const left = beside.left - w - 8, right = beside.right + 8;
  const onLeft = mark.closest(".app-side") ? left >= 8 : right + w > innerWidth - 8 && left >= 8;
  noteCard.style.left = `${onLeft ? left : right}px`;
  noteCard.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, box.top + box.height / 2 - h / 2))}px`;
}
document.addEventListener("mouseover", event => {
  const mark = event.target.closest?.(".app-changes-note[data-note-head]");
  if (mark) showNoteHover(mark);
  else noteCard.classList.remove("is-shown");
});
document.addEventListener("scroll", () => noteCard.classList.remove("is-shown"), { capture: true, passive: true });
