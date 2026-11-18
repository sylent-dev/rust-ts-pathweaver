// The level band at an explosive temperature (2g): the band rebuilt around one idea each.

const LEVELS = Array.from({ length: MAX_LEVEL }, (_, index) => index + 1);

addLevelVariant({ n: 11, temperature: "explosive", name: "A hundred columns",
  note: "the whole band is the track, one column per level to click, the markers capped, the level in a watermark behind; what changes written over it",
  render: context => {
    const marked = new Set(context.all);
    return `<div class="lv lv11">
      ${lvStep("previous", context.previous, "lv11-block")}
      <div class="lv11-columns">
        <span class="lv11-watermark" aria-hidden="true">${context.level}</span>
        ${LEVELS.map(level => `<button type="button" class="lv11-column ${level === context.level ? "is-current" : level < context.level ? "is-passed" : ""} ${marked.has(level) ? "is-marker" : ""}" data-action="level-go" data-level="${level}" title="${marked.has(level) ? markerWords(level) : `Level ${level}`}"></button>`).join("")}
        <span class="lv11-changes"><b>${context.level}</b>${context.lines.length > 0 ? context.lines.join(" · ") : "nothing changes"}</span>
      </div>
      ${lvStep("next", context.next, "lv11-block")}
    </div>`;
  } });

// A point of the dial, the level 1 on the left, 100 on the right, over the top.
const dialPoint = (level, radius, cx, cy) => {
  const angle = Math.PI * (1 - (level - 1) / (MAX_LEVEL - 1));
  return [cx + radius * Math.cos(angle), cy - radius * Math.sin(angle)];
};

addLevelVariant({ n: 12, temperature: "explosive", name: "Dial",
  note: "the level on a half dial, filled up to it, a needle at its edge, the markers around its edge, a click on the arc goes there; what changes takes the rest of the band, larger",
  render: context => {
    const [cx, cy, r] = [92, 78, 64];
    const [sx, sy] = dialPoint(1, r, cx, cy);
    const [lx, ly] = dialPoint(context.level, r, cx, cy);
    const [ex, ey] = dialPoint(MAX_LEVEL, r, cx, cy);
    const [nx, ny] = dialPoint(context.level, r - 14, cx, cy);
    const [mx, my] = dialPoint(context.level, r - 30, cx, cy);
    const ticks = context.all.map(marker => {
      const [x1, y1] = dialPoint(marker, r + 5, cx, cy);
      const [x2, y2] = dialPoint(marker, r + 11, cx, cy);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${marker <= context.level ? "is-passed" : ""}"><title>${markerWords(marker)}</title></line>`;
    }).join("");
    return `<div class="lv lv12">
      ${lvStep("previous", context.previous, "lv2-block")}
      <svg class="lv12-dial" width="184" height="84" viewBox="0 0 184 84" data-action="level-dial" data-cy="${cy / 84}">
        <path class="lv12-arc" d="M${sx} ${sy}A${r} ${r} 0 0 1 ${ex} ${ey}"/>
        <path class="lv12-fill" d="M${sx} ${sy}A${r} ${r} 0 0 1 ${lx.toFixed(1)} ${ly.toFixed(1)}"/>
        <g class="lv12-ticks">${ticks}</g>
        <line class="lv12-needle" x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}"/>
        <text class="lv12-number" x="${cx}" y="${cy - 4}" text-anchor="middle">${context.level}</text>
      </svg>
      ${lvStep("next", context.next, "lv2-block")}
      ${lvChanges(context, "lv12-changes")}
    </div>`;
  } });

addLevelVariant({ n: 13, temperature: "explosive", name: "Cards",
  note: "a card per marker, its level and what it brings in small squares; the card of the level opens and says what changes, so the track and the list are one",
  render: context => {
    const levels = [...new Set([...context.all, context.level])].sort((a, b) => a - b);
    const card = level => {
      const parts = levelParts(level);
      const glyphs = [...parts.gems.map(gem => `<i style="background:${gemColour(gem.colour)}"></i>`), ...parts.slots.map(() => '<i class="is-slot"></i>')].join("");
      if (level === context.level) {
        return `<div class="lv13-card is-current"><span class="lv13-head"><span class="app-weak">Level</span> <b class="app-number">${level}</b></span>${
          context.lines.length > 0 ? context.lines.map(line => `<span class="lv-change">${line}</span>`).join("") : '<span class="app-weak">Nothing changes here</span>'}</div>`;
      }
      return `<button type="button" class="lv13-card ${level < context.level ? "is-passed" : ""}" data-action="level-go" data-level="${level}" title="${markerWords(level)}"><b class="app-number">${level}</b><span class="lv13-glyphs">${glyphs}</span></button>`;
    };
    return `<div class="lv lv13">
      ${lvStep("previous", context.previous, "lv13-block")}
      <div class="lv13-cards">${levels.map(card).join("")}</div>
      ${lvStep("next", context.next, "lv13-block")}
    </div>`;
  } });

