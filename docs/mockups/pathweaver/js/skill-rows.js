// A row of a skill in the right column of the Overview, twelve variants (2j2), three at each of four
// temperatures: normal, high, explosive, free. The column is 330 px wide and holds « New at N » and
// the inventory too: the supports written out in full would add about 40 lines, so the row stays
// compact there, and the full list goes to the Skills tab (2k). Each variant shows the gem G3 (2g3),
// a mark of the spirit gem (owed by 2g4), the note of the author (N2 of 2g3), what is new at the level
// in the accent, and the skill a spirit gem triggers (Comet under Cast on Critical) as a skill,
// indented under it. Removed once one is kept.

// Four marks of the spirit gem, a gem that stays on while it reserves spirit; the variants share them.
const SPIRIT_MARKS = {
  hollow: ["the hexagon hollow", '<polygon points="8,1.6 13.5,4.8 13.5,11.2 8,14.4 2.5,11.2 2.5,4.8" fill="none" stroke="currentColor" stroke-width="2.2"/>'],
  core: ["the hexagon hollow, a core in it", '<polygon points="8,1.6 13.5,4.8 13.5,11.2 8,14.4 2.5,11.2 2.5,4.8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="8" r="2.4" fill="currentColor"/>'],
  ring: ["the hexagon in a ring", '<circle cx="8" cy="8" r="7.1" fill="none" stroke="currentColor" stroke-width="1.4"/><polygon points="8,3.6 11.8,5.8 11.8,10.2 8,12.4 4.2,10.2 4.2,5.8" fill="currentColor"/>'],
  double: ["two hexagons, one in the other", '<polygon points="8,0.8 14.2,4.4 14.2,11.6 8,15.2 1.8,11.6 1.8,4.4" fill="none" stroke="currentColor" stroke-width="1.3"/><polygon points="8,4.4 11.1,6.2 11.1,9.8 8,11.6 4.9,9.8 4.9,6.2" fill="currentColor"/>'],
};
for (const [key, [, shape]] of Object.entries(SPIRIT_MARKS)) GEM_SHAPES[`spirit-${key}`] = shape;

// The mark of a gem of a row: a support a square on its tip, a skill a hexagon, a spirit gem the mark
// of the variant.
const rowMark = (gem, spirit) => gemMark(gem.colour, gem.kind === "support" ? "support" : gem.kind === "spirit" ? `spirit-${spirit}` : "skill");
const rowNote = gem => noteMark(Boolean(gem.note), "The author left a note: its text on hover (2j2, next commit)");
const NEW_WORD = '<span class="app-accent app-sr-new">new</span>';

// A skill at the level, read once for every variant: whether it starts at the level, its supports
// (each new when it comes onto the skill at this level), and the skills it triggers apart.
function skillRow(skill, level) {
  const isNew = startsAt(skill.levels, level);
  const gems = skill.supports.map(gem => ({ ...gem, isNew: !isNew && startsAt(gem.levels, level) }));
  const supports = gems.filter(gem => gem.kind === "support");
  return { ...skill, isNew, gems, supports, triggered: gems.filter(gem => gem.kind !== "support"), newSupports: supports.filter(gem => gem.isNew) };
}
const rowsAt = level => skillsAt(level).map(skill => skillRow(skill, level));

// The skill a spirit gem triggers, indented under it.
const triggeredRows = (row, spirit, right = () => "") => row.triggered.map(gem =>
  `<li class="app-sr-row app-sr-triggered"><span class="app-weak app-sr-hook" aria-hidden="true">↳</span>${rowMark(gem, spirit)}<span class="app-sr-name">${escapeHtml(gem.name)}</span>${rowNote(gem)}${gem.isNew ? NEW_WORD : ""}${right(gem)}</li>`).join("");

// The head of a row: its mark, its name, its note, « new ».
const rowHead = (row, spirit) => `${rowMark(row, spirit)}<span class="app-sr-name">${escapeHtml(row.name)}</span>${rowNote(row)}${row.isNew ? NEW_WORD : ""}`;
const supportNames = row => row.supports.map(gem => gem.name).join(", ");

