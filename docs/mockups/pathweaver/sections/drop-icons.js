// The series of icons for the drop zone (js/drop-icons.js): each numbered, at the size of the
// zone (40 px) on its black, and small (20 px); a click puts it in the zone of E1b, just below.

const dropIconTiles = () => `<div class="drop-icons" data-sample-theme="frost-night">${Object.entries(DROP_ICONS).map(([number, [title, body]]) =>
  `<button type="button" class="drop-icon-tile ${chosen.dropIcon === number ? "is-chosen" : ""}" data-action="pickDropIcon" data-icon="${number}" title="${title}">
    <span class="drop-icon-number">${number}</span>
    <span class="drop-icon-big">${icon(40, body)}</span>
    <span class="drop-icon-small">${icon(20, body)}</span>
    <span class="drop-icon-title">${title}</span>
  </button>`).join("")}</div>`;

addSection(() => ["The icon of the drop zone · twenty, drawn for Pathweaver: click one to put it in the zone of E1b below",
  [["Nothing is uploaded, so no cloud and no arrow leaving; Download .build keeps its own arrow", dropIconTiles()]]]);
