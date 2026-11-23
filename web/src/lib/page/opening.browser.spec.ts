// The files the page opens, dropped or chosen, in a real browser, the core loaded.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { openBuilds } from './open-builds.svelte.ts';
import { Opening } from './opening.svelte.ts';

/** A file of this text. */
function fileOf(name: string, text: string): File {
	return new File([text], name, { type: 'application/json' });
}

const buildA = fileOf('a.build', '{ "name": "A" }');
const buildB = fileOf('b.build', '{ "name": "B" }');
const image = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'passive-tree.png');

afterEach(() => {
	for (const build of openBuilds.all) {
		openBuilds.close(build.contentKey);
	}
	vi.restoreAllMocks();
});

describe('the files opened', () => {
	it('keep each file refused with its reason, the others opened', async () => {
		const opening = new Opening();

		await opening.open([image, buildA]);

		expect(openBuilds.shown?.name).toBe('A');
		expect(opening.refused).toEqual([
			{ kind: 'refused', fileName: 'passive-tree.png', refusal: { reason: 'notText' } }
		]);
	});

	it('forget the files refused before them', async () => {
		const opening = new Opening();
		await opening.open([image]);

		await opening.open([buildA]);

		expect(opening.refused).toEqual([]);
	});

	it('open after the files given before them, however long those take to read', async () => {
		const opening = new Opening();
		const slow = fileOf('slow.build', '{ "name": "Slow" }');
		const bytes = await slow.arrayBuffer();
		let readSlow: (bytes: ArrayBuffer) => void = () => {};
		vi.spyOn(slow, 'arrayBuffer').mockReturnValue(
			new Promise((resolve) => {
				readSlow = resolve;
			})
		);

		const first = opening.open([slow, image]);
		const second = opening.open([buildB]);
		await new Promise((resolve) => setTimeout(resolve, 50));
		readSlow(bytes);
		await Promise.all([first, second]);

		expect(openBuilds.all.map((build) => build.name)).toEqual(['Slow', 'B']);
		expect(openBuilds.shown?.name).toBe('B');
		expect(opening.refused).toEqual([]);
	});

	it('write why to the console when the files can’t be read, and open the next ones', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const opening = new Opening();
		const broken = fileOf('broken.build', '{ "name": "Broken" }');
		Object.defineProperty(broken, 'size', {
			get: () => {
				throw new Error('No size');
			}
		});

		await opening.open([broken]);
		await opening.open([buildA]);

		expect(error).toHaveBeenCalledWith('opening: the files could not be opened', expect.any(Error));
		expect(openBuilds.shown?.name).toBe('A');
	});

	it('open the next files after a failure while the files before opened', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const opening = new Opening();
		vi.spyOn(openBuilds, 'open').mockImplementationOnce(() => {
			throw new Error('A bug elsewhere');
		});

		await opening.open([buildA]);
		await opening.open([buildB]);

		expect(openBuilds.shown?.name).toBe('B');
	});
});
