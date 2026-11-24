// The label of an open build in a real browser, with the game data of the page: its portrait, its
// name over its ascendancy, both in full on hover.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import type { OpenedBuild } from '#lib/core.ts';
import { pageGameData } from '#lib/page/game-data.svelte.ts';
import { openedBuild } from '#lib/page/opened-build.test-helper.ts';
import BuildLabel from './BuildLabel.svelte';

let shown: ReturnType<typeof mount> | undefined;

afterEach(() => {
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
});

/** What a label shows of a build of this ascendancy, once the game data have named it. */
async function label(ascendancy: string | undefined): Promise<{
	texts: string[];
	portrait: string | null | undefined;
	hover: string | null | undefined;
}> {
	await pageGameData.load();
	const build: OpenedBuild = { ...openedBuild('key'), name: 'Spark Stormweaver', ascendancy };
	shown = mount(BuildLabel, { target: document.body, props: { build } });
	flushSync();
	const element = document.querySelector('.label');
	return {
		texts: [...(element?.querySelectorAll('.text > span') ?? [])].map((span) => span.textContent),
		portrait: element?.querySelector('img')?.getAttribute('src'),
		hover: element?.getAttribute('title')
	};
}

describe('the label of an open build', () => {
	it('names the build over its ascendancy, by its portrait, both in full on hover', async () => {
		const { texts, portrait, hover } = await label('Sorceress1');
		expect([texts, hover]).toEqual([
			['Spark Stormweaver', 'Stormweaver'],
			'Spark Stormweaver\nStormweaver'
		]);
		expect(portrait).toMatch(/sorceress1-88/);
	});

	it('writes an ascendancy the game data know not as its id, without a portrait', async () => {
		expect(await label('Ranger2')).toEqual({
			texts: ['Spark Stormweaver', 'Ranger2'],
			portrait: undefined,
			hover: 'Spark Stormweaver\nRanger2'
		});
	});

	it('names the build alone, its square empty, without an ascendancy', async () => {
		expect(await label(undefined)).toEqual({
			texts: ['Spark Stormweaver'],
			portrait: undefined,
			hover: 'Spark Stormweaver'
		});
	});
});