// A list of rows, under the title of the column.
const rowList = (rows, item, extra = "") => `<ul class="app-sr ${extra}">${rows.map(item).join("")}</ul>`;

STATE.skillRowsOpen = {};
ACTIONS["skill-row-fold"] = element => {
  const key = element.dataset.row;
  STATE.skillRowsOpen[key] = !(STATE.skillRowsOpen[key] ?? element.dataset.open === "true");
  return true;
};

// A small track of the levels of a skill (E3): from its start to 100, a tick where each of its
// supports starts, the level a white line.
function levelTrack(row, level) {
  const x = value => ((Math.max(value, 1) - 1) / 99 * 100).toFixed(1);
  const ticks = row.gems.filter(gem => gem.levels[0] > row.levels[0]).map(gem =>
    `<i class="app-sr-tick ${gem.levels[0] === level ? "is-new" : ""}" style="left:${x(gem.levels[0])}%;color:${gemColour(gem.colour)}" title="${escapeHtml(gem.name)} from ${gem.levels[0]}"></i>`).join("");
  return `<span class="app-sr-track" title="From ${row.levels[0]} to ${row.levels[1]}"><i class="app-sr-span" style="left:${x(row.levels[0])}%;right:${(100 - Number(x(row.levels[1]))).toFixed(1)}%"></i>${ticks}<i class="app-sr-level" style="left:${x(level)}%"></i></span>`;
}

