// The drop zone of the first visit in a real browser: a click chooses the files, the files over
// the page light it.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { fileDrop } from '#lib/page/file-drop.svelte.ts';
import { openBuilds } from '#lib/page/open-builds.svelte.ts';
import DropZone from './DropZone.svelte';

let shown: ReturnType<typeof mount> | undefined;

beforeEach(() => {
	shown = mount(DropZone, { target: document.body });
	flushSync();
});

afterEach(() => {
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
	// Files that leave the window leave the page dark for the next test.
	fileDrop.leave(
		new DragEvent('dragleave', { dataTransfer: filesTransfer([new File([''], 'a.build')]) })
	);
	for (const build of openBuilds.all) {
		openBuilds.close(build.contentKey);
	}
});

/** What a drag of these files carries. */
function filesTransfer(files: File[]): DataTransfer {
	const dataTransfer = new DataTransfer();
	for (const file of files) {
		dataTransfer.items.add(file);
	}
	return dataTransfer;
}

/** The chooser of files the zone opens. */
function chooser(): HTMLInputElement {
	const input = document.querySelector('input[type="file"]');
	if (!(input instanceof HTMLInputElement)) {
		throw new Error('the zone has no chooser of files');
	}
	return input;
}

describe('the drop zone', () => {
	it('is a button that says what to do', async () => {
		await expect
			.element(page.getByRole('button', { name: /Add your first build/ }))
			.toHaveTextContent('Drop a .build file here, or click to choose it');
	});

	it('opens the chooser of files, several at once, on a click and on Enter', async () => {
		const click = vi.spyOn(chooser(), 'click').mockImplementation(() => {});
		expect(chooser().multiple).toBe(true);

		await page.getByRole('button').click();
		page.getByRole('button').element().focus();
		await userEvent.keyboard('{Enter}');

		expect(click).toHaveBeenCalledTimes(2);
	});

	it('opens the files chosen, and lets the same file be chosen again', async () => {
		const input = chooser();
		input.files = filesTransfer([
			new File(['{ "name": "A" }'], 'a.build'),
			new File(['{ "name": "B" }'], 'b.build')
		]).files;

		input.dispatchEvent(new Event('change', { bubbles: true }));

		await expect.poll(() => openBuilds.all.map((build) => build.name)).toEqual(['A', 'B']);
		expect(input.value).toBe('');
	});

	it('says to let go while files are over the page, and how many', async () => {
		fileDrop.enter(
			new DragEvent('dragenter', {
				dataTransfer: filesTransfer([new File([''], 'a.build'), new File([''], 'b.build')])
			})
		);

		await expect
			.element(page.getByRole('button', { name: /Let go to open it/ }))
			.toHaveTextContent('2 files over the page');
	});
});
