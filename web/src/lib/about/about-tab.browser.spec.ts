// The About tab in a real browser, shown in the panel of the tabs.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import BuildTabPanel from '#lib/build/BuildTabPanel.svelte';
import type { OpenedBuild } from '#lib/core.ts';
import { shownTab } from '#lib/page/build-tab.svelte.ts';
import { openedBuild } from '#lib/page/opened-build.test-helper.ts';

let shown: ReturnType<typeof mount> | undefined;

afterEach(() => {
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
	shownTab.show('overview');
});

/** The panel of the tabs of a build, the About tab shown. */
function aboutTab(build: Partial<OpenedBuild>): HTMLElement {
	shownTab.show('about');
	shown = mount(BuildTabPanel, {
		target: document.body,
		props: { id: 'panel', build: { ...openedBuild('key'), ...build } }
	});
	flushSync();
	const panel = document.getElementById('panel');
	if (panel === null) {
		throw new Error('no panel');
	}
	return panel;
}

describe('the About tab', () => {
	it('shows the description of the author with its markup, over its watermark', () => {
		const panel = aboutTab({
			description: [
				{
					kind: 'text',
					text: 'Guide',
					style: {
						isBold: true,
						isItalic: false,
						isUnderlined: false,
						size: undefined,
						colour: undefined
					}
				},
				{ kind: 'lineBreak' }
			]
		});
		expect([
			panel.querySelector('.description')?.textContent,
			panel.querySelector('.description .bold')?.textContent,
			panel.querySelector('.watermark svg')?.getAttribute('aria-hidden')
		]).toEqual(['Guide', 'Guide', 'true']);
	});

	it('says so when the author wrote no description', () => {
		const panel = aboutTab({ description: undefined });
		expect([
			panel.querySelector('.none')?.textContent,
			panel.querySelector('.description')
		]).toEqual(['The author wrote no description.', null]);
	});

	it('is shown only when its tab is', () => {
		const panel = aboutTab({ description: undefined });
		shownTab.show('skills');
		flushSync();
		expect(panel.querySelector('.about-tab')).toBeNull();
	});
});
