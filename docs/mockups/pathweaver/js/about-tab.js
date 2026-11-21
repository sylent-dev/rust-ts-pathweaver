// The About tab (2k3): what the file says of the build besides its levels, where ⚠ of the header leads: the
// description of its author with the markup of the game, the link of its guide (a link only when it starts
// with https://), the file to download and where the game reads it, the warnings by part (specs.md, The header
// of a build, Unknown and invalid entries, Downloading a build). Twelve variants, three at each of four
// temperatures (normal, high, explosive, free), chosen with the tabs « About » (VARIANTS.about, js/page.js).
// The cases (BUILDS.abouts, tools/make-data.py): the build shown, the longest description of the corpus and
// a link; a leveling guide without description nor link, 18 gems the game data don't know; an Amazon whose
// links are written in its description.

const ABOUT = {
  n1: { title: "N1 · One column", text: "One column the width of a page of text: the description, the guide under it, then the file and the warnings, each under a small title." },
  n2: { title: "N2 · Cut in two", text: "Cut as the Inventory tab: the description on the graph paper, the guide, the file and the warnings on a pane at the right." },
  n3: { title: "N3 · Cards", text: "Each part a card in the construction of the cards on hover: its head in the deep shade, its body darker." },
  h1: { title: "H1 · Warnings first", text: "The warnings on a band at the top when there are any, open; the guide and the file on one line; the description under them." },
  h2: { title: "H2 · A colophon", text: "At the left, what the file says of itself: the portrait, the name, the author, the levels, the counts, the guide, the file; the description at the right." },
  h3: { title: "H3 · A letter", text: "The description as a letter of its author, signed with their name; « Read the whole guide on mobalytics.gg » under it." },
  e1: { title: "E1 · The portrait", text: "The portrait of the ascendancy large, faded behind the name and the author, the description under them." },
  e2: { title: "E2 · Contents", text: "The heads the author wrote in bold (« MAPPING LOOP: ») listed at the left as the contents of the description." },
  e3: { title: "E3 · Tiles", text: "Tiles of figures: the levels, the passives, the skills, the items; then the guide, the file and the warnings as tiles, the description under them." },
  f1: { title: "F1 · The file opened", text: "The file drawn as a page, its fields named as they are written in it (« name », « link », « description »)." },
  f2: { title: "F2 · A check-up", text: "A line per thing checked: the file read, the gems and the passives known, the link, then the description." },
  f3: { title: "F3 · Properties", text: "A table of the properties of the file, its keys at the left, then the description; the warnings as rows, their ids whole." },
};

// The pieces every variant reads.
const AB_PARTS = { ascendancy: "Ascendancy", passive: "Passives", gem: "Gems", unique: "Uniques", slot: "Slots", interval: "Levels" };
const abShort = id => String(id).split("/").pop();
const abSize = bytes => `${Math.round(bytes / 1024)} KB`;
const abSafe = link => link.startsWith("https://");
const abHost = link => { try { return new URL(link).host.replace(/^www\./, ""); } catch { return link; } };
const abLevels = about => (about.levels ? `levels ${about.levels[0]}–${about.levels[1]}` : "a snapshot");
const abCounts = about => [plural(about.counts.passives, "passive"), plural(about.counts.skills, "skill"), plural(about.counts.supports, "support"), plural(about.counts.hints, "item")];
const abTitle = text => `<h3 class="ab-title app-title">${text}</h3>`;
const abDescription = about => (about.description
  ? `<div class="ab-desc">${markupHtml(about.description.replace(/\r/g, ""))}</div>`
  : '<p class="ab-none app-weak">The author wrote no description.</p>');
// The link of the guide: a link that opens in a new tab when it starts with https://, plain words otherwise
// (specs.md, The header of a build); none when the file has none.
const abLink = (about, words) => (!about.link ? "" : abSafe(about.link)
  ? `<a class="ab-link" href="${escapeHtml(about.link)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(about.link)}">${icon(13, ICONS.link)}<span>${words ?? escapeHtml(abHost(about.link))}</span></a>`
  : `<span class="ab-link-text">${escapeHtml(about.link)}</span>`);
