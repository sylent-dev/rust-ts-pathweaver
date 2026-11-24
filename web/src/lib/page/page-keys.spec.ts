import { describe, expect, it } from 'vitest';
import { commandOf, type KeyPress } from './page-keys.ts';

/** A key pressed on the page, outside a field and a box, with no key held unless said. */
function press(key: string, where: Partial<KeyPress> = {}): KeyPress {
	return { key, isModified: false, isInField: false, isInBox: false, ...where };
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

	it('leaves the level as it is under a box over the page', () => {
		expect(commandOf(press('ArrowLeft', { isInBox: true }))).toBeUndefined();
		expect(commandOf(press('ArrowRight', { isInBox: true }))).toBeUndefined();
	});

	it('leaves the arrows to the browser with a key held', () => {
		expect(commandOf(press('ArrowLeft', { isModified: true }))).toBeUndefined();
		expect(commandOf(press('ArrowRight', { isModified: true }))).toBeUndefined();
	});

	it('closes the window, the menu or the box open with Esc, in a field and in a box too', () => {
		expect(commandOf(press('Escape'))).toEqual({ kind: 'close-popup' });
		expect(commandOf(press('Escape', { isInField: true }))).toEqual({ kind: 'close-popup' });
		expect(commandOf(press('Escape', { isInBox: true }))).toEqual({ kind: 'close-popup' });
	});

	it('asks nothing for the other keys', () => {
		expect(['ArrowUp', 'ArrowDown', 'Enter', 'a', ' '].map((key) => commandOf(press(key)))).toEqual(
			[undefined, undefined, undefined, undefined, undefined]
		);
	});
});
