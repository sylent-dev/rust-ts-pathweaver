// The first visit at a normal temperature (2l, css/home-normal.css): the band of the site kept, a
// sober page that explains itself. N1 centred, N2 split, N3 in three steps.

// Small marks of what Pathweaver shows, drawn for it: a bit of the tree, a gem, a slot.
const HOME_MARKS = {
  tree: '<circle cx="3.5" cy="12" r="1.8"/><circle cx="8" cy="4" r="1.8"/><circle cx="12.5" cy="11" r="1.8"/><path d="M4.4 10.4 7.1 5.6M9 5.6l2.6 3.8"/>',
  gem: '<path d="M8 1.8 13.5 8 8 14.2 2.5 8z"/>',
  slot: '<rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="M5.5 10.5h5"/>',
};

const centredHome = () => homeWindow("centred", `<div class="home-centred-main">
  <span class="home-subtitle">Build viewer and planner · Path of Exile 2</span>
  ${tagline()}
  <p class="home-centred-does">${HOME_TEXT.does}</p>
  <div class="home-centred-drop">
    ${icon(32, ICONS.drop)}
    <strong>Drop .build files here</strong>
    <div class="home-centred-actions">${homeCta()}${homePaste()}</div>
    ${homeDropHint("Several files at once open together · " + HOME_TEXT.local)}
  </div>
  <div class="home-centred-sources"><p class="home-sources-title">${HOME_TEXT.sourcesTitle}</p>${homeSources()}</div>
</div>`);

const splitHome = () => homeWindow("split", `<div class="home-split-main">
  <div class="home-split-text">
    <span class="home-subtitle">Build viewer and planner · Path of Exile 2</span>
    ${tagline()}
    <p class="home-split-does">${HOME_TEXT.does}</p>
    <ul class="home-split-list">
      <li>${icon(16, HOME_MARKS.tree)}The passives you take, and those that come later</li>
      <li>${icon(16, HOME_MARKS.gem)}The skills and their supports, the new ones first</li>
      <li>${icon(16, HOME_MARKS.slot)}What to wear in each slot</li>
    </ul>
    <div class="home-split-sources"><p class="home-sources-title">${HOME_TEXT.sourcesTitle}</p>${homeSources()}</div>
  </div>
  <div class="home-split-drop home-paper">
    ${icon(40, ICONS.drop)}
    <strong>Drop .build files here</strong>
    <div class="home-split-actions">${homeCta()}${homePaste()}</div>
    ${homeDropHint(HOME_TEXT.local)}
  </div>
</div>`);

// The mini level band of the third step: the real markers of the build, the cursor at 24.
const stepTrack = level => `<div class="home-step-track">${markers().map(m =>
  `<i style="left:${(m - 1) / (MAX_LEVEL - 1) * 100}%"></i>`).join("")}<b style="left:${(level - 1) / (MAX_LEVEL - 1) * 100}%"></b></div>`;

const stepsHome = () => homeWindow("steps", `<div class="home-steps-main">
  <div class="home-steps-head">
    <span class="home-subtitle">Build viewer and planner · Path of Exile 2</span>
    ${tagline()}
    <p class="home-steps-does">${HOME_TEXT.does}</p>
  </div>
  <div class="home-steps-row">
    <div class="home-step"><span class="home-step-number">1</span><h3>Get a .build file</h3>
      <p>${HOME_TEXT.sources}</p>${homeSources()}</div>
    <div class="home-step is-now"><span class="home-step-number">2</span><h3>Add it here</h3>
      ${icon(36, ICONS.drop, 'style="color:var(--accent)"')}
      <div class="home-step-actions">${homeCta()}${homePaste()}</div>
      ${homeDropHint()}
      <span class="home-local">${HOME_TEXT.local}</span></div>
    <div class="home-step"><span class="home-step-number">3</span><h3>Follow it level by level</h3>
      <div class="home-step-level"><b>24</b><span class="app-weak">of 100</span></div>
      ${stepTrack(24)}
      <p>Move the level: the passives, the gems and the gear that apply light up, and what is new at that level stands out.</p></div>
  </div>
</div>`);

addSection(() => ["The first visit · normal temperature: the band of the site kept, a sober page (click the line to draw the next)",
  [["N1 · Centred: one column, a dashed drop zone in the middle, the sources under it", centredHome()],
   ["N2 · Split: what it does on the left, a tall drop zone on graph paper on the right, no border", splitHome()],
   ["N3 · Three steps: get a file, add it here (the step to take now), follow it level by level", stepsHome()]]]);