const SKILL_ROW_VARIANTS = {
  N1: {
    title: "N1 · Count", spirit: "hollow",
    text: "The row of 2a tidied: the count of the supports at the right, « +2 » in the accent before it when two come at the level; their names in the hover of the row.",
    list: (rows, level, spirit) => rowList(rows, row => `<li class="app-sr-row" title="${escapeHtml(supportNames(row))}">${rowHead(row, spirit)}
      <span class="app-sr-right">${row.newSupports.length > 0 ? `<b class="app-accent">+${row.newSupports.length}</b> ` : ""}<span class="app-weak">${plural(row.supports.length, "support")}</span></span></li>${triggeredRows(row, spirit)}`),
  },
  N2: {
    title: "N2 · Marks", spirit: "core",
    text: "The supports as their marks at the right, in the order of the file, each named on hover; a new one lifted on a line of the accent.",
    list: (rows, level, spirit) => rowList(rows, row => `<li class="app-sr-row">${rowHead(row, spirit)}
      <span class="app-sr-right app-sr-marks">${row.supports.map(gem => `<span class="app-sr-mark ${gem.isNew ? "is-new" : ""}" title="${escapeHtml(gem.name)}${gem.isNew ? " · new" : ""}">${rowMark(gem, spirit)}</span>`).join("")}</span></li>${triggeredRows(row, spirit)}`),
  },
  N3: {
    title: "N3 · Two lines", spirit: "ring",
    text: "The names of the supports on a second line, small and grey, cut by « … » when they overflow; a new one in the accent.",
    list: (rows, level, spirit) => rowList(rows, row => `<li class="app-sr-row app-sr-two"><span class="app-sr-line">${rowHead(row, spirit)}</span>
      <span class="app-sr-sub" title="${escapeHtml(supportNames(row))}">${row.supports.map(gem => `<span class="${gem.isNew ? "app-accent" : ""}">${escapeHtml(gem.name)}</span>`).join('<span class="app-sr-dot"> · </span>') || "no support"}</span></li>${triggeredRows(row, spirit)}`),
  },
  H1: {
    title: "H1 · Folded", spirit: "hollow",
    text: "A row folds its supports, one per line under it; a click opens or closes it. A row with something new is open at its level, the others closed.",
    list: (rows, level, spirit, key) => rowList(rows, row => {
      const id = `${key}-${row.name}`;
      const open = STATE.skillRowsOpen[id] ?? (row.isNew || row.newSupports.length > 0);
      const supports = open ? row.supports.map(gem => `<li class="app-sr-row app-sr-support">${rowMark(gem, spirit)}<span class="app-sr-name">${escapeHtml(gem.name)}</span>${rowNote(gem)}${gem.isNew ? NEW_WORD : ""}</li>`).join("") : "";
      return `<li class="app-sr-row app-sr-fold" data-action="skill-row-fold" data-row="${escapeHtml(id)}" data-open="${open}">${rowHead(row, spirit)}
        <span class="app-sr-right app-weak">${row.supports.length}<span class="app-sr-chevron ${open ? "is-open" : ""}">›</span></span></li>${supports}${triggeredRows(row, spirit)}`;
    }),
  },
  H2: {
    title: "H2 · Chips", spirit: "double",
    text: "The supports as small labels under the name, wrapping, their mark in each; a new one framed in the accent.",
    list: (rows, level, spirit) => rowList(rows, row => `<li class="app-sr-row app-sr-two"><span class="app-sr-line">${rowHead(row, spirit)}</span>
      <span class="app-sr-chips">${row.supports.map(gem => `<span class="app-sr-chip ${gem.isNew ? "is-new" : ""}">${rowMark(gem, spirit)}${escapeHtml(gem.name)}</span>`).join("")}</span></li>${triggeredRows(row, spirit)}`),
  },
  H3: {
    title: "H3 · Sockets", spirit: "core",
    text: "The supports as filled sockets at the right, a socket a ring with the mark in it, as a gem holds them in the game; a new one ringed in the accent.",
    list: (rows, level, spirit) => rowList(rows, row => `<li class="app-sr-row">${rowHead(row, spirit)}
      <span class="app-sr-right app-sr-sockets">${row.supports.map(gem => `<span class="app-sr-socket ${gem.isNew ? "is-new" : ""}" title="${escapeHtml(gem.name)}">${rowMark(gem, spirit)}</span>`).join("")}</span></li>${triggeredRows(row, spirit)}`),
  },
  E1: {
    title: "E1 · Wheels", spirit: "ring",
    text: "Each skill a tile: its mark in the middle, its supports around it like the stones of a ring, its name under it; three tiles a line. A new tile or stone in the accent.",
    list: (rows, level, spirit) => `<div class="app-sr-tiles">${rows.flatMap(row => [row, ...row.triggered.map(gem => ({ ...gem, supports: [], triggered: [], isTriggered: true }))]).map(row => {
      const stones = row.supports.map((gem, index) => {
        const angle = (index / Math.max(row.supports.length, 1)) * 2 * Math.PI - Math.PI / 2;
        return `<span class="app-sr-stone ${gem.isNew ? "is-new" : ""}" style="left:${(19 + 15 * Math.cos(angle)).toFixed(1)}px;top:${(19 + 15 * Math.sin(angle)).toFixed(1)}px" title="${escapeHtml(gem.name)}">${rowMark(gem, spirit)}</span>`;
      }).join("");
      return `<div class="app-sr-tile ${row.isNew ? "is-new" : ""}" title="${escapeHtml(supportNames(row))}"><span class="app-sr-wheel"><span class="app-sr-centre">${rowMark(row, spirit)}</span>${stones}</span>
        <span class="app-sr-tile-name">${row.isTriggered ? '<span class="app-weak">↳ </span>' : ""}${escapeHtml(row.name)}${rowNote(row)}</span></div>`;
    }).join("")}</div>`,
  },
  E2: {
    title: "E2 · Grid", spirit: "double",
    text: "A table: the name, then a cell per support in the order of the file, the skill a spirit gem triggers in its cell; a new cell lit in the accent. The names on hover.",
    list: (rows, level, spirit) => {
      const width = Math.max(...rows.map(row => row.gems.length), 1);
      return `<table class="app-sr-grid"><tbody>${rows.map(row => `<tr><th>${rowHead(row, spirit)}</th>${Array.from({ length: width }, (_, index) => {
        const gem = row.gems[index];
        return `<td class="${gem?.isNew ? "is-new" : ""}" ${gem ? `title="${escapeHtml(gem.name)}"` : ""}>${gem ? rowMark(gem, spirit) : ""}</td>`;
      }).join("")}</tr>`).join("")}</tbody></table>`;
    },
  },
  E3: {
    title: "E3 · Timeline", spirit: "hollow",
    text: "Each row draws its levels: a line from where the skill starts to 100, a tick where each support comes, the level a white line; what comes at the level in the accent. Read from marker to marker, it says what is coming.",
    list: (rows, level, spirit) => rowList(rows, row => `<li class="app-sr-row">${rowHead(row, spirit)}<span class="app-sr-right">${levelTrack(row, level)}</span></li>${triggeredRows(row, spirit, gem => `<span class="app-sr-right">${levelTrack({ ...gem, gems: [] }, level)}</span>`)}`),
  },
  F1: {
    title: "F1 · What is new spelled out", spirit: "core",
    text: "The rows quiet, with their count, until something comes: a line of the accent at their left, and what came written under them with the + of the window.",
    list: (rows, level, spirit) => rowList(rows, row => {
      const came = row.isNew ? [`with ${plural(row.supports.length, "support")}`] : row.newSupports.map(gem => `${rowMark(gem, spirit)}${escapeHtml(gem.name)}`);
      const lit = row.isNew || came.length > 0;
      return `<li class="app-sr-row app-sr-two ${lit ? "is-lit" : ""}"><span class="app-sr-line">${rowMark(row, spirit)}<span class="app-sr-name">${escapeHtml(row.name)}</span>${rowNote(row)}
        <span class="app-sr-right app-weak">${plural(row.supports.length, "support")}</span></span>
        ${lit ? `<span class="app-sr-came">${came.map(text => `<span><b class="is-added">+</b> ${text}</span>`).join("")}</span>` : ""}</li>${triggeredRows(row, spirit)}`;
    }),
  },
  F2: {
    title: "F2 · Lines of the window", spirit: "ring",
    text: "The rows in the language of the lines of « New at N » just above (W1): a column of signs, + in green for what comes, empty otherwise; the name in semi-bold, the count of the supports at the right. The column reads as one list.",
    list: (rows, level, spirit) => rowList(rows, row => {
      const sign = row.isNew || row.newSupports.length > 0;
      return `<li class="app-sr-row app-sr-window"><span class="app-sr-sign">${sign ? "+" : ""}</span>${rowMark(row, spirit)}<b class="app-sr-name">${escapeHtml(row.name)}</b>${rowNote(row)}
        <span class="app-sr-right app-weak">${row.newSupports.length > 0 && !row.isNew ? `<span class="app-sr-plus">+${row.newSupports.length}</span> · ` : ""}${plural(row.supports.length, "support")}</span></li>${triggeredRows(row, spirit)}`;
    }),
  },
  F3: {
    title: "F3 · Stacks", spirit: "double",
    text: "The supports stacked behind the mark of the skill, like gems set one on the other, their number at a glance without a word; « new » in the accent. Their names on hover.",
    list: (rows, level, spirit) => rowList(rows, row => `<li class="app-sr-row" title="${escapeHtml(supportNames(row))}"><span class="app-sr-stack" style="width:${12 + 5 * row.supports.length}px">${row.supports.map((gem, index) => `<span class="app-sr-stacked ${gem.isNew ? "is-new" : ""}" style="left:${5 * index}px">${rowMark(gem, spirit)}</span>`).join("")}<span class="app-sr-stacked" style="left:${5 * row.supports.length}px">${rowMark(row, spirit)}</span></span>
      <span class="app-sr-name">${escapeHtml(row.name)}</span>${rowNote(row)}${row.isNew || row.newSupports.length > 0 ? NEW_WORD : ""}</li>${triggeredRows(row, spirit)}`),
  },
};

// The skills of the column in a variant, under the title of the column.
const skillRowsOf = (id, level, key) => {
  const variant = SKILL_ROW_VARIANTS[id];
  const rows = rowsAt(level);
  return `<h2 class="app-side-title app-title">Skills · ${rows.length}</h2>${variant.list(rows, level, variant.spirit, key)}`;
};
