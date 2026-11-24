import { describe, expect, it } from 'vitest';
import { rgbOf } from './markup-surface.ts';

describe('a colour the browser computed', () => {
	it('is read when it is opaque and in rgb()', () => {
		expect(rgbOf('rgb(15, 23, 38)')).toEqual({ red: 15, green: 23, blue: 38 });
	});

	it('is not read see-through or in another space', () => {
		expect([
			rgbOf('rgba(15, 23, 38, 0.5)'),
			rgbOf('oklch(0.2 0.03 260)'),
			rgbOf('color(srgb 0.06 0.09 0.15)')
		]).toEqual([undefined, undefined, undefined]);
	});
});
