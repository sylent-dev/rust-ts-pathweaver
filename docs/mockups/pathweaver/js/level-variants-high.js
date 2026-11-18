// The level band at a high temperature (2g): bolder, the track telling more of the build.

// The chips of what changes, as small blocks: a gem in its colour, a hint of the gear outlined.
const lvChips = level => changeChips(level).map(chip => `<span class="lv-chip ${chip.weak ? "is-weak" : ""} ${chip.removed ? "is-removed" : ""}">${
  chip.colour ? `<i style="background:${gemColour(chip.colour)}"></i>` : chip.slot ? '<i class="is-slot"></i>' : ""}${escapeHtml(chip.text)}</span>`).join("");

addLevelVariant({ n: 6, temperature: "high", name: "Giant level",
  note: "the level in Archivo 800 at 64 px, ◀ and ▶ stacked as two half-height blocks beside it; what changes as chips, a gem in its colour, a hint of the gear outlined",
  render: context => {
    const width = 400;
    const x = levelX(context.level, width);
    return `<div class="lv lv6">
      <div class="lv6-now"><span class="lv6-label">Level</span><span class="lv6-number">${context.level}</span></div>
      <div class="lv6-steps">${lvStep("previous", context.previous, "lv6-block")}${lvStep("next", context.next, "lv6-block")}</div>
      <div class="lv-track lv6-track" data-action="level-track" style="width:${width}px">
        <span class="lv1-line"></span><span class="lv1-fill" style="width:${x}px"></span>
        ${lvTicks(context, width, "lv1-tick")}
        <span class="lv6-cursor" style="left:${x}px"></span>
        ${lvEnds(width)}
      </div>
      <div class="lv6-chips">${lvChips(context.level) || '<span class="app-weak">Nothing changes here</span>'}</div>
    </div>`;
  } });

addLevelVariant({ n: 7, temperature: "high", name: "Markers by kind",
  note: "each marker says what it brings: the gems over the line in their colours (a skill larger than a support), the gear under it outlined; the cursor a line the full height",
  render: context => {
    const width = 500;
    const glyphs = context.all.map(marker => {
      const parts = levelParts(marker);
      const x = levelX(marker, width);
      const passed = marker <= context.level ? "is-passed" : "";
      const gems = parts.gems.map((gem, index) => `<span class="lv7-gem ${gem.kind === "support" ? "is-support" : ""} ${passed}" style="left:${x}px;top:${32 - index * 9}px;background:${gemColour(gem.colour)}"></span>`).join("");
      const slots = parts.slots.map((slot, index) => `<span class="lv7-slot ${passed}" style="left:${x}px;top:${47 + index * 9}px"></span>`).join("");
      const removed = parts.removed > 0 ? `<span class="lv7-removed ${passed}" style="left:${x}px;top:${47 + parts.slots.length * 9}px"></span>` : "";
      return `<span class="lv7-hit" style="left:${x}px" title="${markerWords(marker)}"></span>${gems}${slots}${removed}`;
    }).join("");
    return `<div class="lv lv7">
      ${lvStep("previous", context.previous)}
      <div class="lv1-now"><span class="app-weak">Level</span><span class="lv1-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next)}
      <div class="lv-track lv7-track" data-action="level-track" style="width:${width}px">
        <span class="lv7-line"></span>${glyphs}
        <span class="lv7-cursor" style="left:${levelX(context.level, width)}px"></span>
      </div>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 8, temperature: "high", name: "Marker levels",
  note: "the markers written out as levels to click, evenly spaced, the one you are on lit; a thin track over them for every other level",
  render: context => {
    const width = 500;
    const levels = [...new Set([...context.all, context.level])].sort((a, b) => a - b);
    return `<div class="lv lv8">
      ${lvStep("previous", context.previous)}
      <div class="lv1-now"><span class="app-weak">Level</span><span class="lv1-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next)}
      <div class="lv8-middle" style="width:${width}px">
        <div class="lv-track lv8-track" data-action="level-track" style="width:${width}px">
          <span class="lv1-line"></span><span class="lv1-fill" style="width:${levelX(context.level, width)}px"></span>
          <span class="lv8-cursor" style="left:${levelX(context.level, width)}px"></span>
        </div>
        <div class="lv8-levels">${levels.map(level => `<button type="button" class="lv8-level app-number ${level === context.level ? "is-current" : level < context.level ? "is-passed" : ""}" data-action="level-go" data-level="${level}" title="${markerWords(level)}">${level}</button>`).join("")}</div>
      </div>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 9, temperature: "high", name: "Density",
  note: "over the track, the passives the build takes at each level, one bar per level; the markers under it; the bar of the level in the accent",
  render: context => {
    const width = 500;
    const bars = Array.from({ length: MAX_LEVEL }, (_, index) => index + 1).map(level => {
      const height = Math.min(34, changesAt(level).passives * 7);
      const state = level === context.level ? "is-current" : level < context.level ? "is-passed" : "";
      return `<span class="lv9-bar ${state}" style="left:${levelX(level, width) - 1}px;height:${Math.max(1, height)}px"></span>`;
    }).join("");
    return `<div class="lv lv9">
      ${lvStep("previous", context.previous)}
      <div class="lv1-now"><span class="app-weak">Level</span><span class="lv1-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next)}
      <div class="lv-track lv9-track" data-action="level-track" style="width:${width}px">
        ${bars}<span class="lv9-base"></span>
        ${lvTicks(context, width, "lv9-tick")}
        <span class="lv9-cursor" style="left:${levelX(context.level, width)}px"></span>
        <span class="lv9-end app-number" style="left:0">1</span><span class="lv9-end app-number" style="left:${width}px">${MAX_LEVEL}</span>
      </div>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 10, temperature: "high", name: "The band is the track",
  note: "the middle of the band is the track: lit up to the level, its edge the cursor, the level riding on it; ◀ and ▶ as blocks at its two ends",
  render: context => {
    const width = 590;
    const x = levelX(context.level, width);
    const numberLeft = x < 96;
    return `<div class="lv lv10">
      ${lvStep("previous", context.previous, "lv2-block")}
      <div class="lv-track lv10-track" data-action="level-track" style="width:${width}px">
        ${context.all.map(marker => `<span class="lv10-marker ${marker <= context.level ? "is-passed" : ""}" style="left:${levelX(marker, width)}px" title="${markerWords(marker)}"></span>`).join("")}
        <span class="lv10-fill" style="width:${x}px"></span>
        <span class="lv10-edge" style="left:${x}px"></span>
        <span class="lv10-now ${numberLeft ? "is-after" : ""}" style="${numberLeft ? `left:${x + 12}px` : `right:${width - x + 12}px`}"><span class="app-weak">Level</span><span class="lv10-number app-number">${context.level}</span></span>
      </div>
      ${lvStep("next", context.next, "lv2-block")}
      ${lvChanges(context, "lv10-changes")}
    </div>`;
  } });
