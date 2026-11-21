// The About tab (2k3): what the file says of the build besides its levels, where ⚠ of the header leads (specs.md,
// The header of a build, Unknown and invalid entries, Downloading a build). H2 of twelve variants at four
// temperatures (the owner, 2026-11-21; the others in the history of Git): a colophon at the left, on a pane as
// dark as a slot, as the Inventory tab: the portrait, the name, the author and the ascendancy, the levels, the
// entries, the guide, the file; the description at the right, at the width of a page of text, the warnings
// under it. The cases (BUILDS.abouts, tools/make-data.py): the build shown, the longest description of the
// corpus and a link; a leveling guide without description nor link, 18 gems the game data don't know; an
// Amazon whose links are written in its description.

const AB_PARTS = { ascendancy: "Ascendancy", passive: "Passives", gem: "Gems", unique: "Uniques", slot: "Slots", interval: "Levels" };
const abShort = id => String(id).split("/").pop();
const abSize = bytes => `${Math.round(bytes / 1024)} KB`;
const abCounts = about => [plural(about.counts.passives, "passive"), plural(about.counts.skills, "skill"), plural(about.counts.supports, "support"), plural(about.counts.hints, "item")];
const abTitle = text => `<h3 class="ab-title app-title">${text}</h3>`;

// The links (the owner, 2026-11-21): only what starts with https://, in a new tab that keeps no hold on the
// page, the whole address in its tooltip. An address the author wrote in the description is a link where it is,
// the words, colours and styles of the author kept.
// An address ends at a space, a quote, a tag or a brace of the markup (« <u>{https://…} »), never on a mark of
// punctuation that closes the sentence.
const AB_URL = /https:\/\/[^\s<>"'{}]+[^\s<>"'{}.,;:!?)]/g;
const abLinked = html => html.replace(AB_URL, url => `<a class="ab-inline-link" href="${url}" target="_blank" rel="noopener noreferrer" title="${url}">${url}</a>`);
const abDescription = about => (about.description
  ? `<div class="ab-desc">${abLinked(markupHtml(about.description.replace(/\r/g, "")))}</div>`
  : '<p class="ab-none app-weak">The author wrote no description.</p>');
// A link of the guide in the look of « Download .build » (the owner, 2026-11-21: no icon, the same hover): its
// site in the accent, turning to the colour of the text on hover, the rest of its address small and grey under it.
function abGuideLink(url) {
  let host = url, rest = "";
  try {
    const parsed = new URL(url);
    host = parsed.host.replace(/^www\./, "");
    rest = `${parsed.pathname}${parsed.search}`.replace(/^\/|\/$/g, "");
  } catch { /* shown whole */ }
  return `<a class="ab-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(url)}"><span class="ab-link-host">${escapeHtml(host)}</span>${rest ? `<small>${escapeHtml(rest)}</small>` : ""}</a>`;
}
// The guide: the link of the file, the one its author named; when it has none, the addresses of the description,
// in their order, said to come from it (the Amazon of the corpus: its guide and its planner); else nothing.
function abGuide(about) {
  if (about.link) return about.link.startsWith("https://") ? abGuideLink(about.link) : `<span class="ab-link-text">${escapeHtml(about.link)}</span>`;
  const found = [...new Set(about.description.match(AB_URL) ?? [])];
  return found.length ? `${found.map(abGuideLink).join("")}<span class="ab-from app-weak">from the description</span>` : '<span class="app-weak">none</span>';
}
const abFile = about => `<button type="button" class="app-file ab-file" draggable="true" title="${escapeHtml(about.file)}">${fileIcon()}<span class="app-file-text"><span class="app-file-label">Download .build</span><small>${abSize(about.size)}</small></span></button>`;
const abWhere = () => '<p class="ab-where app-weak">The game reads its builds in <code>Documents/My Games/Path of Exile 2/BuildPlanner</code>; on Steam Deck, in that folder of the Proton prefix.</p>';

// The warnings by part: the sticky note « ? », the end of the id, what carries it, its levels.
const abGroups = about => Object.keys(AB_PARTS).map(part => [part, about.warnings.filter(w => w.part === part)]).filter(([, list]) => list.length);
const abWarningRow = w => `<li class="ab-warning">${UNKNOWN_MARK}<span class="ab-warning-name" title="${escapeHtml(w.id)}">${escapeHtml(abShort(w.id))}</span>${w.where ? `<span class="app-weak">on ${escapeHtml(abShort(w.where))}</span>` : ""}${w.levels ? `<span class="ab-warning-levels app-weak">${w.levels[0]}–${w.levels[1]}</span>` : ""}</li>`;
const abWarnings = about => `${abTitle(`Warnings <span class="ab-count">${about.warnings.length}</span>`)}
  <p class="ab-intro app-weak">Not in the game data of ${BUILDS.treeVersion}: a file made for another version of the game is the usual cause. The rest of the build shows as usual.</p>
  ${abGroups(about).map(([part, list]) => `<h4 class="ab-part">${AB_PARTS[part]} · ${list.length}</h4><ul class="ab-warnings">${list.map(abWarningRow).join("")}</ul>`).join("")}`;

// The About tab of the build shown, or of a case (`source`, a key of BUILDS.abouts).
function aboutTab(level, source = "shown") {
  const about = BUILDS.abouts[source];
  return `<div class="app-about-tab"><div class="app-ab"><div class="ab-colophon">
      <aside class="ab-colophon-side"><img class="ab-portrait" src="pathweaver/img/portraits-square/${about.portrait}.webp" width="88" height="88" alt="">
        <h3 class="ab-name app-title">${escapeHtml(about.name)}</h3>
        <p class="ab-by">${about.author ? `by ${escapeHtml(about.author)} · ` : ""}${escapeHtml(about.ascendancy)} <span class="app-weak">${escapeHtml(about.class)}</span></p>
        <dl class="ab-facts"><dt>Levels</dt><dd>${about.levels ? `${about.levels[0]}–${about.levels[1]}` : "a snapshot"}</dd><dt>Entries</dt><dd>${abCounts(about).join("<br>")}</dd><dt>Guide</dt><dd class="ab-guide">${abGuide(about)}</dd></dl>
        ${abFile(about)}</aside>
      <div class="ab-colophon-main">${abDescription(about)}${about.warnings.length ? `<div class="ab-gap">${abWarnings(about)}</div>` : ""}${abWhere()}</div>
    </div></div></div>`;
}
