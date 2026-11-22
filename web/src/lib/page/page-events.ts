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

/** Hears a key pressed anywhere on the page. */
export function hearKey(event: KeyboardEvent): void {
	const command = commandOf({
		key: event.key,
		isModified: event.altKey || event.ctrlKey || event.metaKey || event.shiftKey,
		isInField: isInField(event.target)
	});
	switch (command?.kind) {
		case undefined:
			return;
		case 'close-popup':
			popup.close();
			return;
		case 'show-marker':
			// With no build shown, the arrows stay the browser's: they scroll a narrow window.
			if (openBuilds.shown !== undefined) {
				event.preventDefault();
				openBuilds.showMarker(command.side);
			}
	}
}

/**
 * Hears a click anywhere on the page, after its trigger: closes the window or the menu open
 * unless the click landed in what belongs to it, an element under `data-popup="<its name>"`.
 */
export function hearClick(event: MouseEvent): void {
	const { target } = event;
	const area = target instanceof Element ? target.closest<HTMLElement>('[data-popup]') : null;
	popup.closeFromOutside(area?.dataset.popup);
}