addLevelVariant({ n: 14, temperature: "explosive", name: "Terminal",
  note: "the band as a line of a terminal, in the monospaced font: the track a hundred characters, one per level to click, the markers ╋, the level a block",
  render: context => {
    const marked = new Set(context.all);
    const char = level => level === context.level ? "█" : marked.has(level) ? (level < context.level ? "┿" : "╋") : level < context.level ? "━" : "─";
    const pad = level => String(level).padStart(3, "0");
    return `<div class="lv lv14">
      <div class="lv14-row">
        <button type="button" class="lv14-step" data-action="level-go" data-level="${context.previous ?? ""}" ${context.previous === undefined ? "disabled" : ""}>[◂ ${context.previous === undefined ? "---" : pad(context.previous)}]</button>
        <span class="lv14-now">lvl <b>${pad(context.level)}</b><span class="lv14-caret">▌</span></span>
        <button type="button" class="lv14-step" data-action="level-go" data-level="${context.next ?? ""}" ${context.next === undefined ? "disabled" : ""}>[${context.next === undefined ? "---" : pad(context.next)} ▸]</button>
        <span class="lv14-changes">${context.lines.length > 0 ? context.lines.join("  ") : "# nothing changes"}</span>
      </div>
      <div class="lv14-row lv14-track"><span class="app-weak">001 </span>${LEVELS.map(level => `<button type="button" class="lv14-char ${level === context.level ? "is-current" : marked.has(level) ? "is-marker" : ""} ${level < context.level ? "is-passed" : ""}" data-action="level-go" data-level="${level}" title="${marked.has(level) ? markerWords(level) : `Level ${level}`}">${char(level)}</button>`).join("")}<span class="app-weak"> 100</span></div>
    </div>`;
  } });

addLevelVariant({ n: 15, temperature: "explosive", name: "The climb",
  note: "the track as the profile of a climb: it rises with each passive, gem and hint the build gathers, steep where the build changes fast; the markers dots on it",
  render: context => {
    const [width, height] = [500, 84];
    let total = 0;
    const totals = LEVELS.map(level => {
      const parts = levelParts(level);
      total += parts.passives + parts.gems.length + parts.slots.length;
      return total;
    });
    const y = level => (72 - (totals[level - 1] / total) * 60).toFixed(1);
    const points = LEVELS.map(level => `${levelX(level, width)},${y(level)}`).join(" ");
    const x = levelX(context.level, width);
    return `<div class="lv lv15">
      ${lvStep("previous", context.previous)}
      <div class="lv1-now"><span class="app-weak">Level</span><span class="lv1-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next)}
      <svg class="lv-track lv15-track" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" data-action="level-track">
        <defs><clipPath id="lv15-passed"><rect x="0" y="0" width="${x}" height="${height}"/></clipPath></defs>
        <polygon class="lv15-area" points="0,${height} ${points} ${width},${height}" clip-path="url(#lv15-passed)"/>
        <polyline class="lv15-path" points="${points}"/>
        <polyline class="lv15-path is-passed" points="${points}" clip-path="url(#lv15-passed)"/>
        ${context.all.map(marker => `<circle class="lv15-dot ${marker <= context.level ? "is-passed" : ""}" cx="${levelX(marker, width)}" cy="${y(marker)}" r="2.5"><title>${markerWords(marker)}</title></circle>`).join("")}
        <line class="lv15-cursor" x1="${x}" y1="0" x2="${x}" y2="${height}"/>
        <rect class="lv15-head" x="${x - 5}" y="${Number(y(context.level)) - 5}" width="10" height="10"/>
      </svg>
      ${lvChanges(context, "lv15-changes")}
    </div>`;
  } });
