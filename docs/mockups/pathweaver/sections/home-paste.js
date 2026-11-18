// Paste JSON (2l, the owner, 2026-11-18: « quand je clique sur Paste JSON, qu'est-ce qui
// s'affiche ? »): the zone itself becomes a field, in its place and its black, the caret in it; the
// eye stays where it was. A paste opens the build at once, like a drop, without a button; the field
// takes the paste event, so the browser asks no permission (reading the clipboard would). Esc, or
// « Drop a file instead » under the zone, gives the zone back. A text that isn't a build stays in
// the field, its reason in red at its foot, until the next paste.

const PASTED_CUT = `{
  "name": "Ritualist poison",
  "author": "Fubgun",
  "class": "Huntress",
  "ascendancy": "Ritualist",
  "levels": [
    { "level": 1, "passives": [`;

const pasteZone = (text = "", reason = "") => `
  <textarea class="home-paste-field" placeholder=" " spellcheck="false" aria-label="The JSON of a build">${escapeHtml(text)}</textarea>
  <div class="home-paste-hint"><strong>Paste the JSON of a build</strong><span>Ctrl+V: it opens at once · Esc: back to the files</span></div>
  ${reason ? `<span class="home-drop-reason home-paste-reason">${reason}</span>` : ""}`;

const pasteHome = (text, reason) => dropHome({ zone: pasteZone(text, reason), field: true, link: dropLink("Drop a file instead"),
  state: `is-paste ${reason ? "is-refused" : "is-focus"}` });

addSection(() => ["E1b · Paste JSON: the zone becomes a field, and a paste opens the build at once",
  [["After a click on Paste JSON: the field, the caret in it (click it and paste any text)", pasteHome()],
   ["A text that isn't a whole build: it stays, its reason at the foot of the field", pasteHome(PASTED_CUT, "That isn't the JSON of a whole build: it stops at line 7.")]]]);
