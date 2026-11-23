// The field of Paste JSON in a real browser, the core loaded: a paste opens the build at once, a
// text refused stays with its reason, Esc gives the zone back.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { openBuilds } from '#lib/page/open-builds.svelte.ts';
import { opening } from '#lib/page/opening.svelte.ts';
import PasteField from './PasteField.svelte';

const onback = vi.fn<() => void>();
let shown: ReturnType<typeof mount> | undefined;

beforeEach(() => {
	onback.mockClear();
	shown = mount(PasteField, { target: document.body, props: { onback } });
	flushSync();
});

afterEach(() => {
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
	for (const build of openBuilds.all) {
		openBuilds.close(build.contentKey);
	}
});

/** The field. */
function field(): HTMLTextAreaElement {
	const element = page.getByRole('textbox', { name: 'The JSON of a build' }).element();
	if (!(element instanceof HTMLTextAreaElement)) {
		throw new Error('the field is not a textarea');
	}
	return element;
}

/** Pastes this text in the field, as the keyboard does, and waits for it to open. */
async function paste(text: string): Promise<void> {
	const clipboardData = new DataTransfer();
	clipboardData.setData('text/plain', text);
	field().dispatchEvent(
		new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true })
	);
	await opening.openText('');
	flushSync();
}

describe('the field of Paste JSON', () => {
	it('takes the caret at once, and says what to do while it is empty', async () => {
		expect(document.activeElement).toBe(field());
		await expect
			.element(page.getByRole('textbox'))
			.toHaveAccessibleDescription(
				'Paste the JSON of a build Ctrl+V: it opens at once · Esc: back to the files'
			);
		await expect.element(page.getByText('Paste the JSON of a build')).toBeVisible();
	});

	it('opens the build pasted at once, and shows it', async () => {
		await paste('{ "name": "Pasted", "author": "Someone" }');

		expect(openBuilds.shown?.name).toBe('Pasted');
		await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
	});

	it('keeps a text refused, its reason at its foot, until the next paste', async () => {
		await paste('{\n  "name": "Cut",\n  "levels": [');

		expect(field().value).toBe('{\n  "name": "Cut",\n  "levels": [');
		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent("This text isn't valid JSON at line 3");
		await expect.element(page.getByText('Paste the JSON of a build')).not.toBeVisible();

		await paste('{ "name": "Whole" }');

		expect(openBuilds.shown?.name).toBe('Whole');
		await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
	});

	it('puts the text pasted in place of the one in the field', async () => {
		await userEvent.type(field(), 'notes');

		await paste('{ "name": "Pasted" }');

		expect(field().value).toBe('{ "name": "Pasted" }');
	});

	it('gives the zone back on Esc', async () => {
		await userEvent.keyboard('{Escape}');

		expect(onback).toHaveBeenCalledOnce();
	});
});
