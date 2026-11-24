// The hover of a passive (2i3, specs.md, Passive tree): its name and its stats from the game data, its
// state at the level, then the hint of the author with the markup of the game; a card beside the
// passive (B of three, the owner, 2026-11-20: a card that follows the pointer and a panel fixed under
// the legend set aside), see-through at 10 %, fading in and out (css/hover-card.css), in the
// construction of every card on hover (js/hover-card.js).

// The markup of the game in the author's texts (specs.md, The author's texts): `<tag>{text}`, nested;
// a tag is a font (r regular, b, i, u), a size (s small, m medium, l large), a named colour of the
// documentation of Grinding Gear Games or rgb(r, g, b). A tag it doesn't know, or a brace left open, stays plain text. Every text is escaped:
// the hints come from files of strangers.
// A size is a factor of the size of the text around the whole author's text (--markup-base, css/app.css),
// so that a size inside a size doesn't grow again.
const markupSize = factor => `font-size:calc(var(--markup-base) * var(--markup-${factor}))`;
const MARKUP_FONTS = {
  r: "font-weight:var(--text-weight);font-style:normal", b: "font-weight:700", i: "font-style:italic", u: "text-decoration:underline",
  s: markupSize("small"), m: markupSize("medium"), l: markupSize("large"),
};
// The named colours are tokens of the style (css/tokens.css, --markup-…): readable on its cards.
const MARKUP_COLOURS = {
  white: "white", grey: "grey", gray: "grey", black: "black", red: "red", orange: "orange", yellow: "yellow",
  green: "green", blue: "blue", indigo: "indigo", violet: "violet", bronze: "bronze", silver: "silver",
  gold: "gold", unique: "unique",
};
function styleOfTag(tag) {
  const name = tag.trim().toLowerCase();
  if (name in MARKUP_FONTS) return MARKUP_FONTS[name];
  if (name in MARKUP_COLOURS) return `color:var(--markup-${MARKUP_COLOURS[name]})`;
  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(name);
  return rgb && rgb.slice(1).every(n => Number(n) <= 255) ? `color:rgb(${rgb.slice(1).join(",")})` : null;
}

// Reads the text from `at` up to a closing brace (`inBraces`) or its end; returns [html, where it stopped].
function readMarkup(text, at, inBraces) {
  let html = "", plain = "";
  const flush = () => { html += escapeHtml(plain).replace(/\r?\n/g, "<br>"); plain = ""; };
  while (at < text.length) {
    const char = text[at];
    if (char === "}" && inBraces) break;
    const tag = char === "<" ? /^<([^<>{}]*)>\{/.exec(text.slice(at)) : null;
    const style = tag && styleOfTag(tag[1]);
    if (style === null || style === undefined) {
      plain += char;
      at += 1;
      continue;
    }
    const [inner, end] = readMarkup(text, at + tag[0].length, true);
    if (text[end] !== "}") {   // a brace left open: the tag stays as written
      plain += char;
      at += 1;
      continue;
    }
    flush();
    html += `<span style="${style}">${inner}</span>`;
    at = end + 1;
  }
  flush();
  return [html, at];
}
const markupHtml = text => `<span class="app-markup">${readMarkup(text, 0, false)[0]}</span>`;

// The passives near a point, found through a grid of cells of 400 units, built once per graph.
const HOVER_CELL = 400;
const GRIDS = new Map();
function gridOf(graph) {
  if (!GRIDS.has(graph)) {
    const grid = new Map();
    for (const [index, [x, y]] of graph.nodes.entries()) {
      const key = `${Math.floor(x / HOVER_CELL)},${Math.floor(y / HOVER_CELL)}`;
      grid.set(key, [...(grid.get(key) ?? []), index]);
    }
    GRIDS.set(graph, grid);
  }
  return GRIDS.get(graph);
}

// The passive under a point of the game, within its radius or 8 pixels of the screen: the ascendancy
// first, drawn over the tree. Returns { graph, index } or null.
function passiveAt(gameX, gameY, scale) {
  for (const graph of [TREE.ascendancy, TREE]) {
    const grid = gridOf(graph);
    const [cx, cy] = [Math.floor(gameX / HOVER_CELL), Math.floor(gameY / HOVER_CELL)];
    let best = null;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      for (const index of grid.get(`${cx + dx},${cy + dy}`) ?? []) {
        const [x, y, kind] = graph.nodes[index];
        const distance = Math.hypot(x - gameX, y - gameY);
        if (distance <= Math.max(NODE_RADIUS[TREE.kinds[kind]], 8 / scale) && (!best || distance < best.distance)) best = { graph, index, distance };
      }
    }
    if (best) return best;
  }
  return null;
}

