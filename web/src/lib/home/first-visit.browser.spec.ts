// The first visit in a real browser (specs.md, Window layout): what it says around its zone.

import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import '#lib/style/tokens.css';
import '#lib/style/base.css';
import { popup } from '#lib/page/popup.svelte.ts';
import FirstVisit from './FirstVisit.svelte';

/** The zone given to the page, a button that names itself. */
const zone = createRawSnippet(() => ({ render: () => '<button>The zone</button>' }));

let shown: ReturnType<typeof mount> | undefined;

beforeEach(async () => {
	await page.viewport(960, 900);
	shown = mount(FirstVisit, { target: document.body, props: { zone } });
	flushSync();
});

afterEach(() => {
	popup.close();
	flushSync();
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
});

describe('the first visit', () => {
	it('shows its title, the game named over it', async () => {
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Weave your path to level 100');
		await expect.element(page.getByText('Path of Exile 2', { exact: true })).toBeVisible();
	});

	it('draws the zone it is given, with the three things a build shows around it', async () => {
		await expect.element(page.getByRole('button', { name: 'The zone' })).toBeVisible();
		const notes = page.getByRole('listitem').elements();
		expect(notes.map((note) => note.textContent)).toEqual([
			'The passive tree',
			'The skills',
			'The gear'
		]);
	});

	it('leads to a new issue on GitHub from Report a bug, in a new tab', async () => {
		const link = page.getByRole('link', { name: 'Report a bug (opens in a new tab)' });
		await expect.element(link).toHaveTextContent('Report a bug');
		await expect
			.element(link)
			.toHaveAttribute('href', 'https://github.com/sylent-dev/rust-ts-pathweaver/issues/new');
		await expect.element(link).toHaveAttribute('target', '_blank');
	});

	it("opens the box of What's next from its link", async () => {
		await page.getByRole('button', { name: "What's next" }).click();

		await expect.element(page.getByRole('dialog', { name: "What's next" })).toBeVisible();
	});

	it('names the sources of the files at its foot, and that nothing leaves the browser', async () => {
		await expect
			.element(page.getByText(/^From Mobalytics · Maxroll · poe\.ninja · Path of Building · /))
			.toHaveTextContent('Your builds stay in this browser. Nothing is sent anywhere.');
	});

	it('keeps its notes beside the zone, never over it', async () => {
		const zoneBox = page
			.getByRole('button', { name: 'The zone' })
			.element()
			.getBoundingClientRect();
		const [tree, skills] = page
			.getByRole('listitem')
			.elements()
			.map((note) => note.getBoundingClientRect());
		expect(tree?.right).toBeLessThanOrEqual(zoneBox.left);
		expect(skills?.left).toBeGreaterThanOrEqual(zoneBox.right);
	});
});
