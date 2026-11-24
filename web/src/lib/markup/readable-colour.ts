// An author's colour kept readable on the surface it is read on (specs.md, The author's texts):
// a colour `rgb(r, g, b)` under 4.5 to 1 there is lightened on a dark surface, or darkened on a
// light one, just enough to reach it, its hue kept: the author meant « blue », not « unreadable ».

/** A colour of the screen, each channel a whole number from 0 to 255. */
export interface Rgb {
	red: number;
	green: number;
	blue: number;
}

/** The contrast a small text needs on its background, WCAG 2 (1.4.3). */
export const READABLE_CONTRAST = 4.5;

/** The steps of the search for how far a colour moves, enough to reach a whole channel. */
const SEARCH_STEPS = 24;

const WHITE: Rgb = { red: 255, green: 255, blue: 255 };
const BLACK: Rgb = { red: 0, green: 0, blue: 0 };

/** How a colour too faint on its surface is moved: toward white, or toward black. */
type Move = 'lighten' | 'darken';

/** A channel of 0 to 255 as light, from 0 to 1 (the relative luminance of WCAG 2). */
function linear(channel: number): number {
	const value = channel / 255;
	return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** How light a colour is, from 0 (black) to 1 (white), as WCAG 2 measures it. */
function luminance({ red, green, blue }: Rgb): number {
	return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

/** The contrast of two colours, from 1 to 21, whichever is the lighter. */
export function contrastRatio(one: Rgb, other: Rgb): number {
	const [first, second] = [luminance(one), luminance(other)];
	return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/**
 * The colour moved toward white or black by `share` (0 keeps it, 1 is white or black): each
 * channel moves by the same share of its way, so that the hue stays. Rounded away from the colour,
 * so that the contrast reached is never lost to the rounding.
 */
function moved(colour: Rgb, move: Move, share: number): Rgb {
	const channel =
		move === 'lighten'
			? (from: number) => Math.ceil(from + (255 - from) * share)
			: (from: number) => Math.floor(from * (1 - share));
	return { red: channel(colour.red), green: channel(colour.green), blue: channel(colour.blue) };
}

/**
 * The author's colour as it is read on `surface`: as written when it reaches 4.5 to 1 there,
 * else lightened on a dark surface or darkened on a light one, the least that reaches it. A
 * surface is dark when white stands out more on it than black; one of the two always reaches 4.5
 * to 1, since the better of them is at least √21 to 1.
 */
export function readableOn(colour: Rgb, surface: Rgb): Rgb {
	if (contrastRatio(colour, surface) >= READABLE_CONTRAST) {
		return colour;
	}
	const move: Move =
		contrastRatio(WHITE, surface) >= contrastRatio(BLACK, surface) ? 'lighten' : 'darken';
	// The contrast alone is unreadable, then readable, along the way: a colour on the wrong side
	// of the surface (darker than a dark one) first loses contrast down to 1, from under 4.5, so it
	// can't be readable before it has passed the surface. The search halves the way each step.
	let [least, most] = [0, 1];
	for (let step = 0; step < SEARCH_STEPS; step += 1) {
		const share = (least + most) / 2;
		if (contrastRatio(moved(colour, move, share), surface) >= READABLE_CONTRAST) {
			most = share;
		} else {
			least = share;
		}
	}
	return moved(colour, move, most);
}
