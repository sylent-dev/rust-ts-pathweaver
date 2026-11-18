// Where « N changes at N » goes in the band of L6 (2g, the owner, 2026-11-18: « a bit alone » on
// the right): nine places, 21 to 29, the temperature rising, the track the whole length of the
// band wherever it can. Each band keeps the level, ◀ ▶ and the track of L6; its window of what
// changes opens under what opened it.

const LEVEL_CHANGE_VARIANTS = [];
const addChangeVariant = variant => LEVEL_CHANGE_VARIANTS.push(variant);   // { n, temperature, name, note, render }

// The parts of L6: the level, the arrows, the track (from x = 220 in the band).
const l6Now = (level, extra = "") => `<div class="lv6-now"><span class="lv6-label">Level</span><span class="lv6-number">${level}</span>${extra}</div>`;
const l6Steps = context => `<div class="lv6-steps">${lvStep("previous", context.previous, "lv6-block")}${lvStep("next", context.next, "lv6-block")}</div>`;
const l6Track = (context, width, extra = "", ends = true) => `<div class="lv-track lv6-track lvx-track" data-action="level-track" style="width:${width}px">${lvBarTrack(context, width)}${ends ? lvEnds(width) : ""}${extra}</div>`;
const TRACK_LEFT = 220;
const BAND_WIDTH = 960;
const WINDOW_WIDTH = 360;

// The changes at the level of the build shown, and its window when it is open, placed at `left`
// (its left edge in the band) or on the right margin of the band.
const changesHere = level => BUILDS.changes.shown.levels[level];
function lvxWindow(level, left) {
  const record = changesHere(level);
  if (!STATE.changesOpen || !record) return "";
  const style = left === undefined ? "" : `left:${Math.round(Math.min(Math.max(0, left), BAND_WIDTH - WINDOW_WIDTH))}px;right:auto`;
  return changesWindow(record, level, { opening: STATE.changesOpening, style });
}
// The window centred under a point of the track.
const underTrack = (context, width) => TRACK_LEFT + levelX(context.level, width) - WINDOW_WIDTH / 2;
const changesButton = (level, text, extra = "") => {
  const record = changesHere(level);
  return record
    ? `<button type="button" class="lvx-link ${extra} ${STATE.changesOpen ? "is-open" : ""}" data-action="changes-toggle" aria-expanded="${STATE.changesOpen}" title="${plural(record.count, "change")} at ${level}">${text(record.count)}</button>`
    : `<span class="lvx-none ${extra}">No change</span>`;
};

addChangeVariant({ n: 21, temperature: "normal", name: "Under the level",
  note: "« 3 changes » under the level, in its box, the three read together; the track the whole length of the band",
  render: context => {
    const width = BAND_WIDTH - 18 - TRACK_LEFT;
    return `<div class="lv lv6 lvx lvx21">
      ${l6Now(context.level, changesButton(context.level, count => plural(count, "change")))}
      ${l6Steps(context)}${l6Track(context, width)}
      ${lvxWindow(context.level, 0)}
    </div>`;
  } });

addChangeVariant({ n: 22, temperature: "normal", name: "Over the end of the track",
  note: "the link over the end of the track, on the D of Download .build, the track under it the whole length of the band",
  render: context => {
    const width = BAND_WIDTH - 18 - TRACK_LEFT;
    return `<div class="lv lv6 lvx lvx22">
      ${l6Now(context.level)}${l6Steps(context)}${l6Track(context, width)}
      ${changesButton(context.level, count => `${plural(count, "change")} at ${context.level}`, "lvx22-link")}
      ${lvxWindow(context.level)}
    </div>`;
  } });

