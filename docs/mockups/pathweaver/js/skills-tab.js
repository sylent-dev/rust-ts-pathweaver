// The Skills tab (2k): the skills at the level, each with its supports written out, where the right
// column of the Overview only has room for their marks (js/side-skills.js). Twelve variants, three at
// each of four temperatures (normal, high, explosive, fun), chosen with the tabs « Skills tab »
// (VARIANTS.skillsTab, js/page.js). Every variant draws the same data: a skill per entry that applies
// at the level, in the order of the file; its supports that apply with it; the skill a spirit gem
// triggers apart; what is new at the level marked « new »; the mark of a note of the author; the card
// of a gem on hover of its mark or its name (js/gem-hover.js), the card of a note on its mark.
//
// The tab is as high as the Overview (668 px) and scrolls inside when its skills don't fit.

// The skills at a level, of the build shown or of a case (`source`, a key of SKILL_SOURCES).
const stSkills = (level, source) => (source ? SKILL_SOURCES[source] : skillsAt)(level).map(skill => skillRow(skill, level));

// A gem: its mark and its name, each showing its card on hover; « new » when it starts at the level.
const stNew = gem => (gem.isNew ? '<span class="st-new">new</span>' : "");
const stGem = (gem, className = "st-gem") =>
  `<span class="${className}">${skillMark(gem)}<span class="st-name" data-gem="${escapeHtml(gem.name)}">${escapeHtml(gem.name)}</span>${stNew(gem)}</span>`;
// The note of a skill, or of a support with the skill it supports as its place.
const stNote = (gem, skill) => noteMark(skill ? { place: skill.name, head: gem.name, text: gem.note } : { head: gem.name, text: gem.note });
// The root of a skill: what the card of a gem reads back (data-skill, its row; is-triggered, a skill a
// spirit gem triggers, drawn as a skill of its own).
const stSkillAttributes = (skill, triggered = false) => `data-skill="${escapeHtml(skill.name)}"${triggered ? ' data-triggered=""' : ""}`;
const stList = (level, source, className, body) =>
  `<div class="app-st ${className}" data-level="${level}"${source ? ` data-source="${source}"` : ""}>${body}</div>`;

// A support in a list: its mark, its name, « new », its note.
const stSupport = (gem, skill) => `<li class="st-support" ${stSkillAttributes(skill)}>${stGem(gem)}${stNote(gem, skill)}</li>`;
// The skills a spirit gem triggers, each a head of its own under its skill.
const stTriggered = (skill, className = "st-triggered") => skill.triggered.map(gem =>
  `<div class="${className}" ${stSkillAttributes(skill, true)}><span class="app-weak st-hook" aria-hidden="true">↳</span>${stGem(gem)}${stNote(gem)}</div>`).join("");

// A card: the skill, its supports one per line, what it triggers (N1, H2, E1, E2).
function stCard(skill, { notes = false, sockets = false } = {}) {
  const levels = notes ? `<p class="st-levels app-weak">${levelsWords(skill, skill.level)}</p>` : "";
  const noteText = gem => (notes && gem.note ? `<div class="st-note-text">${markupHtml(gem.note)}</div>` : "");
  const supports = skill.supports.map(gem => notes
    ? `<li class="st-support" ${stSkillAttributes(skill)}>${stGem(gem)}${noteText(gem)}</li>` : stSupport(gem, skill)).join("");
  return `<article class="st-card${sockets ? " is-sockets" : ""}">
    <div class="st-head" ${stSkillAttributes(skill)}>${stGem(skill, "st-gem st-skill")}${notes ? "" : stNote(skill)}</div>
    ${levels}${noteText(skill)}
    ${supports ? `<ul class="st-supports">${supports}</ul>` : ""}
    ${stTriggered(skill)}
  </article>`;
}

// A skill in words: its supports after « with », joined as a sentence (F1).
function stSentence(skill) {
  const count = skill.supports.length;
  const names = skill.supports.map((gem, index) => `<span class="st-word" ${stSkillAttributes(skill)}>${stGem(gem)}${index < count - 2 ? "," : ""}</span>`);
  const joined = count > 1 ? `${names.slice(0, -1).join(" ")} and ${names.at(-1)}` : names.join("");
  return `<p class="st-sentence"><span class="st-word" ${stSkillAttributes(skill)}>${stGem(skill, "st-gem st-skill")}${stNote(skill)}</span>${names.length ? ` <span class="app-weak">with</span> ${joined}` : ""}${skill.triggered.length ? `<span class="st-then"><span class="app-weak">, which triggers</span> ${skill.triggered.map(gem => `<span class="st-word" ${stSkillAttributes(skill, true)}>${stGem(gem)}</span>`).join("")}</span>` : ""}.</p>`;
}

