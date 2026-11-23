// The files given to the page, read by the core in WebAssembly, loaded in a real browser.

import { describe, expect, it, vi } from 'vitest';
import everyField from '../../../../crates/build-file/tests/builds/every-field.build?raw';
import { readFiles } from './read-files.ts';

/** The largest file the core reads (crates/build-file/src/read_error.rs). */
const MAX_BYTES = 1_048_576;

/** A file of this text. */
function fileOf(name: string, text: string): File {
	return new File([text], name, { type: 'application/json' });
}

describe('reading the files given', () => {
	it('gives the build of a file', async () => {
		const [read] = await readFiles([fileOf('every-field.build', everyField)]);
		expect(read?.kind === 'build' && read.build.name).toBe('Every Field');
	});

	it('reads each file in its order, a file refused between two builds', async () => {
		const read = await readFiles([
			fileOf('a.build', '{ "name": "A" }'),
			fileOf('notes.txt', 'not json'),
			fileOf('b.build', '{ "name": "B" }')
		]);
		expect(read.map((file) => (file.kind === 'build' ? file.build.name : file.fileName))).toEqual([
			'A',
			'notes.txt',
			'B'
		]);
	});

	it('names a file refused and gives the reason of the core', async () => {
		const [read] = await readFiles([fileOf('broken.build', '{\n  "name": "A",\n  oops\n}')]);
		expect(read).toEqual({
			kind: 'refused',
			fileName: 'broken.build',
			refusal: { reason: 'notJson', line: 3, excerpt: '  oops' }
		});
	});

	it('refuses a file larger than the core reads from its size, without reading it', async () => {
		const large = fileOf('large.build', ' '.repeat(MAX_BYTES + 1));
		const bytes = vi.spyOn(large, 'arrayBuffer');

		const [read] = await readFiles([large]);

		expect(read).toEqual({
			kind: 'refused',
			fileName: 'large.build',
			refusal: { reason: 'tooLarge', bytes: MAX_BYTES + 1, limit: MAX_BYTES }
		});
		expect(bytes).not.toHaveBeenCalled();
	});

	it('refuses a file of 4 GiB or more with its whole size, never as a small one', async () => {
		const huge = fileOf('huge.build', '{ "name": "A" }');
		Object.defineProperty(huge, 'size', { value: 5 * 2 ** 30 });

		const [read] = await readFiles([huge]);

		expect(read?.kind === 'refused' && read.refusal).toEqual({
			reason: 'tooLarge',
			bytes: 5 * 2 ** 30,
			limit: MAX_BYTES
		});
	});

	it('says that an image isn’t text, never that it is too large', async () => {
		// 600 KB of an image: decoded as text, each byte would become a character of 3 bytes.
		const image = new File([new Uint8Array(600_000).fill(0x89)], 'passive-tree.png');

		const [read] = await readFiles([image]);

		expect(read).toEqual({
			kind: 'refused',
			fileName: 'passive-tree.png',
			refusal: { reason: 'notText' }
		});
	});

	it('reads a file of the largest size the core reads', async () => {
		const empty = '{ "name": "" }';
		const full = `{ "name": "${'a'.repeat(MAX_BYTES - empty.length)}" }`;
		expect(full.length).toBe(MAX_BYTES);

		const [read] = await readFiles([fileOf('full.build', full)]);

		expect(read?.kind).toBe('build');
	});

	it('says that a file the browser could not read is refused, and reads the others', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const folder = fileOf('Builds', '');
		vi.spyOn(folder, 'arrayBuffer').mockRejectedValue(
			new DOMException('A folder', 'NotReadableError')
		);

		const read = await readFiles([folder, fileOf('a.build', '{ "name": "A" }')]);

		expect(read).toEqual([
			{ kind: 'refused', fileName: 'Builds', refusal: { reason: 'unreadable' } },
			expect.objectContaining({ kind: 'build' })
		]);
	});
});