addChangeVariant({ n: 23, temperature: "normal", name: "Riding the cursor",
  note: "« 3 changes » over the cursor, moving with it: what changes is said where the level is",
  render: context => {
    const width = BAND_WIDTH - 18 - TRACK_LEFT;
    const x = Math.min(Math.max(levelX(context.level, width), 34), width - 34);
    return `<div class="lv lv6 lvx lvx23">
      ${l6Now(context.level)}${l6Steps(context)}
      ${l6Track(context, width, changesButton(context.level, count => plural(count, "change"), "lvx23-link").replace(/class="/, `style="left:${x}px" class="`))}
      ${lvxWindow(context.level, underTrack(context, width))}
    </div>`;
  } });

addChangeVariant({ n: 24, temperature: "high", name: "A box of its own",
  note: "the band ends as it starts: « Changes » over their number, in the type of the level, in the accent; the track between the two",
  render: context => {
    const width = BAND_WIDTH - 110 - 26 - TRACK_LEFT;
    const record = changesHere(context.level);
    const box = record
      ? `<button type="button" class="lvx24-box ${STATE.changesOpen ? "is-open" : ""}" data-action="changes-toggle" aria-expanded="${STATE.changesOpen}" title="${plural(record.count, "change")} at ${context.level}"><span class="lv6-label">Changes</span><span class="lvx24-number">${record.count}</span></button>`
      : `<div class="lvx24-box is-none"><span class="lv6-label">Changes</span><span class="lvx24-number">0</span></div>`;
    return `<div class="lv lv6 lvx lvx24">
      ${l6Now(context.level)}${l6Steps(context)}${l6Track(context, width)}${box}
      ${lvxWindow(context.level)}
    </div>`;
  } });

addChangeVariant({ n: 25, temperature: "high", name: "Before, here, after",
  note: "the column of the arrows in three: ◀ the marker before, « 3 changes » here, ▶ the marker after; the line of the track leaves from « here »",
  render: context => {
    const width = BAND_WIDTH - 18 - 234;
    return `<div class="lv lv6 lvx lvx25">
      ${l6Now(context.level)}
      <div class="lv6-steps lvx25-steps">${lvStep("previous", context.previous, "lv6-block")}${changesButton(context.level, count => plural(count, "change"), "lv6-block lvx25-here")}${lvStep("next", context.next, "lv6-block")}</div>
      ${l6Track(context, width)}
      ${lvxWindow(context.level, 124)}
    </div>`;
  } });

addChangeVariant({ n: 26, temperature: "high", name: "The cursor says it",
  note: "the cursor becomes a white tab with the number of changes in it, a click on it opens them; a plain bar where nothing changes",
  render: context => {
    const width = BAND_WIDTH - 18 - TRACK_LEFT;
    const record = changesHere(context.level);
    const tab = record ? `<button type="button" class="lvx26-tab" style="left:${levelX(context.level, width)}px" data-action="changes-toggle" aria-expanded="${STATE.changesOpen}" title="${plural(record.count, "change")} at ${context.level}">${record.count}</button>` : "";
    return `<div class="lv lv6 lvx lvx26 ${record ? "has-tab" : ""}">
      ${l6Now(context.level)}${l6Steps(context)}${l6Track(context, width, tab)}
      ${lvxWindow(context.level, underTrack(context, width))}
    </div>`;
  } });

addChangeVariant({ n: 27, temperature: "explosive", name: "Every marker counted",
  note: "the number of changes over every marker, a click on one goes there and opens them; the level's in the accent, larger",
  render: context => {
    const width = BAND_WIDTH - 18 - TRACK_LEFT;
    const levels = [...new Set([...context.all, context.level])].filter(changesHere).sort((a, b) => a - b);
    let lastX = -99, row = 0;
    const counts = levels.map(level => {
      const x = levelX(level, width);
      row = x - lastX < 14 ? 1 - row : 0;
      lastX = x;
      return `<button type="button" class="lvx27-count ${level === context.level ? "is-current" : ""} ${row ? "is-up" : ""}" style="left:${x}px" data-action="level-open" data-level="${level}" title="${markerWords(level)}">${changesHere(level).count}</button>`;
    }).join("");
    return `<div class="lv lv6 lvx lvx27">
      ${l6Now(context.level)}${l6Steps(context)}${l6Track(context, width, counts)}
      ${lvxWindow(context.level, underTrack(context, width))}
    </div>`;
  } });

addChangeVariant({ n: 28, temperature: "explosive", name: "A badge on the level",
  note: "the number of changes as a badge on the corner of the level, the whole box a button that opens them",
  render: context => {
    const width = BAND_WIDTH - 18 - TRACK_LEFT;
    const record = changesHere(context.level);
    const now = record
      ? `<button type="button" class="lv6-now lvx28-now" data-action="changes-toggle" aria-expanded="${STATE.changesOpen}" title="${plural(record.count, "change")} at ${context.level}"><span class="lv6-label">Level</span><span class="lv6-number">${context.level}</span><span class="lvx28-badge">${record.count}</span></button>`
      : l6Now(context.level);
    return `<div class="lv lv6 lvx lvx28">
      ${now}${l6Steps(context)}${l6Track(context, width)}
      ${lvxWindow(context.level, 0)}
    </div>`;
  } });

addChangeVariant({ n: 29, temperature: "explosive", name: "Changes in stacks",
  note: "under each marker a stack of squares, one per change, the level's in the accent and named; a click on the name opens them",
  render: context => {
    const width = BAND_WIDTH - 18 - TRACK_LEFT;
    const levels = [...new Set([...context.all, context.level])].filter(changesHere);
    const stacks = levels.map(level => {
      const count = changesHere(level).count;
      const squares = Array.from({ length: Math.min(count, 6) }, (_, index) => `<i style="top:${index * 5}px"></i>`).join("");
      return `<span class="lvx29-stack ${level === context.level ? "is-current" : level < context.level ? "is-passed" : ""}" style="left:${levelX(level, width)}px" title="${markerWords(level)}">${squares}${count > 6 ? '<b style="top:30px">+</b>' : ""}</span>`;
    }).join("");
    const x = Math.min(Math.max(levelX(context.level, width) + 8, 0), width - 80);
    const name = changesHere(context.level) ? changesButton(context.level, count => plural(count, "change"), "lvx29-link").replace(/class="/, `style="left:${x}px" class="`) : "";
    return `<div class="lv lv6 lvx lvx29">
      ${l6Now(context.level)}${l6Steps(context)}${l6Track(context, width, stacks + name, false)}
      ${lvxWindow(context.level, underTrack(context, width))}
    </div>`;
  } });
