// The level band at a normal temperature (2g): the same three parts, in the language of the header
// and of the bands above (square corners, full height, contrast rather than borders).

// The ticks of the markers on a track of that width, passed or to come.
const lvTicks = (context, width, className) => context.all.map(marker =>
  `<span class="${className} ${marker <= context.level ? "is-passed" : ""}" style="left:${levelX(marker, width)}px" title="${markerWords(marker)}"></span>`).join("");
const lvEnds = width => `<span class="lv-end app-number" style="left:0">1</span><span class="lv-end app-number" style="left:${width}px">${MAX_LEVEL}</span>`;

// The track cut at each marker into stretches: those passed, the one of the level (lit), those to
// come; the cursor a bar at the level (4).
function lvStretches(context, width) {
  const bounds = [1, ...context.all.filter(marker => marker > 1), MAX_LEVEL + 1];
  return bounds.slice(0, -1).map((start, index) => {
    const end = bounds[index + 1];
    const left = levelX(start, width);
    const right = end > MAX_LEVEL ? width : levelX(end, width);
    const state = context.level >= end ? "is-passed" : context.level >= start ? "is-current" : "";
    return `<span class="lv4-stretch ${state}" style="left:${left}px;width:${Math.max(1, right - left - 2)}px" title="${markerWords(start)}"></span>`;
  }).join("") + `<span class="lv4-cursor" style="left:${levelX(context.level, width)}px"></span>`;
}

// The track of 2: a thin line, the markers in grey, the cursor a bar (2 and 6).
const lvBarTrack = (context, width) => `<span class="lv2-line"></span>${lvTicks(context, width, "lv2-tick")}<span class="lv2-cursor" style="left:${levelX(context.level, width)}px"></span>`;

addLevelVariant({ n: 1, temperature: "normal", name: "Square cursor",
  note: "today's band in the language of the header: a square cursor, the track filled up to it in the accent, the ticks on whole pixels",
  render: context => {
    const width = 460;
    const x = levelX(context.level, width);
    return `<div class="lv lv1">
      ${lvStep("previous", context.previous)}
      <div class="lv1-now"><span class="app-weak">Level</span><span class="lv1-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next)}
      <div class="lv-track lv1-track" data-action="level-track" style="width:${width}px">
        <span class="lv1-line"></span><span class="lv1-fill" style="width:${x}px"></span>
        ${lvTicks(context, width, "lv1-tick")}
        <span class="lv1-cursor" style="left:${x}px"></span>
        ${lvEnds(width)}
      </div>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 2, temperature: "normal", name: "Arrow blocks",
  note: "◀ and ▶ as blocks the full height of the band, like the + of the band of the builds, the level they go to inside; the cursor a bar",
  render: context => {
    const width = 450;
    return `<div class="lv lv2">
      ${lvStep("previous", context.previous, "lv2-block")}
      <div class="lv2-now"><span class="app-weak">Level</span><span class="lv2-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next, "lv2-block")}
      <div class="lv-track lv2-track" data-action="level-track" style="width:${width}px">
        ${lvBarTrack(context, width)}
        ${lvEnds(width)}
      </div>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 3, temperature: "normal", name: "Ruler",
  note: "the track as a ruler, a tick at every level and a number every ten; the markers rise over it, the cursor a line the full height of the band",
  render: context => {
    const width = 480;
    const ruler = Array.from({ length: MAX_LEVEL }, (_, index) => index + 1).map(level =>
      `<span class="lv3-unit ${level % 10 === 0 ? "is-ten" : ""}" style="left:${levelX(level, width)}px"></span>${level % 10 === 0 && level < MAX_LEVEL ? `<span class="lv3-label app-number" style="left:${levelX(level, width)}px">${level}</span>` : ""}`).join("");
    return `<div class="lv lv3">
      <div class="lv3-head">
        ${lvStep("previous", context.previous)}
        <span class="lv3-number app-number">${context.level}</span>
        ${lvStep("next", context.next)}
      </div>
      <div class="lv-track lv3-track" data-action="level-track" style="width:${width}px">
        <span class="lv3-base"></span>${ruler}
        ${lvTicks(context, width, "lv3-tick")}
        <span class="lv3-cursor" style="left:${levelX(context.level, width)}px"></span>
      </div>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 4, temperature: "normal", name: "Stretches",
  note: "the track cut at each marker into stretches of the build: those passed, the one you are in (lit), those to come",
  render: context => {
    const width = 470;
    return `<div class="lv lv4">
      ${lvStep("previous", context.previous)}
      <div class="lv1-now"><span class="app-weak">Level</span><span class="lv1-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next)}
      <div class="lv-track lv4-track" data-action="level-track" style="width:${width}px">
        ${lvStretches(context, width)}
        ${lvEnds(width)}
      </div>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 5, temperature: "normal", name: "Two rows",
  note: "the track the whole width of the band on top, twice as precise; under it the level, its arrows and what changes, on one line",
  render: context => {
    const width = 916;
    return `<div class="lv lv5">
      <div class="lv-track lv5-track" data-action="level-track" style="width:${width}px">
        <span class="lv1-line"></span><span class="lv1-fill" style="width:${levelX(context.level, width)}px"></span>
        ${lvTicks(context, width, "lv1-tick")}
        <span class="lv1-cursor" style="left:${levelX(context.level, width)}px"></span>
      </div>
      <div class="lv5-row">
        ${lvStep("previous", context.previous)}
        <span class="lv5-now"><span class="app-weak">Level</span> <span class="lv5-number app-number">${context.level}</span></span>
        ${lvStep("next", context.next)}
        <span class="lv5-changes"><span class="app-weak">${context.lines.length > 0 ? "What changes" : "Nothing changes"}</span> ${context.lines.join('<span class="app-weak"> · </span>')}</span>
      </div>
    </div>`;
  } });
