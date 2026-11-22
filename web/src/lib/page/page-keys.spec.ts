import { describe, expect, it } from 'vitest';
import { commandOf, type KeyPress } from './page-keys.ts';

/** A key pressed on the page, outside a field and with no key held unless said. */
function press(key: string, where: Partial<KeyPress> = {}): KeyPress {
	return { key, isModified: false, isInField: false, ...where };
}

describe('commandOf', () => {
	it('goes to the marker before and after the level with ← and →', () => {
		expect(commandOf(press('ArrowLeft'))).toEqual({ kind: 'show-marker', side: 'previous' });
		expect(commandOf(press('ArrowRight'))).toEqual({ kind: 'show-marker', side: 'next' });
	});

	it('leaves the arrows to the caret in a field', () => {
		expect(commandOf(press('ArrowLeft', { isInField: true }))).toBeUndefined();
		expect(commandOf(press('ArrowRight', { isInField: true }))).toBeUndefined();
	});

	it('leaves the arrows to the browser with a key held', () => {
		expect(commandOf(press('ArrowLeft', { isModified: true }))).toBeUndefined();
		expect(commandOf(press('ArrowRight', { isModified: true }))).toBeUndefined();
	});

	it('closes the window or the menu open with Esc, in a field too', () => {
		expect(commandOf(press('Escape'))).toEqual({ kind: 'close-popup' });
		expect(commandOf(press('Escape', { isInField: true }))).toEqual({ kind: 'close-popup' });
	});

	it('asks nothing for the other keys', () => {
		expect(['ArrowUp', 'ArrowDown', 'Enter', 'a', ' '].map((key) => commandOf(press(key)))).toEqual(
			[undefined, undefined, undefined, undefined, undefined]
		);
	});
});
