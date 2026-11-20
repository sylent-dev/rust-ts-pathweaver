// « New at N » (2j): N2 kept; its motion when the level changes, three to choose against the lines
// replaced at once, each in the right column of the Overview at the level of the band above.

addSection(() => ["« New at N », its motion when the level changes: ◀ ▶, the track or ← → in the band move the four columns", [
  ["The level of the build", `<div class="app-window app-new-band" style="width:960px">${levelBand()}</div>`],
  ...Object.entries(NEW_MOTIONS).map(([id, motion]) => [motion.title,
    `<div class="app-window app-new-case" style="width:330px"><p class="app-new-case-text">${motion.text}</p>
      <aside class="app-side app-new-case-column" data-motion="${id}">${newAtBox(STATE.level)}${skillList(STATE.level)}${inventoryBox(STATE.level)}</aside></div>`]),
]]);
