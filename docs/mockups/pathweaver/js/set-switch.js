// The switch of the weapon set in the Inventory tab (2k2b): twelve variants, three at each of four
// temperatures (normal, high, explosive, free), chosen with the tabs « Set switch » (VARIANTS.setSwitch,
// js/page.js); among them the owner's idea, two trapezoids hanging from the top of the tab (H1). Every variant
// changes STATE.inventorySet, as **Set I · Set II** of the right column (js/side-inventory.js), in the
// colours of the sets under the tree; a change of set plays its motion once (STATE.setMoved), none when the
// system asks for less motion. The right column of the Overview keeps its own.

const SET_SWITCHES = {
  n1: { title: "N1 · The words of the column", text: "Set I · Set II without a box at the right of the head, the set shown in its colour, as in the right column." },
  n2: { title: "N2 · Two halves of a box", text: "A box in two halves at the right of the head, the set shown filled with its colour." },
  n3: { title: "N3 · Tabs over the drawing", text: "Two tabs centred over the drawing, a line in the colour of the set under the one shown." },
  h1: { title: "H1 · Two trapezoids from the top", text: "Two trapezoids hanging from the top of the tab over the drawing; the set shown drops lower, lit in its colour." },
  h2: { title: "H2 · One trapezoid in two", text: "One trapezoid from the top of the tab, cut in two; the colour of the set slides from one half to the other." },
  h3: { title: "H3 · Tabs on the weapons", text: "No switch over the drawing: two small tabs I and II on the top edge of the weapon and of the offhand, where the set changes something." },
  e1: { title: "E1 · The other weapon behind", text: "The weapon and the offhand of the other set peek from behind those shown, faded: a click on them swaps the sets, as the swap of the game." },
  e2: { title: "E2 · Tabs on the left edge", text: "Two trapezoids on the left edge of the tab, as the tabs of a binder; the set shown stands out in its colour." },
  e3: { title: "E3 · A switch and its key", text: "A switch whose knob slides from I to II, in the colour of the set, and X, the key of the swap of the game, which works on this page." },
  f1: { title: "F1 · Numerals", text: "I and II large at the top, engraved; the set shown lit in its colour, a light sweeping it when it changes." },
  f2: { title: "F2 · A dial", text: "A small dial between I and II, its needle turning to the set shown; a click turns it." },
  f3: { title: "F3 · Hanging tags", text: "Two tags hanging by a thread from the top of the tab; the set shown hangs lower in its colour and swings when it changes." },
};

const swName = set => `Set ${set === 1 ? "I" : "II"}`;
const swOther = set => (set === 1 ? 2 : 1);
// A button of a set: its action, its colour class, pressed when shown.
const swButton = (set, body = swName(set), className = "") =>
  `<button type="button" class="sw-set is-set${set} ${className}" data-action="inventory-set" data-set="${set}" aria-pressed="${STATE.inventorySet === set}" title="${swName(set)}">${body}</button>`;
const swBoth = (body, className) => [1, 2].map(set => swButton(set, body?.(set), className)).join("");
// The class of a switch that plays its motion once, after a change of set.
const swMoved = () => (STATE.setMoved ? " is-moved" : "");

// The head over the drawing, by variant: what it holds and the class of the tab.
function setSwitchHead() {
  const set = STATE.inventorySet;
  switch (chosen.setSwitch) {
    case "n2": return `<div class="sw-seg${swMoved()}">${swBoth()}</div>`;
    case "n3": return `<div class="sw-tabs${swMoved()}">${swBoth()}</div>`;
    case "h1": return `<div class="sw-trapezoids${swMoved()}">${swBoth()}</div>`;
    case "h2": return `<div class="sw-split is-at${set}${swMoved()}"><span class="sw-split-fill" aria-hidden="true"></span>${swBoth()}</div>`;
    case "h3": case "e2": return "";
    case "e1": return `<p class="sw-e1-hint app-weak"><span class="sw-e1-shown is-set${set}">${swName(set)}</span> · a click on the weapon behind swaps</p>`;
    case "e3": return `<div class="sw-toggle${swMoved()}">${swButton(1, "I", "sw-end")}<button type="button" class="sw-track is-at${set}" data-action="inventory-set" data-set="${swOther(set)}" aria-label="Swap to ${swName(swOther(set))}"><span class="sw-knob"></span></button>${swButton(2, "II", "sw-end")}<kbd class="sw-key" title="The key of the swap of the game">X</kbd></div>`;
    case "f1": return `<div class="sw-numerals${swMoved()}">${swBoth(s => (s === 1 ? "I" : "II"))}</div>`;
    case "f2": return `<div class="sw-dial-row${swMoved()}">${swButton(1, "I", "sw-dial-end")}<button type="button" class="sw-dial is-at${set}" data-action="inventory-set" data-set="${swOther(set)}" aria-label="Swap to ${swName(swOther(set))}"><span class="sw-needle"></span></button>${swButton(2, "II", "sw-dial-end")}</div>`;
    case "f3": return `<div class="sw-tags${swMoved()}">${swBoth(s => `<span class="sw-hole" aria-hidden="true"></span>${swName(s)}`)}</div>`;
    default: return inventorySetSwitch();
  }
}

// What a variant adds to the slots of the weapons (H3: its tabs; E1: the weapon of the other set behind).
function setSwitchSlot(id, hints) {
  const base = /^(Weapon|Offhand)[12]$/.exec(id)?.[1];
  if (!base) return {};
  if (chosen.setSwitch === "h3") return { className: "sw-has-tabs", html: `<span class="sw-slot-tabs">${swBoth(s => (s === 1 ? "I" : "II"))}</span>` };
  if (chosen.setSwitch !== "e1") return {};
  const other = swOther(STATE.inventorySet);
  const hint = hints.find(slot => slot.id === `${base}${other}`);
  const item = hint && hintItem(hint);
  return { className: `sw-has-behind${swMoved()}`, html: `<button type="button" class="sw-behind is-set${other}" data-action="inventory-set" data-set="${other}" title="${swName(other)}${item ? `: ${escapeHtml(item.name)}` : ""}">${item?.art ? itemArt(item) : ""}</button>` };
}

// The tabs on the left edge of the tab (E2).
const setSwitchEdge = () => (chosen.setSwitch === "e2" ? `<div class="sw-edge${swMoved()}">${swBoth(s => (s === 1 ? "I" : "II"))}</div>` : "");

// X swaps the sets (E3), as the swap of the weapons in the game, but not while a field takes the keys.
document.addEventListener("keydown", event => {
  if (chosen.setSwitch !== "e3" || event.key.toLowerCase() !== "x" || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest?.("input, textarea, [contenteditable]")) return;
  STATE.setMoved = true;
  STATE.inventorySet = swOther(STATE.inventorySet);
  renderSheet();
});
AFTER_RENDER.push(() => { STATE.setMoved = false; });
