import { describe, expect, it } from 'vitest';
import { contrastRatio, READABLE_CONTRAST, readableOn, type Rgb } from './readable-colour.ts';

/** A colour written as the files write it. */
const rgb = (red: number, green: number, blue: number): Rgb => ({ red, green, blue });

/** The band of Frost Night, `--band`, the surface of the author's texts. */
const BAND = rgb(15, 23, 38);
/** A light surface, as a light style would have. */
const LIGHT = rgb(244, 246, 250);

/** The hue of a colour, in degrees, as HSL reads it. */
function hue({ red, green, blue }: Rgb): number {
	const [most, least] = [Math.max(red, green, blue), Math.min(red, green, blue)];
	const range = most - least;
	const sixth =
		most === red
			? (green - blue) / range
			: most === green
				? (blue - red) / range + 2
				: (red - green) / range + 4;
	return (sixth * 60 + 360) % 360;
}

describe('an author’s colour on its surface', () => {
	it('stays as written when it reaches 4.5 to 1', () => {
		// The green of a guide of Maxroll in the corpus, 8.4 to 1 on the band.
		expect(readableOn(rgb(134, 189, 163), BAND)).toEqual(rgb(134, 189, 163));
	});

	it('is lightened past a dark surface it is darker than, just enough, as the token of black was', () => {
		// --markup-black, the darkest neutral grey at 4.5 to 1 on the band.
		expect(readableOn(rgb(0, 0, 0), BAND)).toEqual(rgb(128, 128, 128));
		expect(contrastRatio(rgb(127, 127, 127), BAND)).toBeLessThan(READABLE_CONTRAST);
	});

	it('keeps its hue when it is lightened', () => {
		const navy = readableOn(rgb(0, 0, 128), BAND);
		expect(navy).toEqual(rgb(121, 121, 188));
		expect(hue(navy)).toBe(240);
	});

	it('is lightened when it is lighter than a dark surface but too faint, its hue kept', () => {
		// 3.1 to 1 on the band.
		const red = readableOn(rgb(200, 30, 30), BAND);
		expect(red).toEqual(rgb(214, 85, 85));
		expect([contrastRatio(red, BAND) >= READABLE_CONTRAST, hue(red)]).toEqual([true, 0]);
	});

	it('is darkened on a light surface, its hue kept to the rounding of a channel', () => {
		// A yellow, 1.4 to 1 on a light surface.
		const yellow = readableOn(rgb(230, 210, 90), LIGHT);
		expect(yellow).toEqual(rgb(124, 114, 48));
		expect(contrastRatio(yellow, LIGHT)).toBeGreaterThanOrEqual(READABLE_CONTRAST);
		expect(Math.abs(hue(yellow) - hue(rgb(230, 210, 90)))).toBeLessThan(1);
	});
});

describe('the contrast of two colours', () => {
	it('is the same whichever comes first, from 1 to 21', () => {
		expect([
			contrastRatio(rgb(0, 0, 0), rgb(255, 255, 255)),
			contrastRatio(rgb(255, 255, 255), rgb(0, 0, 0)),
			contrastRatio(BAND, BAND)
		]).toEqual([21, 21, 1]);
	});
});
