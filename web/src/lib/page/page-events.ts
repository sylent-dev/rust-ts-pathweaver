// The keys and the clicks heard anywhere on the page, wired once by the layout
// (docs/technical-choices.md, State of the interface). Only what reads the page lives here: what
// a key asks for is decided in page-keys.ts, what it changes in the modules of the state.

import { openBuilds } from './open-builds.svelte.ts';
import { commandOf } from './page-keys.ts';
import { popup } from './popup.svelte.ts';

/** The elements a text is typed or a value chosen in: the arrows are theirs. */
const FIELDS = 'input, textarea, select, [contenteditable]';

/** Whether an event comes from a field. */
function isInField(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest(FIELDS) !== null;
}

/** Whether an element is marked as belonging to a window or a menu (`popupArea`). */
function isPopupArea(node: EventTarget): node is HTMLElement {
	return node instanceof HTMLElement && node.dataset.popup !== undefined;
}

/** Hears a key pressed anywhere on the page. */
export function hearKey(event: KeyboardEvent): void {
	const command = commandOf({
		key: event.key,
		isModified: event.altKey || event.ctrlKey || event.metaKey || event.shiftKey,
		isInField: isInField(event.target)
	});
	if (command === undefined) {
		return;
	}
	switch (command.kind) {
		case 'close-popup':
			popup.close();
			return;
		case 'show-marker':
			// With no build shown, the arrows stay the browser's: they scroll a narrow window.
			if (openBuilds.shown !== undefined) {
				event.preventDefault();
				openBuilds.showMarker(command.side);
			}
			return;
		default:
			// A command added to `PageCommand` and not run here stops the type check.
			command satisfies never;
	}
}

/**
 * Hears a click anywhere on the page: closes the window or the menu open unless the click landed
 * in what belongs to it. The area is read from the path of the event, set when it left: an
 * element the click has taken off the page (a line removed from a list) is still on it.
 */
export function hearClick(event: MouseEvent): void {
	popup.closeUnlessClickedIn(event.composedPath().find(isPopupArea)?.dataset.popup);
}
