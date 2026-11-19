// The mark of a note, twelve marks (2g3, the owner, 2026-11-19): each at 12, 14 and 16 px, in the
// weak grey of the window and in the colour of its text, then rows of W1 that carry a note.

const NOTE_SIZES = [12, 14, 16];

function noteBoard(key) {
  const body = NOTE_MARKS[key].body;
  const sizes = colour => NOTE_SIZES.map(size => `<span class="app-gem-cell" style="color:${colour}">${icon(size, body)}</span>`).join("");
  const row = (tag, name, detail) => `<li class="is-note"><span class="app-wv-sign">${tag === "NOTE" ? icon(12, body) : "+"}</span><span class="app-wv-tag">${tag}</span>
    <span class="app-wv-name">${name}</span><span class="app-wv-detail">${detail}</span></li>`;
  return `<div class="app-window app-gem-board app-note-board">
    <div class="app-gem-sizes app-note-sizes"><span></span>${NOTE_SIZES.map(size => `<span>${size} px</span>`).join("")}
      <span>Grey</span>${sizes("var(--on-band-weak)")}<span>Text</span>${sizes("var(--on-band)")}</div>
    <ul class="app-wv-lines app-note-rows">
      ${row("NOTE", "<b>Linen Belt</b>", "Belt · new text")}
      ${row("NOTE", "<b>Twin Bow</b>", "Weapon · new text")}
      ${row("SUPPORT", `${gemMark("b", "support")}<b>Vilenta's Propulsion</b><span class="app-changes-note">${icon(12, body)}</span>`, "on Spark")}
      ${row("SUPPORT", `${gemMark("w", "support")}<b>Trickster's Shard</b><span class="app-changes-note">${icon(12, body)}</span>`, "on Spark")}
    </ul></div>`;
}

addSection(() => ["The mark of a note of the author · twelve marks, three per temperature; « Note » at the top applies one to every window",
  Object.keys(NOTE_MARKS).filter(key => key !== "page").map(key => [NOTE_MARKS[key].title, noteBoard(key)])]);
