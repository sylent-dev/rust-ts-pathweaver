// The level band, free (2g): five explorations around the name and the world of Pathweaver.

// The bounds of the stretches of the build: level 1, each marker, level 100.
const lvBounds = context => [...new Set([1, ...context.all, MAX_LEVEL])];

addLevelVariant({ n: 16, temperature: "free", name: "Weave",
  note: "Pathweaver taken at its word: two threads woven along the track, crossing at each marker; behind the needle they take their colours, ahead they wait in grey",
  render: context => {
    const [width, height, middle] = [500, 64, 32];
    const bounds = lvBounds(context);
    const thread = sign => `M0 ${middle}` + bounds.slice(1).map((end, index) => {
      const [x0, x1] = [levelX(bounds[index], width), levelX(end, width)];
      const offset = sign * (index % 2 === 0 ? 1 : -1) * Math.min(22, 6 + (x1 - x0) * 0.4);
      return `C${x0 + (x1 - x0) / 2} ${middle + offset} ${x0 + (x1 - x0) / 2} ${middle + offset} ${x1} ${middle}`;
    }).join("");
    const x = levelX(context.level, width);
    return `<div class="lv lv16">
      ${lvStep("previous", context.previous)}
      <div class="lv1-now"><span class="app-weak">Level</span><span class="lv1-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next)}
      <svg class="lv-track lv16-track" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" data-action="level-track">
        <defs><clipPath id="lv16-passed"><rect x="0" y="0" width="${x}" height="${height}"/></clipPath></defs>
        <path class="lv16-thread" d="${thread(1)}"/><path class="lv16-thread" d="${thread(-1)}"/>
        <g clip-path="url(#lv16-passed)"><path class="lv16-thread is-a" d="${thread(1)}"/><path class="lv16-thread is-b" d="${thread(-1)}"/></g>
        ${context.all.map(marker => `<rect class="lv16-knot" x="${levelX(marker, width) - 2}" y="${middle - 2}" width="4" height="4"><title>${markerWords(marker)}</title></rect>`).join("")}
        <line class="lv16-needle" x1="${x}" y1="10" x2="${x}" y2="${height - 2}"/>
        <rect class="lv16-eye" x="${x - 2.5}" y="2" width="5" height="10"/>
      </svg>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 17, temperature: "free", name: "A branch of the tree",
  note: "the track drawn as a branch of the passive tree: each marker a node, larger when it brings more, a square for the gear; the edges taken lit like the tree's, the level ringed",
  render: context => {
    const [width, height, middle] = [500, 70, 35];
    const bounds = lvBounds(context);
    const nodeY = index => (index === 0 || index === bounds.length - 1 ? middle : middle + (index % 2 === 0 ? 11 : -11));
    const nodes = bounds.map((level, index) => ({ level, x: levelX(level, width), y: nodeY(index), parts: levelParts(level) }));
    const edges = nodes.slice(1).map((node, index) => {
      const from = nodes[index];
      return `<line class="lv17-edge ${node.level <= context.level ? "is-taken" : ""}" x1="${from.x}" y1="${from.y}" x2="${node.x}" y2="${node.y}"/>`;
    }).join("");
    // The level between two nodes: its point on the edge between them.
    const after = nodes.findIndex(node => node.level >= context.level);
    const [a, b] = [nodes[Math.max(0, after - 1)], nodes[after]];
    const t = b.level === a.level ? 1 : (context.level - a.level) / (b.level - a.level);
    const [rx, ry] = [a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t];
    const partial = context.level > a.level && context.level < b.level ? `<line class="lv17-edge is-taken" x1="${a.x}" y1="${a.y}" x2="${rx.toFixed(1)}" y2="${ry.toFixed(1)}"/>` : "";
    const shape = node => {
      const size = Math.min(7, 3 + node.parts.weight);
      const state = node.level <= context.level ? "is-taken" : "";
      return node.parts.slots.length > 0
        ? `<rect class="lv17-node ${state}" x="${node.x - size}" y="${node.y - size}" width="${size * 2}" height="${size * 2}" transform="rotate(45 ${node.x} ${node.y})"><title>${markerWords(node.level)}</title></rect>`
        : `<circle class="lv17-node ${state}" cx="${node.x}" cy="${node.y}" r="${size}"><title>${markerWords(node.level)}</title></circle>`;
    };
    return `<div class="lv lv17">
      ${lvStep("previous", context.previous)}
      <div class="lv1-now"><span class="app-weak">Level</span><span class="lv1-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next)}
      <svg class="lv-track lv17-track" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" data-action="level-track">
        ${edges}${partial}${nodes.map(shape).join("")}
        <circle class="lv17-ring" cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="11"/>
      </svg>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 18, temperature: "free", name: "Drum",
  note: "the level on a drum that turns from marker to marker: the two before above, the two after below, each to click; the drum takes the place of ◀ and ▶",
  render: context => {
    const before = context.all.filter(marker => marker < context.level).slice(-2);
    const after = context.all.filter(marker => marker > context.level).slice(0, 2);
    const entry = (level, distance) => `<button type="button" class="lv18-entry is-${distance}" data-action="level-go" data-level="${level}" title="${markerWords(level)}">${level}</button>`;
    const width = 520;
    return `<div class="lv lv18">
      <div class="lv18-drum app-number">
        <div class="lv18-side">${before.length < 2 ? '<span class="lv18-entry is-far"></span>' : ""}${before.length < 1 ? '<span class="lv18-entry is-near"></span>' : ""}${before.map((level, index) => entry(level, before.length - index === 2 ? "far" : "near")).join("")}</div>
        <div class="lv18-now">${context.level}</div>
        <div class="lv18-side">${after.map((level, index) => entry(level, index === 0 ? "near" : "far")).join("")}</div>
      </div>
      <span class="lv18-label">Level</span>
      <div class="lv-track lv1-track lv18-track" data-action="level-track" style="width:${width}px">
        <span class="lv1-line"></span><span class="lv1-fill" style="width:${levelX(context.level, width)}px"></span>
        ${lvTicks(context, width, "lv1-tick")}
        <span class="lv1-cursor" style="left:${levelX(context.level, width)}px"></span>
        ${lvEnds(width)}
      </div>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 19, temperature: "free", name: "Pulse",
  note: "the track as the trace of a heart: flat, with a beat at each marker, taller when more changes; the level a point that beats, its trace lit behind it",
  render: context => {
    const [width, height, base] = [520, 70, 44];
    const beat = marker => {
      const x = levelX(marker, width);
      const peak = base - Math.min(32, 10 + levelParts(marker).weight * 7);
      return `L${x - 5} ${base}L${x - 2} ${base + 4}L${x} ${peak}L${x + 3} ${base + 7}L${x + 6} ${base}`;
    };
    const trace = `M0 ${base}${context.all.map(beat).join("")}L${width} ${base}`;
    const x = levelX(context.level, width);
    return `<div class="lv lv19">
      ${lvStep("previous", context.previous)}
      <div class="lv1-now"><span class="app-weak">Level</span><span class="lv1-number app-number">${context.level}</span></div>
      ${lvStep("next", context.next)}
      <svg class="lv-track lv19-track" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" data-action="level-track">
        <defs>
          <clipPath id="lv19-passed"><rect x="0" y="0" width="${x}" height="${height}"/></clipPath>
          <linearGradient id="lv19-glow" gradientUnits="userSpaceOnUse" x1="${x - 90}" x2="${x}" y1="0" y2="0"><stop offset="0" stop-color="var(--accent)" stop-opacity="0"/><stop offset="1" stop-color="var(--accent)" stop-opacity="1"/></linearGradient>
        </defs>
        <path class="lv19-trace" d="${trace}"/>
        <path class="lv19-trace is-passed" d="${trace}" clip-path="url(#lv19-passed)"/>
        <path class="lv19-trace is-glow" d="${trace}" clip-path="url(#lv19-passed)" stroke="url(#lv19-glow)"/>
        ${context.all.map(marker => `<rect x="${levelX(marker, width) - 5}" y="8" width="10" height="${height - 8}" fill="transparent"><title>${markerWords(marker)}</title></rect>`).join("")}
        <circle class="lv19-ring" cx="${x}" cy="${base}" r="4"/>
        <circle class="lv19-point" cx="${x}" cy="${base}" r="4"/>
      </svg>
      ${lvChanges(context)}
    </div>`;
  } });

addLevelVariant({ n: 20, temperature: "free", name: "Numbers alone",
  note: "no track: the levels themselves on one line, a point per level and the markers written out, larger when more changes there; the level in the accent among them",
  render: context => {
    const marked = new Set(context.all);
    const items = LEVELS.map(level => {
      const state = level === context.level ? "is-current" : level < context.level ? "is-passed" : "";
      if (level === context.level || marked.has(level) || level === 1 || level === MAX_LEVEL) {
        const size = level === context.level ? 30 : Math.min(22, 13 + levelParts(level).weight * 3);
        return `<button type="button" class="lv20-number ${state}" style="font-size:${size}px" data-action="level-go" data-level="${level}" title="${markerWords(level)}">${level}</button>`;
      }
      return `<button type="button" class="lv20-dot ${state}" data-action="level-go" data-level="${level}" title="Level ${level}"></button>`;
    }).join("");
    return `<div class="lv lv20">
      <div class="lv20-row">${lvStep("previous", context.previous)}<div class="lv20-line">${items}</div>${lvStep("next", context.next)}</div>
      <div class="lv20-changes"><span class="app-weak">${context.lines.length > 0 ? "What changes at" : "Nothing changes at"} ${context.level}</span> ${context.lines.join('<span class="app-weak"> · </span>')}</div>
    </div>`;
  } });
