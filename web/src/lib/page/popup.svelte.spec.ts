import { describe, expect, it } from 'vitest';
import { Popup } from './popup.svelte.ts';

describe('the window or the menu open over the page', () => {
	it('is none at first', () => {
		expect(new Popup().open).toBeUndefined();
	});

	it('is opened, then closed, by its trigger', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		expect(popup.open).toBe('builds-menu');
		popup.toggle('builds-menu');
		expect(popup.open).toBeUndefined();
	});

	// The mock-up kept a boolean per window: « +N ▾ » and « N changes » were open together.
	it('is closed by the opening of the other one', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		popup.toggle('level-changes');
		expect(popup.open).toBe('level-changes');
		popup.toggle('builds-menu');
		expect(popup.open).toBe('builds-menu');
	});

	it('is closed by Esc, which changes nothing when none is open', () => {
		const popup = new Popup();
		popup.toggle('level-changes');
		popup.close();
		expect(popup.open).toBeUndefined();
		popup.close();
		expect(popup.open).toBeUndefined();
	});
});

// The page hears a click after the trigger it landed on: each case replays them in that order.
describe('a click anywhere on the page', () => {
	it('closes the one open when it lands outside it', () => {
		const popup = new Popup();
		popup.toggle('level-changes');
		popup.closeFromOutside(undefined);
		expect(popup.open).toBeUndefined();
	});

	it('keeps the one open when it lands in its trigger or its window', () => {
		const popup = new Popup();
		popup.toggle('level-changes');
		popup.closeFromOutside('level-changes');
		expect(popup.open).toBe('level-changes');
	});

	it('keeps closed the one its trigger has just closed', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		popup.toggle('builds-menu');
		popup.closeFromOutside('builds-menu');
		expect(popup.open).toBeUndefined();
	});

	it('closes the one open when it lands in what belongs to the other', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		popup.closeFromOutside('level-changes');
		expect(popup.open).toBeUndefined();
	});

	it('leaves the other one open when its trigger was clicked while one was open', () => {
		const popup = new Popup();
		popup.toggle('builds-menu');
		popup.toggle('level-changes');
		popup.closeFromOutside('level-changes');
		expect(popup.open).toBe('level-changes');
	});
});
