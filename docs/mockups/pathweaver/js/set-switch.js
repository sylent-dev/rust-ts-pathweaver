// The switch of the weapon set in the Inventory tab (2k2b): N2 and F3, kept of twelve variants at four
// temperatures (the owner, 2026-11-21; the others in the history of Git), chosen with the tabs « Set switch »
// (VARIANTS.setSwitch, js/page.js). Each changes STATE.inventorySet, as **Set I · Set II** of the right column
// (js/side-inventory.js), in the colours of the sets under the tree; a change of set plays its motion once
// (STATE.setMoved), none when the system asks for less motion. The right column of the Overview keeps its own.
// Set aside: the words of the column, tabs over the drawing, two trapezoids or one cut in two from the top,
// tabs on the weapons, the other weapon behind, tabs on the left edge, a switch with the key X, numerals,
// a dial.

const SET_SWITCHES = {
  n2: { title: "N2 · Two halves of a box", text: "A box in two halves at the right of the head, the set shown filled with its colour, without a line under it." },
  f3: { title: "F3 · Hanging tags", text: "Two tags hanging by a thread from the top of the tab; the set shown hangs lower in its colour and swings when it changes." },
};

const swName = set => `Set ${set === 1 ? "I" : "II"}`;
// A button of each set: its action, its colour class, pressed when shown.
const swBoth = () => [1, 2].map(set =>
  `<button type="button" class="sw-set is-set${set}" data-action="inventory-set" data-set="${set}" aria-pressed="${STATE.inventorySet === set}">${swName(set)}</button>`).join("");
// The class of a switch that plays its motion once, after a change of set.
const swMoved = () => (STATE.setMoved ? " is-moved" : "");

// The switch over the drawing, in the variant chosen.
const setSwitchHead = () => `<div class="${chosen.setSwitch === "f3" ? "sw-tags" : "sw-seg"}${swMoved()}">${swBoth()}</div>`;

AFTER_RENDER.push(() => { STATE.setMoved = false; });
