// The home page in a real browser: Paste JSON turns the drop zone into a field and back.

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
});
