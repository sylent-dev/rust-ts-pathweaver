// The surface an author's colour is read on, the token `--markup-surface` of the style, as the
// browser computes it: the rule of readable-colour.ts needs its channels, which only the page
// knows.

import type { Rgb } from './readable-colour.ts';

/** A colour as the browser computes it, opaque: `rgb(15, 23, 38)`. */
const COMPUTED_RGB = /^rgb\((\d+), (\d+), (\d+)\)$/;

/** The surface once read, for the page: Frost Night is its only style until version 1. */
let read: { surface: Rgb | undefined } | undefined;

/** A colour the browser computed, when it is opaque and in `rgb()`. */
export function rgbOf(computed: string): Rgb | undefined {
	const [, red, green, blue] = COMPUTED_RGB.exec(computed) ?? [];
	if (red === undefined || green === undefined || blue === undefined) {
		return undefined;
	}
	return { red: Number(red), green: Number(green), blue: Number(blue) };
}

/**
 * The surface an author's colour is read on, read from the page the first time; none, and a
 * message in the console, when the browser gives it in a form this doesn't read (a colour
 * see-through or of another space) or the token isn't there yet, which is read again the next
 * time: the author's colours are then shown as written. A token missing would give the colour
 * the probe inherits, read as a surface.
 */
export function markupSurface(): Rgb | undefined {
	if (read !== undefined) {
		return read.surface;
	}
	if (
		getComputedStyle(document.documentElement).getPropertyValue('--markup-surface').trim() === ''
	) {
		console.error("The surface of the author's texts has no token yet");
		return undefined;
	}
	const probe = document.createElement('span');
	probe.style.color = 'var(--markup-surface)';
	document.body.append(probe);
	const computed = getComputedStyle(probe).color;
	probe.remove();
	read = { surface: rgbOf(computed) };
	if (read.surface === undefined) {
		console.error(`The surface of the author's texts is unread: ${computed}`);
	}
	return read.surface;
}
