// The drop zone of the first visit in a real browser: a click chooses the files, the files over
// the page light it, and it says why when none of the files opens.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { fileDrop } from '#lib/page/file-drop.svelte.ts';
import { opening } from '#lib/page/opening.svelte.ts';
import { openBuilds } from '#lib/page/open-builds.svelte.ts';
import DropZone from './DropZone.svelte';

let shown: ReturnType<typeof mount> | undefined;

beforeEach(async () => {
	// The width of the zone follows that of the window.
	await page.viewport(960, 900);
	shown = mount(DropZone, { target: document.body });
	flushSync();
});

afterEach(async () => {
	// A build opened, then closed, so that the zone of the next test refuses nothing.
	await opening.open([new File(['{ "name": "Next" }'], 'next.build')]);
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

/** An image, which isn't text. */
const image = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'passive-tree.png');

/** Chooses these files, as the chooser of the system gives them, and waits for them to open. */
async function choose(files: File[]): Promise<void> {
	const input = chooser();
	input.files = filesTransfer(files).files;
	input.dispatchEvent(new Event('change', { bubbles: true }));
	await opening.open([]);
	flushSync();
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

	it('says to let go while files are over the page, and how many, in the same elements', async () => {
		const title = document.querySelector('.zone strong');
		fileDrop.enter(
			new DragEvent('dragenter', {
				dataTransfer: filesTransfer([new File([''], 'a.build'), new File([''], 'b.build')])
			})
		);

		await expect
			.element(page.getByRole('button', { name: /Let go to open it/ }))
			.toHaveTextContent('2 files over the page');
		expect(document.querySelector('.zone strong')).toBe(title);
	});
});

describe('the drop zone that refuses', () => {
	it('says a file that isn’t text isn’t a .build file, its call at its foot', async () => {
		await choose([image]);

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent("That isn't a .build file passive-tree.png isn't a text file");
		await expect
			.element(page.getByRole('button'))
			.toHaveAccessibleName('Drop a .build file here, or click to choose it');
		await expect.element(page.getByText('Add your first build')).not.toBeVisible();
	});

	it('says the line where the JSON of a file breaks', async () => {
		await choose([new File(['{\n  "name": "A",,\n}'], 'broken.build')]);

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent("That build can't be read broken.build isn't valid JSON at line 2");
	});

	it('lists four files refused, and of more the first three and how many more', async () => {
		const files = [1, 2, 3, 4, 5, 6, 7].map((number) => new File(['Act 1'], `${number}.txt`));

		await choose(files.slice(0, 4));
		expect(
			page
				.getByRole('listitem')
				.elements()
				.map((line) => line.textContent)
		).toEqual([
			"1.txt isn't valid JSON at line 1",
			"2.txt isn't valid JSON at line 1",
			"3.txt isn't valid JSON at line 1",
			"4.txt isn't valid JSON at line 1"
		]);
		await expect.element(page.getByText("These files can't be read")).toBeVisible();

		await choose(files);
		expect(
			page
				.getByRole('listitem')
				.elements()
				.map((line) => line.textContent)
		).toEqual([
			"1.txt isn't valid JSON at line 1",
			"2.txt isn't valid JSON at line 1",
			"3.txt isn't valid JSON at line 1",
			'and 4 more'
		]);
	});

	it('refuses nothing when a build of the files opens', async () => {
		await choose([image, new File(['{ "name": "A" }'], 'a.build')]);

		await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
		await expect.element(page.getByText('Add your first build')).toBeVisible();
	});

	it('opens the chooser on a click over its reasons', async () => {
		await choose([image]);
		const click = vi.spyOn(chooser(), 'click').mockImplementation(() => {});

		await page.getByText("That isn't a .build file").click({ force: true });

		expect(click).toHaveBeenCalledOnce();
	});

	it('gives way to the files over the page, its reasons faded', async () => {
		await choose([image]);
		fileDrop.enter(
			new DragEvent('dragenter', { dataTransfer: filesTransfer([new File([''], 'a.build')]) })
		);

		await expect.element(page.getByText('Let go to open it')).toBeVisible();
		await expect.element(page.getByRole('alert')).toHaveStyle({ opacity: '0' });
	});
});
