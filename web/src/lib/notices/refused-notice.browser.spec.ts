// The notice of the files refused in a real browser: a line each, its name then its reason, four
// at most, and its close button.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import type { RefusedRead } from '#lib/page/opening.svelte.ts';
import RefusedNotice from './RefusedNotice.svelte';

let shown: ReturnType<typeof mount> | undefined;

/** Takes the notice drawn off the page. */
function removeNotice(): void {
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
}

afterEach(removeNotice);

/** A file refused as not text, of this name. */
function notText(fileName: string): RefusedRead {
	return { kind: 'refused', fileName, refusal: { reason: 'notText' } };
}

/** Draws the notice of these files refused, its close button calling `onclose`. */
function showNotice(refused: RefusedRead[], onclose = () => {}): void {
	shown = mount(RefusedNotice, { target: document.body, props: { refused, onclose } });
	flushSync();
}

/** The lines of the notice. */
function lines(): string[] {
	return [...document.querySelectorAll('li')].map((line) => line.textContent.trim());
}

describe('the notice of the files refused', () => {
	it('says each file refused, its name then its reason, without a title', async () => {
		showNotice([
			notText('passive-tree.png'),
			{
				kind: 'refused',
				fileName: 'Ritualist poison.build',
				refusal: { reason: 'notJson', line: 12, excerpt: '"level": ,' }
			}
		]);

		await expect.element(page.getByRole('alert')).toBeVisible();
		expect(lines()).toEqual([
			"passive-tree.png isn't a text file",
			"Ritualist poison.build isn't valid JSON at line 12"
		]);
	});

	it('lists four files whole, and the first three of five', () => {
		showNotice(['a.png', 'b.png', 'c.png', 'd.png'].map(notText));
		const four = lines();
		removeNotice();
		showNotice(['a.png', 'b.png', 'c.png', 'd.png', 'e.png'].map(notText));

		expect([four.length, lines()]).toEqual([
			4,
			[
				"a.png isn't a text file",
				"b.png isn't a text file",
				"c.png isn't a text file",
				'and 2 more'
			]
		]);
	});

	it('is closed by its close button', async () => {
		const onclose = vi.fn();
		showNotice([notText('passive-tree.png')], onclose);

		await page.getByRole('button', { name: 'Close' }).click();

		expect(onclose).toHaveBeenCalledOnce();
	});
});
