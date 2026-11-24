// The time the descriptions that cost most take, as large as the reading allows (MAX_BYTES, 1 MB):
// read through the bridge when the file opens, then drawn from the click on the About tab to the
// next frame. A file of a stranger may be made to cost, and the core and the page share the main
// thread. Run it with the core built for release, in Chromium:
//
//     npm run wasm -- --release
//     VITE_MEASURE=1 npx vitest --run --project browser description-cost
//
// The page of the tests compiles Svelte for development. The website took as long: built
// (`npm run build`, then `npx vite preview`) and driven by Playwright, the file chosen, the time
// from the click on About to the next frame. Measured on 2026-11-24 (4g3), headless Chromium on
// the owner's machine:
//
//     line breaks alone: none (a description of spaces alone is none), read 11 ms
//     a letter and a line break: 699,028 pieces, read 281 ms, drawn 3,150 ms (website 3,498),
//         closed 373 ms
//     <b>{a}a: 299,582 pieces, read 157 ms, drawn 2,128 ms (website 1,934), closed 187 ms
//     <rgb(0,0,0)>{a}a: 131,066 pieces, read 89 ms, drawn 990 ms (website 1,065), closed 94 ms
//
// Since 4g3b the core keeps 1,000 pieces of a text (`PIECES_KEPT` of
// crates/build-file/src/markup.rs). Measured on 2026-11-24, the same way, the page of the tests:
//
//     line breaks alone: none, read 11 ms, drawn 3 ms, closed 0 ms
//     a letter and a line break: 1,000 pieces (cut), read 15 ms, drawn 11 ms, closed 1 ms
//     <b>{a}a: 1,000 pieces (cut), read 8 ms, drawn 9 ms, closed 1 ms
//     <rgb(0,0,0)>{a}a: 1,000 pieces (cut), read 8 ms, drawn 11 ms, closed 1 ms

import { flushSync, mount, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';
import BuildTabPanel from '#lib/build/BuildTabPanel.svelte';
import { loadCore, readBuildFile } from '#lib/core.ts';
import { shownTab } from '#lib/page/build-tab.svelte.ts';
import '#lib/style/tokens.css';

/** The largest file the core reads, `MAX_BYTES` of crates/build-file/src/read_error.rs. */
const MAX_BYTES = 1_048_576;

/** A file as large as the reading allows, its description `unit` written again and again. */
function fileOf(unit: string): Uint8Array {
	const [opening, closing] = ['{"name":"Large","description":"', '"}'];
	const times = Math.floor((MAX_BYTES - opening.length - closing.length) / unit.length);
	return new TextEncoder().encode(opening + unit.repeat(times) + closing);
}

/** The milliseconds `work` takes. */
function timeOf(work: () => void): number {
	const start = performance.now();
	work();
	return performance.now() - start;
}

/** The next frame drawn. */
function nextFrame(): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			setTimeout(resolve);
		});
	});
}

/**
 * The cases, each a unit of the description as the JSON of the file writes it: line breaks
 * alone (4g2's review), which the core reads as no description; a letter between them, the most
 * pieces a byte, a text and a line break each; a bold letter and a plain one, a span a piece; a
 * colour too dark, lightened for each piece.
 */
const CASES = {
	'line breaks alone': String.raw`\n`,
	'a letter and a line break': String.raw`a\n`,
	'<b>{a}a': '<b>{a}a',
	'<rgb(0,0,0)>{a}a': '<rgb(0,0,0)>{a}a'
};

describe.skipIf(import.meta.env.VITE_MEASURE !== '1')('the descriptions that cost most', () => {
	it('are read and drawn in a time measured', { timeout: 600_000 }, async ({ annotate }) => {
		await loadCore();
		const lines: string[] = [];
		for (const [name, unit] of Object.entries(CASES)) {
			const bytes = fileOf(unit);
			let result: ReturnType<typeof readBuildFile> | undefined;
			const read = timeOf(() => {
				result = readBuildFile(bytes);
			});
			if (result?.kind !== 'build') {
				throw new Error(`${name}: refused`);
			}
			const { build } = result;
			shownTab.show('overview');
			const panel = mount(BuildTabPanel, {
				target: document.body,
				props: { id: 'panel', build }
			});
			flushSync();
			const start = performance.now();
			shownTab.show('about');
			flushSync();
			await nextFrame();
			const drawn = performance.now() - start;
			const closed = timeOf(() => {
				void unmount(panel);
				flushSync();
			});
			lines.push(
				`${name}: ${build.description === undefined ? 'none' : `${String(build.description.pieces.length)} pieces${build.description.isCut ? ' (cut)' : ''}`}, read ${read.toFixed(0)} ms, drawn ${drawn.toFixed(0)} ms, closed ${closed.toFixed(0)} ms`
			);
		}
		await annotate(lines.join('\n'));
		expect(lines).toHaveLength(Object.keys(CASES).length);
	});
});
