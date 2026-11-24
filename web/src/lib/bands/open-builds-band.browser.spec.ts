// The band of the open builds in a real browser: a tab shows its build, its close button closes it
// and puts the keyboard on the tab of the build shown then; + chooses files; « +N ▾ » lists the
// builds without a tab.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { openBuilds } from '#lib/page/open-builds.svelte.ts';
import { opening } from '#lib/page/opening.svelte.ts';
import { popup } from '#lib/page/popup.svelte.ts';
import { openedBuild } from '#lib/page/opened-build.test-helper.ts';
import OpenBuildsBand from './OpenBuildsBand.svelte';

let shown: ReturnType<typeof mount> | undefined;

beforeEach(async () => {
	await page.viewport(1280, 900);
	for (const key of ['Ember', 'Frost', 'Storm']) {
		openBuilds.open(openedBuild(key));
	}
	shown = mount(OpenBuildsBand, { target: document.body });
	flushSync();
});

afterEach(() => {
	popup.close();
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
	for (const build of openBuilds.all) {
		openBuilds.close(build.contentKey);
	}
});

/** The names of the tabs, in their order, the one shown marked by a star. */
function tabNames(): string[] {
	return [...document.querySelectorAll<HTMLButtonElement>('nav button[aria-current]')].map(
		(button) =>
			`${button.textContent.trim()}${button.getAttribute('aria-current') === 'true' ? '*' : ''}`
	);
}

describe('the band of the open builds', () => {
	it('draws a tab per open build, in their order, the last opened shown', () => {
		expect(tabNames()).toEqual(['Ember', 'Frost', 'Storm*']);
	});

	it('shows the build of a tab clicked', async () => {
		await page.getByRole('button', { name: 'Frost', exact: true }).click();

		expect([openBuilds.shown?.contentKey, tabNames()]).toEqual([
			'Frost',
			['Ember', 'Frost*', 'Storm']
		]);
	});

	it('closes the build shown, the keyboard on the tab of the build before it, the last', async () => {
		await page.getByRole('button', { name: 'Close Storm' }).click();

		await expect.poll(() => document.activeElement?.textContent.trim()).toBe('Frost');
		expect(tabNames()).toEqual(['Ember', 'Frost*']);
	});

	it('closes a build not shown, the build shown kept, the keyboard on its tab', async () => {
		await page.getByRole('button', { name: 'Close Ember' }).click();

		await expect.poll(() => document.activeElement?.textContent.trim()).toBe('Storm');
		expect(tabNames()).toEqual(['Frost', 'Storm*']);
	});

	it('opens the chooser of files, several at once, on a click of +', async () => {
		const click = vi.spyOn(chooser(), 'click').mockImplementation(() => {});

		await page.getByRole('button', { name: 'Open .build files' }).click();

		expect([click.mock.calls.length, chooser().multiple]).toEqual([1, true]);
	});

	it('opens the builds chosen with +, the last shown', async () => {
		const files = new DataTransfer();
		files.items.add(new File(['{ "name": "Venom" }'], 'venom.build'));
		files.items.add(new File(['{ "name": "Blood" }'], 'blood.build'));
		const input = chooser();
		input.files = files.files;
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await opening.open([]);
		flushSync();

		expect(tabNames()).toEqual(['Ember', 'Frost', 'Storm', 'Venom', 'Blood*']);
	});
});

describe('« +N ▾ »', () => {
	/**
	 * Six builds in a window of 900 pixels: four tabs, two in the menu. Each build opened takes the
	 * place of the last tab, so that the menu holds Blood and Venom.
	 */
	async function sixInNarrowWindow(): Promise<void> {
		await page.viewport(900, 600);
		for (const key of ['Venom', 'Blood', 'Ash']) {
			openBuilds.open(openedBuild(key));
		}
		openBuilds.show('Ember');
		await expect.poll(tabNames).toEqual(['Ember*', 'Frost', 'Storm', 'Ash']);
	}

	it('lists the builds without a tab, in the order of the band', async () => {
		await sixInNarrowWindow();

		await page.getByRole('button', { name: '2 more builds' }).click();

		await expect.element(page.getByRole('list')).toHaveTextContent(/^\s*Blood\s*Venom\s*$/);
		expect(page.getByRole('button', { name: '2 more builds' }).element()).toHaveAttribute(
			'aria-expanded',
			'true'
		);
	});

	it('gives a build chosen the place of the last tab, the keyboard on it, the menu closed', async () => {
		await sixInNarrowWindow();
		await page.getByRole('button', { name: '2 more builds' }).click();

		await page.getByRole('button', { name: 'Blood' }).click();

		await expect.poll(() => document.activeElement?.textContent.trim()).toBe('Blood');
		expect([tabNames(), popup.openName]).toEqual([
			['Ember', 'Frost', 'Storm', 'Blood*'],
			undefined
		]);
	});

	it('leaves the page with its menu closed once every tab fits', async () => {
		await sixInNarrowWindow();
		await page.getByRole('button', { name: '2 more builds' }).click();

		await page.viewport(1280, 600);

		await expect.element(page.getByRole('button', { name: /more builds/ })).not.toBeInTheDocument();
		expect(popup.openName).toBeUndefined();
	});
});

/** The chooser of files + opens. */
function chooser(): HTMLInputElement {
	const input = document.querySelector('nav input[type="file"]');
	if (!(input instanceof HTMLInputElement)) {
		throw new Error('the band has no chooser of files');
	}
	return input;
}
