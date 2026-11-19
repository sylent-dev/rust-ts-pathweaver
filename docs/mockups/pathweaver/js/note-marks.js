// The mark of a note of the author (2g3, the owner, 2026-11-19): the page with three lines of 2g reads
// as a scribble at 12 px. Twelve marks, three at each of four temperatures, each a simple shape
// without inner detail; the list « Note » at the top applies one to every window (ICONS.note). The
// marks set aside go once one is kept (2g4).

const FILL = 'fill="currentColor" stroke="none"';
const NOTE_MARKS = {
  page: { title: "The page of 2g", body: '<path d="M3.5 2.5h9v11h-9z"/><path d="M5.8 5.5h4.4M5.8 8h4.4M5.8 10.5h2.4"/>' },
  n1: { title: "N1 · Normal · a speech bubble, hollow", body: '<path d="M2.5 3.5h11v7.5H7l-3.5 2.8V11h-1z"/>' },
  n2: { title: "N2 · Normal · a speech bubble, filled", body: `<path d="M2 3h12v8.2H7.2L3.4 14.2V11.2H2z" ${FILL}/>` },
  n3: { title: "N3 · Normal · quotation marks", body: `<path d="M2.5 9.5a3 3 0 1 1 5 2.2C6.8 12.6 5.6 13.4 4 13.8l-.4-1c1-.5 1.6-1 1.9-1.6A3 3 0 0 1 2.5 9.5z" ${FILL} transform="translate(0 -3.2)"/><path d="M8.5 9.5a3 3 0 1 1 5 2.2c-.7.9-1.9 1.7-3.5 2.1l-.4-1c1-.5 1.6-1 1.9-1.6A3 3 0 0 1 8.5 9.5z" ${FILL} transform="translate(0 -3.2)"/>` },
  n4: { title: "N4 · High · a bubble that says something, its three dots", body: `<path d="M2 3h12v8.2H7.2L3.4 14.2V11.2H2z" ${FILL}/><circle cx="5" cy="7.1" r="1.15" fill="var(--band-deep)" stroke="none"/><circle cx="8" cy="7.1" r="1.15" fill="var(--band-deep)" stroke="none"/><circle cx="11" cy="7.1" r="1.15" fill="var(--band-deep)" stroke="none"/>` },
  n5: { title: "N5 · High · a page, its corner folded, no line", body: '<path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3"/>' },
  n6: { title: "N6 · High · the nib of a pen", body: `<path d="M8 1.5 12.5 7 8 14.5 3.5 7z" ${FILL}/><path d="M8 7.2v4.3" stroke="var(--band-deep)" stroke-width="1.3"/><circle cx="8" cy="6.6" r="1.2" fill="var(--band-deep)" stroke="none"/>` },
  n7: { title: "N7 · Explosive · a pin, the note pinned", body: `<path d="M5 1.8h6l-.8 4.2 2.3 2.5H3.5L5.8 6z" ${FILL}/><path d="M8 8.5v6"/>` },
  n8: { title: "N8 · Explosive · a sticky note, its corner lifting", body: `<path d="M2.5 2.5h11v7l-4 4h-7z" fill="currentColor" fill-opacity=".35"/><path d="M13.5 9.5h-4v4"/>` },
  n9: { title: "N9 · Explosive · the triangle of the brand as a bubble", body: `<path d="M1.5 3h13L8 14.3z" ${FILL}/>` },
  n10: { title: "N10 · Free · an asterisk, as a footnote", body: '<path d="M8 2.5v11M3.2 5.25l9.6 5.5M12.8 5.25l-9.6 5.5" stroke-width="2"/>' },
  n11: { title: "N11 · Free · a word dot: a round bubble, small and filled", body: `<path d="M8 2.5a5.5 5.5 0 1 1-3.2 10l-2.6.9.9-2.6A5.5 5.5 0 0 1 8 2.5z" ${FILL}/>` },
  n12: { title: "N12 · Free · a hexagon that speaks, from the mark of the gems", body: `<path d="M8 1 14 4.5v6L8 14l-2.2-1.3-3 1.8.4-3.3L2 10.5v-6z" ${FILL}/>` },
};

// The mark of a note, wherever ICONS.note is read: the one chosen at the top of the page.
Object.defineProperty(ICONS, "note", { get: () => (NOTE_MARKS[chosen.noteMark] ?? NOTE_MARKS.n1).body });
