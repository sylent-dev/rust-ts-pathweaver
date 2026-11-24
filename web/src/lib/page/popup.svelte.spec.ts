import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { coversPage, Popup, popupArea } from './popup.svelte.ts';

describe('the window or the menu open over the page', () => {
	it('is none at first', () => {
		expect(new Popup().openName).toBeUndefined();
	});

	it('is opened, then closed, by its trigger', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		expect(popup.openName).toBe('builds-menu');
		popup.toggle('builds-menu');
		expect(popup.openName).toBeUndefined();
	});

	// The mock-up kept a boolean per window: « +N ▾ » and « N changes » were open together.
	it('is closed by the opening of the other one', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		popup.toggle('level-changes');
		expect(popup.openName).toBe('level-changes');
		popup.toggle('builds-menu');
		expect(popup.openName).toBe('builds-menu');
	});

	it('is closed by Esc, which changes nothing when none is open', () => {
		const popup = new Popup();
		popup.toggle('level-changes');
		popup.close();
		expect(popup.openName).toBeUndefined();
		popup.close();
		expect(popup.openName).toBeUndefined();
	});
});

// The page hears a click after the trigger it landed on: each case replays them in that order,
// then the last ones the other way round.
describe('a click anywhere on the page', () => {
	it('closes the one open when it lands outside it', () => {
		const popup = new Popup();
		popup.toggle('level-changes');
		popup.closeUnlessClickedIn(undefined);
		expect(popup.openName).toBeUndefined();
	});

	it('keeps the one open when it lands in its trigger or its window', () => {
		const popup = new Popup();
		popup.toggle('level-changes');
		popup.closeUnlessClickedIn('level-changes');
		expect(popup.openName).toBe('level-changes');
	});

	it('keeps closed the one its trigger has just closed', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		popup.toggle('builds-menu');
		popup.closeUnlessClickedIn('builds-menu');
		expect(popup.openName).toBeUndefined();
	});

	it('closes the one open when it lands in what belongs to the other', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		popup.closeUnlessClickedIn('level-changes');
		expect(popup.openName).toBeUndefined();
	});

	it('leaves the other one open when its trigger was clicked while one was open', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		popup.toggle('level-changes');
		popup.closeUnlessClickedIn('level-changes');
		expect(popup.openName).toBe('level-changes');
	});

	it('ends the same when the page hears the click before the trigger', () => {
		const opening = new Popup();
		opening.closeUnlessClickedIn('level-changes');
		opening.toggle('level-changes');
		expect(opening.openName).toBe('level-changes');

		const closing = new Popup();
		closing.toggle('builds-menu');
		closing.closeUnlessClickedIn('builds-menu');
		closing.toggle('builds-menu');
		expect(closing.openName).toBeUndefined();

		const switching = new Popup();
		switching.toggle('builds-menu');
		switching.closeUnlessClickedIn('level-changes');
		switching.toggle('level-changes');
		expect(switching.openName).toBe('level-changes');
	});
});

describe('isOpen', () => {
	it('says which one is open, and no other', () => {
		const popup = new Popup();
		popup.toggle('level-changes');
		expect([popup.isOpen('level-changes'), popup.isOpen('builds-menu')]).toEqual([true, false]);
		popup.close();
		expect([popup.isOpen('level-changes'), popup.isOpen('builds-menu')]).toEqual([false, false]);
	});

	// What a component reads in its markup is read here in an effect: the state must tell it.
	it('tells whoever reads it when a window opens or closes', () => {
		const popup = new Popup();
		const seen: boolean[] = [];
		$effect.root(() => {
			$effect(() => {
				seen.push(popup.isOpen('level-changes'));
			});
		});
		flushSync();
		popup.toggle('level-changes');
		flushSync();
		popup.toggle('builds-menu');
		flushSync();
		expect(seen).toEqual([false, true, false]);
	});
});

describe('popupArea', () => {
	it('marks an element with the name of its window or menu', () => {
		expect(popupArea('builds-menu')).toEqual({ 'data-popup': 'builds-menu' });
	});
});

describe('coversPage', () => {
	it("covers the page with the box of What's next only, not with a menu or a window", () => {
		expect(
			(['whats-next', 'builds-menu', 'level-changes'] as const).map((name) => coversPage(name))
		).toEqual([true, false, false]);
	});
});
