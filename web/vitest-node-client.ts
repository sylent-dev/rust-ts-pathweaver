// A test environment for Vitest: Node, with the files compiled as for a browser. Svelte compiles
// a file for a server or for a browser, and a `$state` is a plain value in the first, a proxy in
// the second: the tests of the state of the interface need the second, without a page (see
// vite.config.ts).

import type { Environment } from 'vitest/runtime';

export default {
	name: 'node-client',
	viteEnvironment: 'client',
	setup: () => ({
		teardown() {
			// Nothing to undo: Node stays as it was.
		}
	})
} satisfies Environment;
