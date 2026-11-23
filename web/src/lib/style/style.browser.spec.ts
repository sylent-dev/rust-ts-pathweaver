// The style sheets every page loads (+layout.svelte), read by a real browser: the fonts served by
// the website, and the figures of one width the levels line up with (specs.md, The style).

import { beforeAll, describe, expect, it } from 'vitest';
import './fonts.css';
import './tokens.css';
import './base.css';

/** The width of a text in a font, drawn in the page. */
function widthOf(text: string, style: Partial<CSSStyleDeclaration>): number {
	const span = document.createElement('span');
	span.textContent = text;
	Object.assign(span.style, style);
	document.body.append(span);
	const { width } = span.getBoundingClientRect();
	span.remove();
	return width;
}

beforeAll(async () => {
	await Promise.all([
		document.fonts.load('400 14px Manrope'),
		document.fonts.load('800 14px Manrope'),
		document.fonts.load('700 14px Archivo'),
		document.fonts.load('800 14px Archivo')
	]);
});

describe('the fonts', () => {
	it('are served by the website, in every weight the style uses', () => {
		const loaded = [...document.fonts]
			.filter((face) => face.status === 'loaded')
			.map((face) => `${face.family} ${face.weight}`);
		expect(loaded.toSorted()).toEqual(['Archivo 700 800', 'Manrope 400 800']);
	});

	it('keep, in the file of Manrope the website serves, the figures of one width the levels line up with', () => {
		const number = { fontFamily: 'Manrope', fontVariantNumeric: 'tabular-nums' };
		expect(widthOf('111', number)).toBeCloseTo(widthOf('888', number), 1);
		// Without it, a 1 is narrower: the check above isn't true of any font.
		const text = { fontFamily: 'Manrope' };
		expect(widthOf('111', text)).toBeLessThan(widthOf('888', text));
	});
});

describe('the page', () => {
	it('takes the colours and the font of the style', () => {
		const page = getComputedStyle(document.body);
		expect(page.backgroundColor).toBe('rgb(12, 17, 27)');
		expect(page.color).toBe('rgb(227, 234, 245)');
		expect(page.fontFamily).toBe('Manrope, sans-serif');
	});
});
