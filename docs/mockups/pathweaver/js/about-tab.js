// The About tab (2k3): what the file says of the build besides its levels, where ⚠ of the header leads (specs.md,
// The header of a build, Unknown and invalid entries, Downloading a build). H2 of twelve variants at four
// temperatures (the owner, 2026-11-21; the others in the history of Git): a colophon at the left, on a pane as
// dark as a slot, as the Inventory tab: the portrait the width of the pane, from its top (the square inside the
// disc at the centre of the tree, cut large from the art of the game: the small one grown was blurred), the name, the author and the ascendancy, the levels, the
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
// An address of the description as a chip of its site (4g3, its third review; the owner, 2026-11-24: its letters
// in the text, which a space of one pixel or a tag that changes nothing on screen made to read as another address
// than the one opened, and plain text set aside), computed from the address it opens, so that no text around it
// can lengthen or change what it reads; its whole address in its tooltip.
// The site is the host the browser reads, without `www.` when a name with a dot follows it (www.com stays whole);
// past 40 characters, its end only, after an ellipsis, as the address bar of a browser cuts a long site: its true
// domain is at its end, and its start may be chosen to read as another (4g3, its fourth review, the owner,
// 2026-11-24: an ellipsis at its end hid the domain, and a chip on several lines crowded the guide). An address
// whose site the browser can't read stays text.
const AB_SITE_KEPT = 40;
function abSite(url) {
  if (!URL.canParse(url)) return undefined;
  const { host } = new URL(url);
  const site = host.startsWith("www.") && host.slice(4).includes(".") ? host.slice(4) : host;
  return site.length > AB_SITE_KEPT ? `…${site.slice(-(AB_SITE_KEPT - 1))}` : site;
}
const abLink = url => {
  const site = abSite(url);
  return site === undefined ? url
    : `<a class="ab-chip" href="${url}" target="_blank" rel="noopener noreferrer" title="${url}">${escapeHtml(site)}</a>`;
};
const abLinked = html => html.replace(AB_URL, abLink);
// A description cut by the core at 1,000 pieces (4g3b, sections/cut-text.js) ends with « … » in the weak grey, a
// space after its last piece (the owner, 2026-11-24), one that never leaves it alone on a line; none after a line
// break, where it would only indent « … » (4g3b, its review).
const AB_CUT = '&nbsp;<span class="app-weak">…</span>';
const abDescription = about => (about.description
  ? `<div class="ab-desc">${abLinked(markupHtml(about.description.replace(/\r/g, "")))}${about.isCut ? AB_CUT : ""}</div>`
  : '<p class="ab-none app-weak">The author wrote no description.</p>');
// A link of the guide in the look of « Download .build » (the owner, 2026-11-21: no icon, the same hover): its
// site alone in the accent, turning to the colour of the text on hover; its whole address in its tooltip (the
// rest of the address written under it set aside: not pretty).
function abGuideLink(url) {
  let host = url;
  try { host = new URL(url).host.replace(/^www\./, ""); } catch { /* shown whole */ }
  return `<a class="ab-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(url)}">${escapeHtml(host)}</a>`;
}
// The guide, one link: the link of the file, the one its author named; when it has none, the first address of the
// description, said to come from it (the owner, 2026-11-21: one guide, not two links to the same site; the Amazon
// of the corpus writes its guide, then its planner); else nothing.
function abGuide(about) {
  if (about.link) return about.link.startsWith("https://") ? abGuideLink(about.link) : `<span class="ab-link-text">${escapeHtml(about.link)}</span>`;
  const first = about.description.match(AB_URL)?.[0];
  return first ? `${abGuideLink(first)}<span class="ab-from app-weak">from the description</span>` : '<span class="app-weak">none</span>';
}
const abFile = about => `<button type="button" class="app-file ab-file" draggable="true" title="${escapeHtml(about.file)}">${fileIcon()}<span class="app-file-text"><span class="app-file-label">Download .build</span><small>${abSize(about.size)}</small></span></button>`;
const abWhere = () => '<p class="ab-where app-weak">The game reads its builds in <code>Documents/My Games/Path of Exile 2/BuildPlanner</code>; on Steam Deck, in that folder of the Proton prefix.</p>';

