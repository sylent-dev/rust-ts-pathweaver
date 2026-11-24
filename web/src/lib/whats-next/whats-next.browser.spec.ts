// What's next in a real browser: its link opens the box over the page, with its two cards; ×,
// Esc and a click on the veil close it, the keyboard back on the link; the arrows leave the level
// as it is under it.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { openBuilds } from '#lib/page/open-builds.svelte.ts';
import { openedBuild } from '#lib/page/opened-build.test-helper.ts';
import { hearClick, hearKey } from '#lib/page/page-events.ts';
import { popup } from '#lib/page/popup.svelte.ts';
import WhatsNext from './WhatsNext.svelte';

let shown: ReturnType<typeof mount> | undefined;

beforeEach(async () => {
	await page.viewport(1280, 900);
	// The keys and the clicks of the page, as the layout hears them.
	document.addEventListener('keydown', hearKey);
	document.addEventListener('click', hearClick);
	shown = mount(WhatsNext, { target: document.body });
	flushSync();
});

afterEach(() => {
	popup.close();
	flushSync();
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
	document.removeEventListener('keydown', hearKey);
	document.removeEventListener('click', hearClick);
	for (const build of openBuilds.all) {
		openBuilds.close(build.contentKey);
	}
	vi.restoreAllMocks();
});

const link = page.getByRole('button', { name: "What's next" });
const box = page.getByRole('dialog', { name: "What's next" });

describe("What's next", () => {
	it('opens the box of the two updates to come, its link marked open', async () => {
		await link.click();

		await expect.element(box).toBeVisible();
		await expect.element(link).toHaveAttribute('aria-expanded', 'true');
		expect(
			[...box.element().querySelectorAll('article')].map((card) => [
				card.querySelector('p')?.textContent,
				card.querySelector('h2')?.textContent,
				card.querySelectorAll('li').length
			])
		).toEqual([
			['Version 2', 'The Editor Update', 4],
			['Version 3', 'The Community Update', 5]
		]);
	});

	it('closes with ×, the keyboard back on its link', async () => {
		await link.click();

		await box.getByRole('button', { name: 'Close' }).click();

		await expect.element(box).not.toBeInTheDocument();
		await expect.element(link).toHaveFocus();
		await expect.element(link).toHaveAttribute('aria-expanded', 'false');
	});

	it('closes with Esc, the keyboard back on its link', async () => {
		await link.click();

		await userEvent.keyboard('{Escape}');

		await expect.element(box).not.toBeInTheDocument();
		await expect.element(link).toHaveFocus();
	});

	it('closes with a click on the veil, not with a click in the box', async () => {
		await link.click();
		await box.getByRole('heading', { name: 'The Editor Update' }).click();
		const afterInside = popup.openName;

		// The top left corner of the window, on the veil, far from the box in its middle.
		await page.elementLocator(document.body).click({ position: { x: 5, y: 5 }, force: true });

		expect(afterInside).toBe('whats-next');
		await expect.element(box).not.toBeInTheDocument();
	});

	it('leaves the level of the build shown as it is under the box', async () => {
		openBuilds.open(openedBuild('Ember'));
		const showMarker = vi.spyOn(openBuilds, 'showMarker');
		await link.click();

		await userEvent.keyboard('{ArrowRight}');

		expect(showMarker).not.toHaveBeenCalled();
	});
});
