// The header of a build in a real browser, with the game data of the page.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import type { OpenedBuild } from '#lib/core.ts';
import { pageGameData } from '#lib/page/game-data.svelte.ts';
import { openedBuild } from '#lib/page/opened-build.test-helper.ts';
import BuildHeader from './BuildHeader.svelte';

let shown: ReturnType<typeof mount> | undefined;

afterEach(() => {
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
});

/** The header of a build, once the game data have named its ascendancy. */
async function header(build: Partial<OpenedBuild>): Promise<HTMLElement> {
	await pageGameData.load();
	shown = mount(BuildHeader, {
		target: document.body,
		props: { build: { ...openedBuild('key'), name: 'Spark Stormweaver', ...build } }
	});
	flushSync();
	const element = document.querySelector('header');
	if (element === null) {
		throw new Error('no header');
	}
	return element;
}

/** The line under the name, its spaces as a reader sees them. */
function byLine(element: HTMLElement): string | undefined {
	return element.querySelector('p')?.textContent?.replaceAll(/\s+/g, ' ').trim();
}

describe('the header of a build', () => {
	it('names the build, its author, its ascendancy and its class, by its portrait', async () => {
		const element = await header({ author: 'Lolcohol', ascendancy: 'Sorceress1' });
		expect(element.querySelector('h1')?.textContent).toBe('Spark Stormweaver');
		expect(byLine(element)).toBe('by Lolcohol · Stormweaver Sorceress');
		expect(element.querySelector('img')?.getAttribute('src')).toMatch(/sorceress1-88/);
	});

	it('writes an ascendancy the game data know not as its id, without a portrait', async () => {
		const element = await header({ author: 'Lolcohol', ascendancy: 'Ranger2' });
		expect([byLine(element), element.querySelector('img')]).toEqual([
			'by Lolcohol · Ranger2',
			null
		]);
	});

	it('writes the author alone without the mark that would part it from the ascendancy', async () => {
		const element = await header({ author: 'Lolcohol' });
		expect(byLine(element)).toBe('by Lolcohol');
	});

	it("draws the name, the author and an ascendancy the game data don't know each in an isolate of their direction", async () => {
		const element = await header({ name: 'מכשף', author: 'אבי', ascendancy: 'Ranger2' });
		expect([...element.querySelectorAll('bdi')].map((bdi) => bdi.textContent)).toEqual([
			'מכשף',
			'אבי',
			'Ranger2'
		]);
	});

	it('calls a build whose name shows nothing untitled, in the weak grey', async () => {
		const element = await header({ name: undefined });
		expect(element.querySelector('h1 .untitled')?.textContent).toBe('Untitled build');
	});

	it('writes the ascendancy alone without an author', async () => {
		const ascendancyAlone = await header({ ascendancy: 'Witch3b' });
		expect(byLine(ascendancyAlone)).toBe('Abyssal Lich Witch');
	});
});
