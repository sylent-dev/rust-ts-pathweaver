// The colours of W1 and W3 (2g3, the owner, 2026-11-19): « Change colour » and « Base » at the top of
// the page, on the case of « Case » (the respec has the three kinds of change and the bases).
addSection(() => [`W3 and W1 · the colours of a change and of a base: « Change colour » and « Base » at the top of the page (Case: ${escapeHtml(BUILDS.changes[chosen.changesCase].name)})`,
  [2, 0].map(index => changesVariant(CHANGES_VARIANTS[index], index))]);