// The warnings: « 18 warnings », as the button ⚠ of the header, the whole title in the yellow of the sticky note
// (the owner, 2026-11-21: how many warnings a build has matters before starting it; « Warnings 18 », the number
// alone in the yellow, read oddly); then by part, « GEMS · 18 », the warnings of a part (12 gems in 18 warnings for the leveling
// guide of the corpus), each with the sticky note « ? », the end of the id, what carries it, its levels.
const abGroups = about => Object.keys(AB_PARTS).map(part => [part, about.warnings.filter(w => w.part === part)]).filter(([, list]) => list.length);
const abWarningRow = w => `<li class="ab-warning">${UNKNOWN_MARK}<span class="ab-warning-name" title="${escapeHtml(w.id)}">${escapeHtml(abShort(w.id))}</span>${w.where ? `<span class="app-weak">on ${escapeHtml(abShort(w.where))}</span>` : ""}${w.levels ? `<span class="ab-warning-levels app-weak">${w.levels[0]}–${w.levels[1]}</span>` : ""}</li>`;
const abWarnings = about => `${abTitle(`<span class="ab-warned">${plural(about.warnings.length, "warning")}</span>`)}
  <p class="ab-intro app-weak">Not in the game data of ${BUILDS.treeVersion}: a file made for another version of the game is the usual cause. The rest of the build shows as usual.</p>
  ${abGroups(about).map(([part, list]) => `<h4 class="ab-part">${AB_PARTS[part]} · ${list.length}</h4><ul class="ab-warnings">${list.map(abWarningRow).join("")}</ul>`).join("")}`;

// The watermark of the description (2k3b, the owner, 2026-11-21): the mark of a note of the author, filled,
// large, in the middle of the part (its outline set aside).
const abWatermark = () => `<svg class="ab-watermark" viewBox="0 0 16 16" aria-hidden="true">${ICONS.note}</svg>`;

// The About tab of the build shown, or of a case (`source`, a key of BUILDS.abouts).
// The warnings before the description, where ⚠ of the header leads (data-warnings, its anchor; the owner,
// 2026-11-21); `wide`, in a column of their own between the colophon and the description, only when there are
// any (2k4: 31 builds of the 32 of the corpus have none).
function aboutTab(level, source = "shown", { wide = false } = {}) {
  const about = BUILDS.abouts[source];
  const warnings = about.warnings.length ? `<div class="ab-warnings-part" data-warnings="">${abWarnings(about)}</div>` : "";
  return `<div class="app-about-tab"><div class="app-ab graph-paper"><div class="ab-colophon">
      <aside class="ab-colophon-side"><img class="ab-portrait" src="pathweaver/img/portraits-about/${about.portrait}.webp" width="260" height="260" alt="">
        <h3 class="ab-name app-title">${buildName(about.name)}</h3>
        <p class="ab-by">${about.author ? `by ${escapeHtml(about.author)} · ` : ""}${escapeHtml(about.ascendancy)} <span class="app-weak">${escapeHtml(about.class)}</span></p>
        <dl class="ab-facts"><dt>Levels</dt><dd>${about.levels ? `${about.levels[0]}–${about.levels[1]}` : "a snapshot"}</dd><dt>Entries</dt><dd>${abCounts(about).join("<br>")}</dd><dt>Guide</dt><dd class="ab-guide">${abGuide(about)}</dd></dl>
        ${abFile(about)}</aside>
      ${wide && warnings ? `<div class="ab-aside">${warnings}</div>` : ""}
      <div class="ab-colophon-main">${abWatermark()}${!wide && warnings ? warnings : ""}${abDescription(about)}${abWhere()}</div>
    </div></div></div>`;
}
