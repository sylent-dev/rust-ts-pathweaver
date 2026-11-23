// The keys and the clicks heard anywhere on the page (page-events.ts), sent by a real browser to
// a page wired as the layout wires it: each case of docs/technical-choices.md (State of the
// interface) and of The level in specs.md that only a page shows.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { openBuilds } from './open-builds.svelte.ts';
import { hearClick, hearKey } from './page-events.ts';
import { popup } from './popup.svelte.ts';

/** The page: a field, a window and its trigger, a button elsewhere, as the layout hears it. */
function showPage(): void {
	document.body.innerHTML = `
		<input aria-label="Pasted JSON" />
		<button type="button" data-popup="level-changes">3 changes</button>
		<div data-popup="level-changes"><button type="button">Inside</button></div>
		<button type="button">Elsewhere</button>`;
	document.addEventListener('keydown', hearKey);
	document.addEventListener('click', hearClick);
}

/** The element of the page with this text, or the field. */
function element(selector: string, text?: string): HTMLElement {
	const found = [...document.querySelectorAll<HTMLElement>(selector)].find(
		(candidate) => text === undefined || candidate.textContent === text
	);
	if (found === undefined) {
		throw new Error(`no ${selector} ${text ?? ''} on the page`);
	}
	return found;
}

/** Whether the next key pressed is left to the browser, its default not prevented. */
function nextKeyKeepsItsDefault(): Promise<boolean> {
	return new Promise((resolve) => {
		document.addEventListener('keydown', (event) => resolve(!event.defaultPrevented), {
			once: true
		});
	});
}

/** A build from level 1 to 100, with markers at 10 and 20, shown at level 15. */
function showBuild(): void {
	openBuilds.open({ contentKey: 'a', levels: { lowest: 1, highest: 100, markers: [10, 20] } });
	openBuilds.showLevel(15);
}

beforeEach(showPage);

afterEach(() => {
	document.removeEventListener('keydown', hearKey);
	document.removeEventListener('click', hearClick);
	document.body.innerHTML = '';
	popup.close();
	for (const build of openBuilds.all) {
		openBuilds.close(build.contentKey);
	}
});

describe('the arrows', () => {
	it('go to the marker before and after the level, the browser not scrolling', async () => {
		showBuild();
		const kept = nextKeyKeepsItsDefault();
		await userEvent.keyboard('{ArrowRight}');
		expect(await kept).toBe(false);
		expect(openBuilds.level).toBe(20);
		await userEvent.keyboard('{ArrowLeft}');
		expect(openBuilds.level).toBe(10);
	});

	it('move the caret in a field, not the level', async () => {
		showBuild();
		await userEvent.click(element('input'));
		const kept = nextKeyKeepsItsDefault();
		await userEvent.keyboard('{ArrowRight}');
		expect(await kept).toBe(true);
		expect(openBuilds.level).toBe(15);
	});

	it.each(['Alt', 'Control', 'Meta', 'Shift'])(
		'are a shortcut of the browser with %s held, not the level',
		async (held) => {
			showBuild();
			const kept = nextKeyKeepsItsDefault();
			await userEvent.keyboard(`{${held}>}{ArrowLeft}{/${held}}`);
			expect(await kept).toBe(true);
			expect(openBuilds.level).toBe(15);
		}
	);

	it('stay the browser’s with no build shown, which scroll a narrow window', async () => {
		const kept = nextKeyKeepsItsDefault();
		await userEvent.keyboard('{ArrowRight}');
		expect(await kept).toBe(true);
	});
});

describe('the window open', () => {
	it('closes with Esc, even in a field', async () => {
		popup.toggle('level-changes');
		await userEvent.click(element('input'));
		await userEvent.keyboard('{Escape}');
		expect(popup.openName).toBeUndefined();
	});

	it('stays open on a click in it', async () => {
		popup.toggle('level-changes');
		await userEvent.click(element('button', 'Inside'));
		expect(popup.openName).toBe('level-changes');
	});

	it('stays open on a click on its trigger, which belongs to it', async () => {
		popup.toggle('level-changes');
		await userEvent.click(element('button', '3 changes'));
		expect(popup.openName).toBe('level-changes');
	});

	it('closes on a click elsewhere', async () => {
		popup.toggle('level-changes');
		await userEvent.click(element('button', 'Elsewhere'));
		expect(popup.openName).toBeUndefined();
	});

	it('stays open on a click that takes what it landed on off the page', async () => {
		popup.toggle('level-changes');
		const inside = element('button', 'Inside');
		inside.addEventListener('click', () => inside.remove());
		await userEvent.click(inside);
		expect(popup.openName).toBe('level-changes');
	});
});
