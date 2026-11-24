// The surface of the author's texts read from a page in a real browser, without the style sheet of
// the tokens, which each test sets itself.

import { describe, expect, it, vi } from 'vitest';
import { markupSurface } from './markup-surface.ts';

describe('the surface of the author’s texts', () => {
	it('is none while its token isn’t there, said once, then read once it is', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const before = [markupSurface(), markupSurface()];
		document.documentElement.style.setProperty('--markup-surface', '#0f1726');
		expect([before, markupSurface(), error.mock.calls.length]).toEqual([
			[undefined, undefined],
			{ red: 15, green: 23, blue: 38 },
			1
		]);
	});
});
