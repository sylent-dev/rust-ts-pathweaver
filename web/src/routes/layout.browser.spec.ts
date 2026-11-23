// The layout of every page, in a real browser at the widths of specs.md (Screens): a phone gets
// one message in place of the page, a narrow window keeps the width of the page.

import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import Layout from './+layout.svelte';

/** The page under the layout, a paragraph that names itself. */
const children = createRawSnippet(() => ({ render: () => '<p>The page</p>' }));

let shown: ReturnType<typeof mount> | undefined;

/** The layout drawn in a window of this size, its page in it. */
async function showAt(width: number, height = 844): Promise<void> {
	await page.viewport(width, height);
	shown = mount(Layout, { target: document.body, props: { children, params: {}, data: {} } });
	flushSync();
}

afterEach(() => {
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
});

describe('the layout', () => {
	it('shows the phone message in place of the page under 600 pixels', async () => {
		await showAt(390);
		expect(document.querySelector('h1')?.textContent).toBe('Pathweaver needs a computer');
		expect(document.body.textContent).not.toContain('The page');
	});

	it('shows the page from 600 pixels', async () => {
		await showAt(600);
		expect(document.body.textContent).toContain('The page');
		expect(document.querySelector('h1')).toBeNull();
	});

	it('keeps the page 900 pixels wide in a narrower window, which scrolls sideways', async () => {
		await showAt(700);
		expect(document.documentElement.scrollWidth).toBe(900);
	});

	it('turns to the phone message when the window narrows', async () => {
		await showAt(960);
		await page.viewport(390, 844);
		await expect
			.poll(() => document.querySelector('h1')?.textContent)
			.toBe('Pathweaver needs a computer');
	});
});
