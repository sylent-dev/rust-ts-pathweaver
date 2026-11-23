// A build as the core gives it, for the tests that open one in the page.

import type { OpenedBuild } from '#lib/core.ts';

/** A build of this key, named after it, from level 1 to 100, with these markers. */
export function openedBuild(contentKey: string, markers: number[] = []): OpenedBuild {
	return {
		contentKey,
		name: contentKey,
		author: undefined,
		ascendancy: undefined,
		link: undefined,
		levels: { lowest: 1, highest: 100, markers }
	};
}
