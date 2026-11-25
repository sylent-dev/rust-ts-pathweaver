// The About tab in a real browser, shown in the panel of the tabs.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import BuildTabPanel from '#lib/build/BuildTabPanel.svelte';
import type { OpenedBuild } from '#lib/core.ts';
import { pageGameData } from '#lib/page/game-data.svelte.ts';
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

/** The facts of the colophon, each its title followed by the lines of its value. */
function facts(panel: HTMLElement): string[][] {
	return [...panel.querySelectorAll('.colophon dt')].map((title) => {
		const value = title.nextElementSibling;
		const entries = [...(value?.querySelectorAll('.entry') ?? [])].map(
			(entry) => entry.textContent
		);
		return [
			title.textContent,
			...(entries.length > 0 ? entries : [value?.textContent?.trim() ?? ''])
		];
	});
}

describe('the About tab', () => {
	it('shows the description of the author with its markup, over its watermark', () => {
		const panel = aboutTab({
			description: {
				pieces: [
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
				],
				isCut: false
			}
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

	it('names the build, its author and its ascendancy over its portrait, in its colophon', async () => {
		await pageGameData.load();
		const colophon = aboutTab({
			name: 'Spark',
			author: 'Lolcohol',
			ascendancy: 'Sorceress1'
		}).querySelector('.colophon');
		expect([
			colophon?.querySelector('h2')?.textContent,
			colophon?.querySelector('.by')?.textContent?.replaceAll(/\s+/g, ' ').trim(),
			colophon?.querySelector('h2 bdi')?.textContent
		]).toEqual(['Spark', 'by Lolcohol · Stormweaver Sorceress', 'Spark']);
		expect(colophon?.querySelector('img')?.getAttribute('src')).toMatch(/sorceress1-520/);
	});

	it('gives the levels the build covers and its entries, each thing once', () => {
		const panel = aboutTab({
			levels: { lowest: 65, highest: 100, markers: [90], isSnapshot: false },
			totals: { passives: 1, skills: 10, supports: 35, hints: 14 }
		});
		expect(facts(panel)).toEqual([
			['Levels', '65–100'],
			['Entries', '1 passive', '10 skills', '35 supports', '14 items']
		]);
	});

	it('says a build that is the same at every level is a snapshot', () => {
		const panel = aboutTab({
			levels: { lowest: 1, highest: 100, markers: [], isSnapshot: true }
		});
		expect(facts(panel)[0]).toEqual(['Levels', 'a snapshot']);
	});

	it('calls a build whose name shows nothing untitled, in the weak grey', () => {
		const panel = aboutTab({ name: undefined });
		expect(panel.querySelector('.colophon h2 .untitled')?.textContent).toBe('Untitled build');
	});

	it('is shown only when its tab is', () => {
		const panel = aboutTab({ description: undefined });
		shownTab.show('skills');
		flushSync();
		expect(panel.querySelector('.about-tab')).toBeNull();
	});
});
