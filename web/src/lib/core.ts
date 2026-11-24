// The core of Pathweaver, compiled to WebAssembly by `npm run wasm` (see
// scripts/build-wasm.ts).

import init from '#lib/wasm/pathweaver.js';

/**
 * Loads the WebAssembly module, fetched once whatever the number of calls. A failure is written
 * to the console with its cause, then passed on to the page, which says it.
 */
export async function loadCore(): Promise<void> {
	try {
		await init();
	} catch (error) {
		console.error('core: the WebAssembly module could not load', error);
		throw error;
	}
}

/**
 * The build of the text of a file, or why it is refused, and why a file is refused from its size
 * alone (see crates/wasm/src/read.rs), to call once `loadCore` has resolved. A file that isn't a
 * build is a result, never an exception. An author's text crosses as its pieces, each with its
 * style, and whether the core cut it (see crates/wasm/src/markup.rs).
 */
export {
	readBuildFile,
	refusedBySize,
	type BuildFile,
	type BuildGuide,
	type MarkupColourName,
	type MarkupPiece,
	type MarkupStyle,
	type MarkupText,
	type OpenedBuild,
	type RefusedFile
} from '#lib/wasm/pathweaver.js';