// The bar of a gem on the levels 1 to 100 (H3): where it starts and where it ends, the level a line.
const stBar = gem => {
  const [low, high] = gem.levels;
  return `<span class="st-bar-track"><span class="st-bar" style="left:${low - 1}%;width:${high - low + 1}%;background:${gemColourOf(gem)}"></span></span>`;
};

const SKILLS_TAB_VARIANTS = {
  n1: {
    title: "N1 · Cards in three columns",
    text: "The wireframe: a card per skill, its supports one per line under it, the columns packed.",
    draw: (rows, level, source) => stList(level, source, "st-n1", rows.map(skill => stCard(skill)).join("")),
  },
  n2: {
    title: "N2 · A row per skill",
    text: "A row the width of the window, one in two a shade lighter, as the library: the skill on the left, its supports flowing on the right.",
    draw: (rows, level, source) => stList(level, source, "st-n2", rows.map(skill => `<div class="st-row">
      <div class="st-head" ${stSkillAttributes(skill)}>${stGem(skill, "st-gem st-skill")}${stNote(skill)}</div>
      <ul class="st-supports">${skill.supports.map(gem => stSupport(gem, skill)).join("")}${skill.triggered.map(gem =>
        `<li class="st-support" ${stSkillAttributes(skill, true)}><span class="app-weak st-hook">↳</span>${stGem(gem)}${stNote(gem)}</li>`).join("")}</ul>
    </div>`).join("")),
  },
  n3: {
    title: "N3 · An outline",
    text: "No box: the skills in bold, their supports indented under them, in three columns, the densest.",
    draw: (rows, level, source) => stList(level, source, "st-n3", rows.map(skill => `<div class="st-block">
      <div class="st-head" ${stSkillAttributes(skill)}>${stGem(skill, "st-gem st-skill")}${stNote(skill)}</div>
      <ul class="st-supports">${skill.supports.map(gem => stSupport(gem, skill)).join("")}</ul>${stTriggered(skill)}
    </div>`).join("")),
  },
  h1: {
    title: "H1 · A list and its detail",
    text: "The rows of the Overview on the left; a click shows a skill on the right, with its description, its levels, its notes and its supports, each with its own.",
    draw: (rows, level, source) => {
      const skill = rows.find(row => row.name === STATE.stChosen) ?? rows.find(row => row.isNew) ?? rows[0];
      const detail = gem => `<div class="st-detail-gem">
        <div class="st-detail-head">${stGem(gem, gem.kind === "support" ? "st-gem" : "st-gem st-skill")}<span class="app-weak">${gemKindName(gem)} · ${levelsWords(gem, level)}</span></div>
        ${gem.text ? `<p class="st-detail-text app-weak">${escapeHtml(gem.text)}</p>` : ""}
        ${gem.note ? `<div class="st-note-text">${markupHtml(gem.note)}</div>` : ""}</div>`;
      return stList(level, source, "st-h1", `<ul class="app-skills st-h1-list">${rows.map(row =>
        `<li class="app-skill st-h1-row${row === skill ? " is-chosen" : ""}" data-skill="${escapeHtml(row.name)}" data-action="st-choose">${skillMark(row)}${skillName(row)}${stNew(row)}<span class="app-skill-supports">${row.supports.map(skillMark).join("")}</span></li>`).join("")}</ul>
        <div class="st-h1-detail" ${stSkillAttributes(skill)}>${detail(skill)}<h3 class="st-h1-title app-title">Supports</h3>${skill.supports.map(detail).join("")}${skill.triggered.map(detail).join("")}</div>`);
    },
  },
  h2: {
    title: "H2 · Cards with the notes",
    text: "Two columns of cards: under each gem, the note of its author written out, and the levels of the skill.",
    draw: (rows, level, source) => stList(level, source, "st-h2", rows.map(skill => stCard({ ...skill, level }, { notes: true })).join("")),
  },
  h3: {
    title: "H3 · On the levels",
    text: "A line per gem, its bar from the level it comes to the level it goes, the level of the band a line across: when a gem comes, and how long it stays.",
    draw: (rows, level, source) => stList(level, source, "st-h3", `<div class="st-h3-scale app-number app-weak"><span></span><span class="st-bar-track">${[1, 25, 50, 75, 100].map(mark => `<span style="left:${mark - 1}%">${mark}</span>`).join("")}<span class="st-h3-now" style="left:${level - 0.5}%">${level}</span></span></div>
      ${rows.map(skill => `<div class="st-h3-skill">
        <div class="st-h3-line st-head" ${stSkillAttributes(skill)}><span>${stGem(skill, "st-gem st-skill")}${stNote(skill)}</span>${stBar(skill)}</div>
        ${[...skill.supports, ...skill.triggered].map(gem => `<div class="st-h3-line st-support" ${stSkillAttributes(skill, gem.kind !== "support")}><span>${stGem(gem)}${stNote(gem, skill)}</span>${stBar(gem)}</div>`).join("")}
      </div>`).join("")}<span class="st-h3-rule" style="--at:${level - 0.5}"></span>`),
  },
  e1: {
    title: "E1 · Linked sockets",
    text: "A large hexagon per skill, its supports hanging from it on a line, as the gems linked in an item of the game.",
    draw: (rows, level, source) => stList(level, source, "st-e1", rows.map(skill => stCard(skill, { sockets: true })).join("")),
  },
  e2: {
    title: "E2 · Heads in colour",
    text: "The head of each card in the colour of its skill, its supports as small labels tinted by theirs.",
    draw: (rows, level, source) => stList(level, source, "st-e2", rows.map(skill =>
      `<div class="st-e2-wrap" style="--gem:${gemColourOf(skill)}">${stCard(skill)}</div>`).join("")),
  },
  e3: {
    title: "E3 · What is new first",
    text: "What the level brings on top, in large cards; the other skills under it, each on a line, its supports in words.",
    draw: (rows, level, source) => {
      const fresh = rows.filter(row => row.isNew || row.supports.some(gem => gem.isNew));
      const rest = rows.filter(row => !fresh.includes(row));
      return stList(level, source, "st-e3", `${fresh.length ? `<h3 class="st-e3-title app-title">New at ${level}</h3><div class="st-e3-fresh">${fresh.map(skill => stCard(skill)).join("")}</div>` : ""}
        <h3 class="st-e3-title app-title is-rest">${fresh.length ? "The other skills" : `Nothing new at ${level}`}</h3>
        ${rest.map(skill => `<div class="st-e3-line"><span class="st-head" ${stSkillAttributes(skill)}>${stGem(skill, "st-gem st-skill")}${stNote(skill)}</span><span class="st-e3-supports">${skill.supports.map(gem =>
          `<span ${stSkillAttributes(skill)}>${stGem(gem)}</span>`).join("")}</span></div>`).join("")}`);
    },
  },
  f1: {
    title: "F1 · In words",
    text: "Each skill a sentence, large, its gems in their colours: « Spark with Pinpoint Critical, Fluke and Cold Mastery. »",
    draw: (rows, level, source) => stList(level, source, "st-f1", rows.map(stSentence).join("")),
  },
  f2: {
    title: "F2 · Constellations",
    text: "A tile per skill, its hexagon in the middle, its supports around it on a ring, each with its name.",
    draw: (rows, level, source) => stList(level, source, "st-f2", rows.map(skill => {
      const around = [...skill.supports, ...skill.triggered];
      return `<div class="st-f2-tile">
        <div class="st-f2-ring">${around.map((gem, index) => {
          const angle = (index / Math.max(around.length, 1)) * 2 * Math.PI - Math.PI / 2;
          return `<span class="st-f2-star" ${stSkillAttributes(skill, gem.kind !== "support")} style="left:${50 + 38 * Math.cos(angle)}%;top:${50 + 38 * Math.sin(angle)}%">${skillMark(gem)}<span class="st-name" data-gem="${escapeHtml(gem.name)}">${escapeHtml(gem.name)}</span></span>`;
        }).join("")}<span class="st-f2-core st-head" ${stSkillAttributes(skill)}>${skillMark(skill)}</span></div>
        <div class="st-head st-f2-name" ${stSkillAttributes(skill)}>${stGem(skill, "st-gem st-skill")}${stNote(skill)}</div>
      </div>`;
    }).join("")),
  },
  f3: {
    title: "F3 · A hand of cards",
    text: "Tall cards, as a hand of a card game: the gem large at the top, its name, its tags in small capitals, its supports under a line.",
    draw: (rows, level, source) => stList(level, source, "st-f3", rows.map(skill => `<article class="st-f3-card" style="--gem:${gemColourOf(skill)}">
      <div class="st-f3-art st-head" ${stSkillAttributes(skill)}>${skillMark(skill)}</div>
      <div class="st-head st-f3-name" ${stSkillAttributes(skill)}>${stGem(skill, "st-gem st-skill")}${stNote(skill)}</div>
      <p class="st-f3-tags">${skill.tags.slice(0, 4).map(escapeHtml).join(" · ")}</p>
      <ul class="st-supports">${skill.supports.map(gem => stSupport(gem, skill)).join("")}</ul>${stTriggered(skill)}
    </article>`).join("")),
  },
};

// The skill shown on the right of H1, chosen by a click on its row.
ACTIONS["st-choose"] = element => { STATE.stChosen = element.dataset.skill; return true; };

// The Skills tab at a level, in the variant chosen.
function skillsTab(level = STATE.level, source) {
  const variant = SKILLS_TAB_VARIANTS[chosen.skillsTab] ?? SKILLS_TAB_VARIANTS.n1;
  return `<div class="app-skills-tab">${variant.draw(stSkills(level, source), level, source)}</div>`;
}