const KIND_NAMES = { small: "Passive", notable: "Notable", keystone: "Keystone", jewel: "Jewel socket", attribute: "Attribute", start: "Class start" };
const SET_NAMES = { 1: "set I", 2: "set II" };

// The entry of the build for a passive at the level: the one that applies, else the next to come.
function entryAt(graph, index, level) {
  const entries = (graph === TREE ? TREE.taken : TREE.ascendancyTaken).filter(([i]) => i === index);
  return entries.find(([, low, high]) => appliesAt([low, high], level))
    ?? entries.filter(([, low]) => low > level).sort((a, b) => a[1] - b[1])[0] ?? null;
}

// A stat of the game names its keywords between brackets, `[Spell]` or `[Critical|Critical Hit]`: the
// words after the bar are those shown.
const statHtml = stat => escapeHtml(stat.replace(/\[(?:[^\]|]*\|)?([^\]]*)\]/g, "$1")).replace(/\r?\n/g, "<br>");

// The card of a passive (2i3; 2k, the owner, 2026-11-20: the construction of every card on hover,
// js/hover-card.js): its name, its kind as its subtitle, without art (the owner, 2026-11-21: its icon is
// right beside the card, on the tree); its stats, its state at the level and its weapon set; the hint of
// the author.
function hoverHtml(graph, index, level) {
  const [name, stats] = graph.info[index];
  const kind = TREE.kinds[graph.nodes[index][2]];
  const entry = entryAt(graph, index, level);
  const state = !entry ? "Not taken"
    : appliesAt([entry[1], entry[2]], level) ? `Taken at level ${entry[1]}` : `Taken later, at level ${entry[1]}`;
  const set = entry && SET_NAMES[entry[3]] ? ` · ${SET_NAMES[entry[3]]}` : "";
  return hoverCardHtml({
    title: escapeHtml(TREE.texts[name]),
    subtitle: graph === TREE ? KIND_NAMES[kind] : `Ascendancy · ${KIND_NAMES[kind]}`,
    body: `${stats.length ? `<ul class="app-hover-stats">${stats.map(stat => `<li>${statHtml(TREE.texts[stat])}</li>`).join("")}</ul>` : ""}
      <div class="app-hover-state">${state}${set}</div>`,
    note: entry && entry[4] >= 0 ? markupHtml(TREE.texts[entry[4]]) : "",
  });
}

// Places the card beside the passive, on the side of the tree with more room, centred on it but kept
// inside the tree.
function placeHover(card, panel, passive, radius) {
  const [width, height] = [panel.clientWidth, panel.clientHeight];
  const [w, h] = [card.offsetWidth, card.offsetHeight];
  const right = passive[0] < width / 2;
  card.style.left = `${right ? passive[0] + radius + 12 : passive[0] - radius - 12 - w}px`;
  card.style.top = `${Math.max(8, Math.min(height - h - 8, passive[1] - h / 2))}px`;
}

function mountHover() {
  for (const canvas of document.querySelectorAll('canvas[data-tree="main"]')) {
    const panel = canvas.parentElement, card = panel.querySelector(".app-hover");
    // Hidden, the card keeps its words and its place while it fades out. Off a passive, it waits for the
    // pointer to reach it (cardCloser, js/hover-card.js); a drag hides it at once.
    const { cancel, closeSoon } = cardCloser(card);
    canvas.onmousemove = event => {
      const view = viewOf(canvas);
      if (event.buttons !== 0 || !view) return card.classList.remove("is-shown");
      const [width, height] = [canvas.clientWidth, canvas.clientHeight];
      const gameX = (event.offsetX - width / 2) / view.scale + view.x, gameY = (event.offsetY - height / 2) / view.scale + view.y;
      const found = passiveAt(gameX, gameY, view.scale);
      canvas.style.cursor = found ? "pointer" : "";
      if (!found) return closeSoon();
      cancel();
      const [x, y, kind] = found.graph.nodes[found.index];
      card.innerHTML = hoverHtml(found.graph, found.index, STATE.level);
      titleIfCut(card);
      card.classList.add("is-shown");
      const passive = [(x - view.x) * view.scale + width / 2, (y - view.y) * view.scale + height / 2];
      placeHover(card, panel, passive, NODE_RADIUS[TREE.kinds[kind]] * view.scale);
    };
    canvas.onmouseleave = closeSoon;
  }
}
AFTER_RENDER.push(mountHover);
// A turn of the wheel moves the tree under the card: it goes.
document.addEventListener("wheel", () => {
  for (const card of document.querySelectorAll(".app-hover")) card.classList.remove("is-shown");
}, { capture: true, passive: true });
