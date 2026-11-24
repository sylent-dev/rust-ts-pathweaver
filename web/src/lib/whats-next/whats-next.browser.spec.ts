// What's next in a real browser: its link opens the box over the page, with its two cards and
// their portraits, each item after a diamond on the middle of its small letters; ×, Esc and a
// click on the veil close it, the keyboard back on the link; the arrows leave the level as it is
// under it.

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
				...[...card.querySelectorAll('p, h2')].map((text) => text.textContent),
				[...card.querySelectorAll('li')].map((item) => item.textContent)
			])
		).toEqual([
			[
				'Version 2',
				'The Editor Update',
				'Plan your own build',
				[
					'Passives allocated on the tree',
					'Gems and their supports chosen',
					'Your hints, level by level',
					'Exported as a .build for the game'
				]
			],
			[
				'Version 3',
				'The Community Update',
				'Share it with every exile',
				[
					'Your builds published',
					'Short links, for a chat',
					'Votes and search, by ascendancy',
					'The versions of a build',
					'In French too'
				]
			]
		]);
	});

	it('sets each diamond on the middle of the small letters of its item', async () => {
		await link.click();

		await expect.element(box).toBeVisible();
		const offsets = [...box.element().querySelectorAll('li')].map((item) => {
			const diamond = item.querySelector('.diamond')?.getBoundingClientRect();
			// The baseline of the line of the diamond and a height of 1ex, from two boxes of its
			// font set just after it.
			const probe = document.createElement('span');
			probe.innerHTML =
				'<span style="display:inline-block;height:0"></span><span style="display:inline-block;height:1ex"></span>';
			item.querySelector('.diamond')?.after(probe);
			const [baseline, ex] = [...probe.children].map((box) => box.getBoundingClientRect());
			probe.remove();
			if (diamond === undefined || baseline === undefined || ex === undefined) {
				return Number.NaN;
			}
			return Math.abs(diamond.top + diamond.height / 2 - (baseline.top - ex.height / 2));
		});
		expect(offsets).toHaveLength(9);
		for (const offset of offsets) {
			expect(offset).toBeLessThan(1);
		}
	});

	it('heads each card with its portraits, from the game data', async () => {
		await link.click();

		await expect.poll(() => box.element().querySelectorAll('img').length).toBe(5);
		expect(
			[...box.element().querySelectorAll('article')].map((card) =>
				[...card.querySelectorAll('img')].map((image) =>
					/\/(\w+)-520[.-]/.exec(image.getAttribute('src') ?? '')?.at(1)
				)
			)
		).toEqual([['sorceress1'], ['huntress1', 'sorceress3', 'warrior2', 'sorceress1']]);
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

	it('keeps the box open when a press in it ends on the veil', async () => {
		await link.click();
		const dialog = box.element();
		const title = box.getByRole('heading', { name: 'The Editor Update' }).element();

		// A drag out of the panel: the click goes to the dialog, the parent of both ends.
		title.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		flushSync();

		await expect.element(box).toBeVisible();
	});

	it('follows the box closed by the browser itself', async () => {
		await link.click();
		const dialog = box.element();
		if (!(dialog instanceof HTMLDialogElement)) {
			throw new Error('the box is not a dialog');
		}

		dialog.close();

		await expect.element(box).not.toBeInTheDocument();
		await expect.element(link).toHaveAttribute('aria-expanded', 'false');
	});

	it('leaves the level of the build shown as it is under the box, wherever the keyboard is', async () => {
		openBuilds.open(openedBuild('Ember'));
		const showMarker = vi.spyOn(openBuilds, 'showMarker');
		await link.click();

		document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

		expect(showMarker).not.toHaveBeenCalled();
	});

	it('leaves the level of the build shown as it is under the box', async () => {
		openBuilds.open(openedBuild('Ember'));
		const showMarker = vi.spyOn(openBuilds, 'showMarker');
		await link.click();

		await userEvent.keyboard('{ArrowRight}');

		expect(showMarker).not.toHaveBeenCalled();
	});
});
