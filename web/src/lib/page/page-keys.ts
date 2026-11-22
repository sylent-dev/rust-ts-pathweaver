// What a key pressed anywhere on the page asks for (see The level and Window layout in specs.md),
// decided without touching the page: the layout hears the keys (page-events.ts) and asks here.

import type { MarkerSide } from './open-builds.svelte.ts';

/** What a key asks of the page. */
export type PageCommand = { kind: 'close-popup' } | { kind: 'show-marker'; side: MarkerSide };

/** What the page reads of a key pressed. */
export interface KeyPress {
	/** The key, as a keyboard event names it (`key`). */
	key: string;
	/** Whether Alt, Ctrl, Cmd or Shift is held with it. */
	isModified: boolean;
	/** Whether it was pressed in a field. */
	isInField: boolean;
}

/**
 * What a key asks of the page, nothing for most. Esc closes the window or the menu open. ← and →
 * go to the marker before and after the level, but in a field, where they move the caret, and
 * with a key held, where they are a shortcut of the browser (Alt and ←: the page before).
 */
export function commandOf(press: KeyPress): PageCommand | undefined {
	if (press.key === 'Escape') {
		return { kind: 'close-popup' };
	}
	if (press.isModified || press.isInField) {
		return undefined;
	}
	switch (press.key) {
		case 'ArrowLeft':
			return { kind: 'show-marker', side: 'previous' };
		case 'ArrowRight':
			return { kind: 'show-marker', side: 'next' };
		default:
			return undefined;
	}
}
