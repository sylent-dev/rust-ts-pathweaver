// The variants of the level band (2g, the owner, 2026-11-18): twenty, from a blank page, five at a
// normal temperature, five high, five explosive, five free. Each draws the band from the same
// rules (js/levels.js) and the same state, so that a click in one moves them all. The scripts of
// each temperature (js/level-variants-*.js) add theirs with addLevelVariant().

const LEVEL_VARIANTS = [];
// { n, temperature, name, note, render(context) → html }
const addLevelVariant = variant => LEVEL_VARIANTS.push(variant);

// The x of a level on a track of that width, on a whole pixel: a line of 1 px on a half pixel
// smears into two paler ones (the markers of today's band looked of two colours).
const levelX = (level, width) => Math.round(((level - 1) / (MAX_LEVEL - 1)) * width);

function levelContext() {
  const level = STATE.level;
  const all = markers();
  return {
    level, all,
    previous: all.filter(marker => marker < level).at(-1),
    next: all.find(marker => marker > level),
    lines: changeLines(level),
  };
}

// What a level brings: its gems with their colours, its gear, whether something stops, and a weight
// (the number of things that change, the passives aside) for the variants that size a marker by it.
function levelParts(level) {
  const changes = changesAt(level);
  const gems = [...changes.skills, ...changes.supports].map(gem => ({ name: gem.name, colour: gem.colour, kind: gem.kind }));
  const removed = changes.removed + changes.removedPassives;
  return { gems, slots: changes.slots, removed, passives: changes.passives,
    weight: gems.length + changes.slots.length + (removed > 0 ? 1 : 0) };
}

const GEM_COLOURS = { r: "var(--gem-str)", g: "var(--gem-dex)", b: "var(--gem-int)" };
const gemColour = colour => GEM_COLOURS[colour] ?? "var(--gem-none)";

// The tooltip of a marker: what changes there.
const markerWords = level => {
  const lines = changeLines(level);
  return `Level ${level}: ${lines.length > 0 ? lines.join(" · ") : "nothing changes"}`;
};

// ◀ or ▶, with the level it goes to; each variant lays it out with its own class.
const lvStep = (direction, target, extra = "") => `<button type="button" class="lv-step lv-step-${direction} ${extra}" data-action="level-go" data-level="${target ?? ""}" ${target === undefined ? "disabled" : ""} aria-label="${direction} marker">${icon(16, ICONS[direction])}<span class="app-number">${target ?? "–"}</span></button>`;

// « What changes at N » and its lines.
const lvChanges = (context, extra = "") => `<div class="lv-changes ${extra}">
    <span class="lv-changes-title">${context.lines.length > 0 ? "What changes at" : "Nothing changes at"} ${context.level}</span>
    ${context.lines.map(line => `<span class="lv-change">${line}</span>`).join("")}
  </div>`;

// The ratio of a click along a dial (js/level-variants-explosive.js): the angle from its centre,
// from the left (level 1) to the right (level 100) over the top.
ACTIONS["level-dial"] = (element, event) => {
  const box = element.getBoundingClientRect();
  const x = event.clientX - (box.left + box.width / 2);
  const y = box.top + box.height * Number(element.dataset.cy) - event.clientY;
  let angle = Math.atan2(y, x);
  if (angle < 0) angle = x < 0 ? Math.PI : 0;
  STATE.level = Math.round(1 + (1 - angle / Math.PI) * (MAX_LEVEL - 1));
  return true;
};