const abNoLink = '<p class="ab-none app-weak">No link to a guide in the file.</p>';
const abFile = about => `<button type="button" class="app-file ab-file" draggable="true" title="${escapeHtml(about.file)}">${fileIcon()}<span class="app-file-text"><span class="app-file-label">Download .build</span><small>${abSize(about.size)}</small></span></button>`;
const AB_WHERE = "The game reads its builds in <code>Documents/My Games/Path of Exile 2/BuildPlanner</code>; on Steam Deck, in that folder of the Proton prefix.";
const abWhere = () => `<p class="ab-where app-weak">${AB_WHERE}</p>`;
const abGroups = about => Object.keys(AB_PARTS).map(part => [part, about.warnings.filter(w => w.part === part)]).filter(([, list]) => list.length);
const abWarningsIntro = `Not in the game data of ${BUILDS.treeVersion}: a file made for another version of the game is the usual cause. The rest of the build shows as usual.`;
const abWarningRow = w => `<li class="ab-warning">${UNKNOWN_MARK}<span class="ab-warning-name">${escapeHtml(abShort(w.id))}</span>${w.where ? `<span class="app-weak">on ${escapeHtml(abShort(w.where))}</span>` : ""}${w.levels ? `<span class="ab-warning-levels app-weak">${w.levels[0]}–${w.levels[1]}</span>` : ""}</li>`;
const abWarnings = (about, { title = true } = {}) => (about.warnings.length
  ? `${title ? abTitle(`Warnings <span class="ab-count">${about.warnings.length}</span>`) : ""}<p class="ab-intro app-weak">${abWarningsIntro}</p>${abGroups(about).map(([part, list]) =>
    `<h4 class="ab-part">${AB_PARTS[part]} · ${list.length}</h4><ul class="ab-warnings">${list.map(abWarningRow).join("")}</ul>`).join("")}`
  : `${title ? abTitle("Warnings") : ""}<p class="ab-none app-weak">None: every id of the file is in the game data of ${BUILDS.treeVersion}.</p>`);
const abPortrait = (about, size) => `<img class="ab-portrait" src="pathweaver/img/portraits-square/${about.portrait}.webp" width="${size}" height="${size}" alt="">`;
const abBy = about => `${about.author ? `by ${escapeHtml(about.author)} · ` : ""}${escapeHtml(about.ascendancy)} <span class="app-weak">${escapeHtml(about.class)}</span>`;

// E2: the heads the author wrote in bold at the start of a line (« <b>{MAPPING LOOP: } »), as anchors.
const abHeads = about => [...about.description.matchAll(/(?:^|\n)<b>\{([^{}<>]{2,40})\}/g)].map(match => match[1].split(":")[0].trim());

