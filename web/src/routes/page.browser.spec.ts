// The home page in a real browser: Paste JSON turns the drop zone into a field and back, and the
// page given back once every build is closed.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { fileDrop } from '#lib/page/file-drop.svelte.ts';
import { openBuilds } from '#lib/page/open-builds.svelte.ts';
import { opening } from '#lib/page/opening.svelte.ts';
import Page from './+page.svelte';

let shown: ReturnType<typeof mount> | undefined;

beforeEach(async () => {
	await page.viewport(1280, 900);
	shown = mount(Page, { target: document.body });
	flushSync();
});

afterEach(async () => {
	// A build opened, then closed, so that the zone of the next test refuses nothing.
	await opening.open([new File(['{ "name": "Next" }'], 'next.build')]);
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
	for (const build of openBuilds.all) {
		openBuilds.close(build.contentKey);
	}
});

/** Files dropped on the page, as the system drops them, opened as the layout opens them. */
function drop(files: File[]): void {
	const dataTransfer = new DataTransfer();
	for (const file of files) {
		dataTransfer.items.add(file);
	}
	const event = new DragEvent('drop', { dataTransfer, cancelable: true });
	window.dispatchEvent(event);
	fileDrop.drop(event);
}

describe('Paste JSON', () => {
	it('turns the zone into the field, and Drop a file instead gives it back', async () => {
		await page.getByRole('button', { name: 'Paste JSON' }).click();

		await expect.element(page.getByRole('textbox', { name: 'The JSON of a build' })).toBeVisible();

		await page.getByRole('button', { name: 'Drop a file instead' }).click();

		await expect.element(page.getByRole('textbox')).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Add your first build/ })).toBeVisible();
	});

	it('gives the zone back on Esc, the keyboard on Paste JSON', async () => {
		await page.getByRole('button', { name: 'Paste JSON' }).click();

		await userEvent.keyboard('{Escape}');

		await expect.element(page.getByRole('textbox')).not.toBeInTheDocument();
		expect(document.activeElement).toBe(page.getByRole('button', { name: 'Paste JSON' }).element());
	});

	it('gives the zone back to files dropped, which says why none of them opens', async () => {
		await page.getByRole('button', { name: 'Paste JSON' }).click();

		drop([new File([new Uint8Array([0x89, 0x50])], 'passive-tree.png')]);
		await opening.open([]);

		await expect.element(page.getByRole('textbox')).not.toBeInTheDocument();
		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent("That isn't a .build file passive-tree.png isn't a text file");
	});

	it('shows a build pasted without the files refused before it', async () => {
		await opening.open([new File([new Uint8Array([0x89, 0x50])], 'passive-tree.png')]);
		await page.getByRole('button', { name: 'Paste JSON' }).click();
		const clipboardData = new DataTransfer();
		clipboardData.setData('text/plain', '{ "name": "Pasted" }');

		page
			.getByRole('textbox')
			.element()
			.dispatchEvent(
				new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true })
			);
		await opening.open([]);

		await expect.element(page.getByRole('heading', { name: 'Pasted' })).toBeVisible();
		await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
	});

	it('gives the zone back, not the field, once the build pasted is closed', async () => {
		await page.getByRole('button', { name: 'Paste JSON' }).click();
		const clipboardData = new DataTransfer();
		clipboardData.setData('text/plain', '{ "name": "Pasted" }');
		page
			.getByRole('textbox')
			.element()
			.dispatchEvent(
				new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true })
			);
		await opening.open([]);

		await page.getByRole('button', { name: 'Close Pasted' }).click();

		await expect.element(page.getByRole('button', { name: /Add your first build/ })).toBeVisible();
		await expect.element(page.getByRole('textbox')).not.toBeInTheDocument();
	});
});

describe('the bands of the page of a build', () => {
	it('draws none at the first visit', async () => {
		await expect.element(page.getByRole('banner')).not.toBeInTheDocument();
		await expect
			.element(page.getByRole('navigation', { name: 'Open builds' }))
			.not.toBeInTheDocument();
	});

	it('draws the band of the site over the band of the open builds once a build opens', async () => {
		await opening.open([new File(['{ "name": "Ember" }'], 'ember.build')]);

		const site = page.getByRole('banner').element();
		const builds = page.getByRole('navigation', { name: 'Open builds' }).element();
		expect(site.compareDocumentPosition(builds) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
	});

	it('gives the band of the site the brand and Report a bug, which opens a new issue in a new tab', async () => {
		await opening.open([new File(['{ "name": "Ember" }'], 'ember.build')]);

		const band = page.getByRole('banner');
		await expect.element(band.getByText('Pathweaver')).toBeVisible();
		const report = band.getByRole('link', { name: 'Report a bug (opens in a new tab)' });
		await expect
			.element(report)
			.toHaveAttribute('href', 'https://github.com/sylent-dev/rust-ts-pathweaver/issues/new');
		await expect.element(report).toHaveAttribute('target', '_blank');
	});
});
