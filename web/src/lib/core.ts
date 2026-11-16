// The core of Pathweaver, compiled to WebAssembly by `npm run wasm` (see
// scripts/build-wasm.ts).

import init, { coreVersion } from '#lib/wasm/pathweaver.js';

/** What the interface reads from the core once it is loaded. */
export interface Core {
	version: string;
}

/**
 * Loads the WebAssembly module, fetched once whatever the number of calls. A failure is written
 * to the console with its cause, then passed on to the page, which says it.
 */
export async function loadCore(): Promise<Core> {
	try {
		await init();
	} catch (error) {
		console.error('core: the WebAssembly module could not load', error);
		throw error;
	}
	return { version: coreVersion() };
}

/**
 * The summary of the text of a `.build` file (see crates/wasm/src/summary.rs), to call once
 * `loadCore` has resolved. It throws an `Error` with the sentence of the core when the text isn't
 * a `.build` file.
 */
export { summarizeBuild, type BuildSummary } from '#lib/wasm/pathweaver.js';