// The variants: the HTML of the tab.
const ABOUT_DRAW = {
  n1: about => `<div class="ab-page">${abTitle("Description")}${abDescription(about)}
      ${abTitle("Guide")}${about.link ? `<p class="ab-line">${abLink(about)}</p>` : abNoLink}
      ${abTitle("File")}<div class="ab-file-row">${abFile(about)}${abWhere()}</div>
      ${abWarnings(about)}</div>`,
  n2: about => `<div class="ab-cut"><div class="ab-cut-main">${abTitle("Description")}${abDescription(about)}</div>
      <div class="ab-cut-side">${abTitle("Guide")}${about.link ? `<p class="ab-line">${abLink(about)}</p>` : abNoLink}
        ${abTitle("File")}${abFile(about)}${abWhere()}${abWarnings(about)}</div></div>`,
  n3: about => `<div class="ab-cards"><div class="ab-cards-main">${abCard("Description", abDescription(about))}</div>
      <div class="ab-cards-side">${abCard("Guide", about.link ? abLink(about) : abNoLink)}${abCard("File", `${abFile(about)}${abWhere()}`)}
        ${abCard(`Warnings${about.warnings.length ? ` · ${about.warnings.length}` : ""}`, abWarnings(about, { title: false }))}</div></div>`,
  h1: about => `${about.warnings.length ? `<div class="ab-alert"><div class="ab-alert-head">${icon(16, ICONS.warning)}<strong>${plural(about.warnings.length, "warning")}</strong></div>${abWarnings(about, { title: false })}</div>` : ""}
      <div class="ab-page"><div class="ab-bar">${about.link ? abLink(about, `The guide on ${escapeHtml(abHost(about.link))}`) : '<span class="app-weak">No link to a guide</span>'}${abFile(about)}</div>
      ${abDescription(about)}${abWhere()}</div>`,
  h2: about => `<div class="ab-colophon"><aside class="ab-colophon-side">${abPortrait(about, 88)}<h3 class="ab-name app-title">${escapeHtml(about.name)}</h3><p class="ab-by">${abBy(about)}</p>
        <dl class="ab-facts"><dt>Levels</dt><dd>${abLevels(about).replace("levels ", "")}</dd><dt>Entries</dt><dd>${abCounts(about).join("<br>")}</dd><dt>Guide</dt><dd>${about.link ? abLink(about) : '<span class="app-weak">none</span>'}</dd></dl>
        ${abFile(about)}</aside>
      <div class="ab-colophon-main">${abDescription(about)}${about.warnings.length ? `<div class="ab-gap">${abWarnings(about)}</div>` : ""}${abWhere()}</div></div>`,
  h3: about => `<div class="ab-letter-page"><article class="ab-letter">${abDescription(about)}${about.author ? `<p class="ab-sign">— ${escapeHtml(about.author)}</p>` : ""}</article>
      ${about.link && abSafe(about.link) ? `<p class="ab-read">${abLink(about, `Read the whole guide on ${escapeHtml(abHost(about.link))}`)}</p>` : about.link ? `<p class="ab-read">${abLink(about)}</p>` : ""}
      <div class="ab-letter-foot">${abFile(about)}${about.warnings.length ? `<span class="ab-chip">${UNKNOWN_MARK}${plural(about.warnings.length, "warning")}</span>` : ""}</div>
      ${about.warnings.length ? `<div class="ab-gap">${abWarnings(about)}</div>` : ""}${abWhere()}</div>`,
  e1: about => `<div class="ab-hero"><div class="ab-hero-art" style="background-image:url(pathweaver/img/portraits-square/${about.portrait}.webp)"></div>
        <div class="ab-hero-text"><h3 class="ab-hero-name app-title">${escapeHtml(about.name)}</h3><p class="ab-by">${abBy(about)} · ${abLevels(about)}</p>
        <div class="ab-bar">${about.link ? abLink(about, `The guide on ${escapeHtml(abHost(about.link))}`) : ""}${abFile(about)}</div></div></div>
      <div class="ab-page">${abDescription(about)}${about.warnings.length ? `<div class="ab-gap">${abWarnings(about)}</div>` : ""}${abWhere()}</div>`,
  e2: about => {
    const heads = abHeads(about);
    const nav = [...(about.description ? ["Description"] : []), ...heads.map(head => `<span class="ab-sub">${escapeHtml(head.toLowerCase())}</span>`), "Guide", "File", ...(about.warnings.length ? [`Warnings · ${about.warnings.length}`] : [])];
    return `<div class="ab-contents"><nav class="ab-nav">${nav.map((item, index) => `<span class="ab-nav-item${index === 0 ? " is-here" : ""}">${item}</span>`).join("")}</nav>
      <div class="ab-contents-main">${abTitle("Description")}${abDescription(about)}${abTitle("Guide")}${about.link ? `<p class="ab-line">${abLink(about)}</p>` : abNoLink}
        ${abTitle("File")}<div class="ab-file-row">${abFile(about)}${abWhere()}</div>${about.warnings.length ? abWarnings(about) : ""}</div></div>`;
  },
  e3: about => `<div class="ab-page is-wide"><div class="ab-tiles">${[[abLevels(about).replace("levels ", ""), "levels"], [about.counts.passives, "passives"], [about.counts.skills, "skills"], [about.counts.supports, "supports"], [about.counts.hints, "items"]].map(([figure, words]) =>
        `<div class="ab-tile"><b class="app-number">${figure}</b><span class="app-weak">${words}</span></div>`).join("")}</div>
      <div class="ab-tiles is-three"><div class="ab-tile is-text">${abTitle("Guide")}${about.link ? abLink(about) : '<span class="app-weak">none</span>'}</div><div class="ab-tile is-text">${abTitle("File")}${abFile(about)}</div>
        <div class="ab-tile is-text${about.warnings.length ? " is-warned" : ""}">${abTitle("Warnings")}${about.warnings.length ? `<span>${UNKNOWN_MARK} ${plural(about.warnings.length, "id")} not in the game data</span>` : '<span class="app-weak">none</span>'}</div></div>
      ${abTitle("Description")}${abDescription(about)}${about.warnings.length ? abWarnings(about) : ""}${abWhere()}</div>`,
  f1: about => {
    const field = (key, value) => `<div class="ab-field"><span class="ab-key">"${key}"</span><div class="ab-value">${value}</div></div>`;
    return `<div class="ab-page"><div class="ab-sheet"><div class="ab-sheet-corner"></div><p class="ab-sheet-name">${escapeHtml(about.file)} <span class="app-weak">· ${abSize(about.size)}</span></p>
      ${field("name", escapeHtml(about.name))}${field("author", about.author ? escapeHtml(about.author) : '<span class="app-weak">none</span>')}${field("ascendancy", `${escapeHtml(about.ascendancy)} <span class="app-weak">${escapeHtml(about.class)}</span>`)}
      ${field("link", about.link ? abLink(about) : '<span class="app-weak">none</span>')}${field("description", abDescription(about))}
      ${field("passives, skills, inventory_slots", abCounts(about).join(" · "))}</div>
      <div class="ab-file-row">${abFile(about)}${abWhere()}</div>${about.warnings.length ? abWarnings(about) : ""}</div>`;
  },
  f2: about => {
    const gems = about.warnings.filter(w => w.part === "gem").length;
    const passives = about.warnings.filter(w => w.part === "passive").length;
    const check = (ok, words) => `<li class="ab-check ${ok ? "is-ok" : "is-warned"}"><span class="ab-check-mark">${ok ? "✓" : "!"}</span>${words}</li>`;
    return `<div class="ab-page"><ul class="ab-checks">${check(true, `The file read: ${abCounts(about).join(", ")}`)}
        ${check(!gems, gems ? `${plural(gems, "gem")} of ${about.counts.skills + about.counts.supports} not in the game data of ${BUILDS.treeVersion}` : `Every gem in the game data of ${BUILDS.treeVersion}`)}
        ${check(!passives, passives ? `${plural(passives, "passive")} not in the tree` : about.counts.passives ? "Every passive in the tree" : "No passive in the file")}
        ${check(Boolean(about.link) && abSafe(about.link), about.link ? `A link to its guide: ${abLink(about)}` : "No link to a guide")}
        ${check(Boolean(about.description), about.description ? "A description" : "No description")}</ul>
      ${about.warnings.length ? abWarnings(about) : ""}${about.description ? `${abTitle("Description")}${abDescription(about)}` : ""}<div class="ab-file-row">${abFile(about)}${abWhere()}</div></div>`;
  },
  f3: about => {
    const row = (key, value) => `<tr><th>${key}</th><td>${value}</td></tr>`;
    return `<div class="ab-page is-wide"><table class="ab-props"><tbody>${row("Name", escapeHtml(about.name))}${row("Author", about.author ? escapeHtml(about.author) : '<span class="app-weak">none</span>')}
        ${row("Ascendancy", `${escapeHtml(about.ascendancy)} <span class="app-weak">${escapeHtml(about.class)}</span>`)}${row("Levels", abLevels(about).replace("levels ", ""))}${row("Entries", abCounts(about).join(" · "))}
        ${row("Guide", about.link ? abLink(about) : '<span class="app-weak">none</span>')}${row("File", `${escapeHtml(about.file)} · ${abSize(about.size)}`)}${row("Game data", BUILDS.treeVersion)}
        ${about.warnings.map((w, index) => row(index ? "" : `Warnings · ${about.warnings.length}`, `${UNKNOWN_MARK} <code>${escapeHtml(w.id)}</code>${w.where ? ` <span class="app-weak">on ${escapeHtml(abShort(w.where))}</span>` : ""}`)).join("")}</tbody></table>
      <div class="ab-file-row">${abFile(about)}${abWhere()}</div>${abTitle("Description")}${abDescription(about)}</div>`;
  },
};
// N3: a card in the construction of the cards on hover.
const abCard = (title, body) => `<div class="ab-card"><div class="ab-card-head">${title}</div><div class="ab-card-body">${body}</div></div>`;

// The About tab of the build shown, or of a case (`source`, a key of BUILDS.abouts).
const aboutTab = (level, source = "shown") =>
  `<div class="app-about-tab"><div class="app-ab ab-${chosen.about}">${(ABOUT_DRAW[chosen.about] ?? ABOUT_DRAW.n1)(BUILDS.abouts[source])}</div></div>`;
