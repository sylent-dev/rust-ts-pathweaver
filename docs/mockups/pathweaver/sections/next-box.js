// The box of What's next (2k6): twelve ways, three at each of four temperatures (normal, high, explosive,
// free), each in the page of the build shown at 960 px, open at first; a click on What's next closes it and opens
// it again, to see it come; Esc, a click outside, or × closes it. The markup of each way here, its look and its
// motion in css/next-variants.css.
STATE.nextOpen = "all";

const nextHead = '<p class="nx-kicker">What\'s next</p>';
const nextFoot = `<p class="nx-foot">${NEXT_FOOT}</p>`;
const nextClose = `<button type="button" class="nx-close" data-action="next-close" aria-label="Close">${icon(12, ICONS.close)}</button>`;

// Where each way opens: under the link (« link ») or in the middle of the window over a veil (« middle »).
const NEXT_WAYS = {
  v1: { place: "link", title: "Normal · V1 · Twins: two cards under the link, coming down one after the other",
    body: () => `${nextHead}<div class="nx-cards">${updateCards()}</div>${nextFoot}` },
  v2: { place: "link", title: "Normal · V2 · The road: version 1 « you are here », then the two updates on one line",
    body: () => `${nextHead}<ol class="nx-road"><li class="nx-stop is-now"><span class="nx-dot"></span><b>Version 1 · The viewer</b><span>You are here</span></li>
      ${UPDATES.map((update, index) => `<li class="nx-stop" style="--i:${index + 1}"><span class="nx-dot"></span>${updateCard(update, index)}</li>`).join("")}</ol>` },
  v3: { place: "middle", title: "Normal · V3 · Two halves: one panel, its halves opening from the seam",
    body: () => `${nextClose}<div class="nx-halves">${updateCards()}</div>${nextFoot}` },
  v4: { place: "link", title: "High · V4 · Dealt: the cards dealt from the link, fanned; the pointer straightens one",
    body: () => `<div class="nx-cards">${updateCards()}</div>` },
  v5: { place: "middle", title: "High · V5 · Turned over: two cards face down, Pathweaver's mark on their backs, turned one after the other",
    body: () => `${nextClose}${nextHead}<div class="nx-cards">${updateCards({ back: true })}</div>${nextFoot}` },
  v6: { place: "middle", title: "High · V6 · Foil: a gleam crosses each card as it comes; the pointer tilts it and moves its gleam",
    body: () => `${nextClose}${nextHead}<div class="nx-cards">${updateCards()}</div>${nextFoot}` },
  v7: { place: "link", title: "Explosive · V7 · Burst: the box bursts out of the link with its flash, the cards fly out of it",
    body: () => `${nextHead}<div class="nx-cards">${updateCards()}</div>${nextFoot}` },
  v8: { place: "middle", title: "Explosive · V8 · The path: passives light up one by one from version 1, each update a notable that opens",
    body: () => `${nextClose}<svg class="nx-path" viewBox="0 0 840 450" aria-hidden="true">
        ${[[40, 400], [120, 380], [200, 396], [290, 372], [370, 388], [450, 366], [540, 382], [620, 362], [680, 376]].map(([x, y], i) =>
          `<circle class="nx-node" style="--n:${i}" cx="${x}" cy="${y}" r="${i % 4 === 0 ? 9 : 5}"/>`).join("")}
        <path class="nx-path-line" d="M40 400 L120 380 L200 396 L290 372 L370 388 L450 366 L540 382 L620 362 L680 376"/>
      </svg>
      <p class="nx-path-start">${passiveIcon(0, 34)}<b>Version 1</b> · you are here</p>
      <div class="nx-cards">${updateCards()}</div>` },
  v9: { place: "middle", title: "Explosive · V9 · Shock wave: a ring of the accent from the middle, the cards thrown up from it, icons of passives rising",
    body: () => `${nextClose}<span class="nx-wave"></span><span class="nx-wave is-second"></span>
      <div class="nx-motes">${Array.from({ length: 14 }, (_, i) => `<span style="--m:${i};left:${(i * 53) % 100}%">${passiveIcon(i, 18 + (i % 3) * 6)}</span>`).join("")}</div>
      ${nextHead}<div class="nx-cards">${updateCards()}</div>${nextFoot}` },
  v10: { place: "middle", title: "Free · V10 · The poster: the numbers 2 and 3 huge behind the cards, sliding in from both sides, « Coming » stamped",
    body: () => `${nextClose}<span class="nx-numeral is-2">2</span><span class="nx-numeral is-3">3</span>
      <div class="nx-cards">${updateCards()}</div><span class="nx-stamp">Coming</span>` },
  v11: { place: "band", title: "Free · V11 · Level up: Pathweaver on its own level band, the cursor going from 1 to 2 then 3, each update popping at its marker",
    body: () => `<div class="nx-level"><div class="nx-level-now"><span>Version</span><b class="nx-level-number"><i>1</i><i>2</i><i>3</i></b></div>
      <div class="nx-level-track"><span class="nx-level-line"></span><span class="nx-level-mark" style="left:0"></span><span class="nx-level-mark" style="left:50%"></span><span class="nx-level-mark" style="left:100%"></span><span class="nx-level-cursor"></span>
        <span class="nx-level-end" style="left:0">The viewer</span></div></div>
      <div class="nx-cards">${updateCards()}</div>` },
  v12: { place: "middle", title: "Free · V12 · A peek: the cards under a veil of graph paper, the pointer clearing a circle through it; a click lifts it all",
    body: () => `${nextClose}${nextHead}<div class="nx-cards">${updateCards()}</div>
      <button type="button" class="nx-veil-paper" data-action="next-peek"><span>Move to peek · click to see it all</span></button>${nextFoot}` },
};

const nextWindow = way => {
  const open = STATE.nextOpen === "all" || STATE.nextOpen === way;
  const { place, body } = NEXT_WAYS[way];
  return `<div class="app-window" data-next-case="${way}" style="width:960px;height:600px">
    ${appBar(960, { menu: false })}${buildHeader()}${levelBand()}${buildTabs("overview")}
    ${open && place === "middle" ? '<div class="nx-veil"></div>' : ""}
    ${open ? `<div class="nx ${way} is-${place}" role="dialog" aria-label="What's next">${body()}</div>` : ""}
  </div>`;
};

addSection(() => ["The box of What's next · The Editor Update and The Community Update, two cards: twelve ways at four temperatures (click What's next to see one come again)",
  Object.entries(NEXT_WAYS).map(([way, { title }]) => [title, nextWindow(way)])]);
