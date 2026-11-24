import { describe, expect, it } from 'vitest';
import { bandLayout } from './band-layout.ts';

describe('the layout of the band of the open builds', () => {
	it('gives every build a tab up to 240 pixels while they all fit', () => {
		expect([bandLayout(1, 1280), bandLayout(4, 1280), bandLayout(6, 1280)]).toEqual([
			{ tabCount: 1, tabWidthPixels: 240 },
			{ tabCount: 4, tabWidthPixels: 240 },
			{ tabCount: 6, tabWidthPixels: 204 }
		]);
	});

	it('keeps a tab of 184 pixels for the builds that fit beside « +N ▾ »', () => {
		// At 900 pixels, four tabs of 184 beside + (56 kept); a fifth would take 920.
		expect([bandLayout(4, 900), bandLayout(5, 900), bandLayout(6, 900)]).toEqual([
			{ tabCount: 4, tabWidthPixels: 211 },
			{ tabCount: 4, tabWidthPixels: 184 },
			{ tabCount: 4, tabWidthPixels: 184 }
		]);
	});

	it('gives the build shown a tab however narrow the band', () => {
		expect(bandLayout(3, 200)).toEqual({ tabCount: 1, tabWidthPixels: 184 });
	});
});
