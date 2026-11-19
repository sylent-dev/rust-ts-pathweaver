// The window of what changes, twelve layouts (2g3, the owner, 2026-11-19): each under the level and
// the arrows of the band, the track left out, on the case chosen in the tabs at the top (Case).

// The level of a case: the build of the page at its level, ◀ ▶ moving it; the others at their one level.
const changesCaseLevel = key => key === "shown" ? STATE.level : STATE.bandLevels[key] ?? Number(Object.keys(BUILDS.changes[key].levels)[0]);

function changesVariant([temperature, title, draw, width], index) {
  const key = chosen.changesCase;
  const level = changesCaseLevel(key);
  const record = changesHere(key, level);
  // « N changes » shown open, without opening the window of the page.
  const steps = levelSteps(markerBeside(key, level, "previous"), markerBeside(key, level, "next"), record, true).replace('data-action="changes-toggle"', "");
  return [`W${index + 1} · ${temperature} · ${title}`, `<div class="app-window app-wv-case" style="width:${width}px" data-band="${key}">
    <div class="app-level"><div class="app-level-now"><span class="app-level-label">Level</span><span class="app-level-number">${level}</span></div>${steps}
      <div class="app-changes-window app-wv app-wv-${index + 1}" role="dialog" aria-label="What changes at ${level}">${draw(changeList(record), level, record, key)}</div></div>
    <div class="app-wv-page"></div>
  </div>`];
}

addSection(() => [`The window of what changes · twelve layouts, three per temperature, on the case of the tabs at the top (Case: ${escapeHtml(BUILDS.changes[chosen.changesCase].name)}); the track left out`,
  CHANGES_VARIANTS.map(changesVariant)]);
