// An author's text drawn in a real browser, with the tokens of the style.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import type { MarkupColourName, MarkupPiece, MarkupStyle } from '#lib/core.ts';
import '#lib/style/tokens.css';
import AuthorText from './AuthorText.svelte';
import { markupSurface, rgbOf } from './markup-surface.ts';
import { contrastRatio, READABLE_CONTRAST } from './readable-colour.ts';

/**
 * The fourteen colours the game names, each as the browser computes its token
 * (css/tokens.css of the mock-up, 4g1), in the order of the documentation of Grinding Gear Games.
 */
const NAMED_COLOURS: Record<MarkupColourName, string> = {
	white: 'rgb(255, 255, 255)',
	grey: 'rgb(140, 140, 140)',
	black: 'rgb(128, 128, 128)',
	red: 'rgb(224, 80, 80)',
	orange: 'rgb(232, 145, 60)',
	yellow: 'rgb(230, 210, 90)',
	green: 'rgb(95, 195, 95)',
	blue: 'rgb(108, 140, 255)',
	indigo: 'rgb(127, 120, 240)',
	violet: 'rgb(168, 108, 224)',
	bronze: 'rgb(184, 124, 80)',
	silver: 'rgb(169, 177, 189)',
	gold: 'rgb(200, 166, 90)',
	unique: 'rgb(214, 161, 94)'
};

/** Whether a key of NAMED_COLOURS is a colour the game names, which all are. */
function isColourName(name: string): name is MarkupColourName {
	return name in NAMED_COLOURS;
}

let shown: ReturnType<typeof mount> | undefined;

afterEach(() => {
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
});

const PLAIN: MarkupStyle = {
	isBold: false,
	isItalic: false,
	isUnderlined: false,
	size: undefined,
	colour: undefined
};

/** A text in a style. */
const text = (words: string, style: Partial<MarkupStyle> = {}): MarkupPiece => ({
	kind: 'text',
	text: words,
	style: { ...PLAIN, ...style }
});

/** The author's text drawn at 20 pixels, so that its sizes read as whole pixels. */
function drawn(pieces: MarkupPiece[]): HTMLElement {
	const target = document.createElement('div');
	target.style.fontSize = '20px';
	document.body.replaceChildren(target);
	shown = mount(AuthorText, { target, props: { pieces } });
	flushSync();
	return target;
}

/** What the browser computed for the text of each piece drawn. */
function computed(target: HTMLElement): CSSStyleDeclaration[] {
	return [...target.querySelectorAll('.author-text > span, .author-text > a > span')].map((span) =>
		getComputedStyle(span)
	);
}

/** The left of a letter of a text drawn, in the page: where a mark of direction put it. */
function leftOf(letters: Node, index: number): number {
	const range = document.createRange();
	range.setStart(letters, index);
	range.setEnd(letters, index + 1);
	return range.getBoundingClientRect().left;
}

describe('an author’s text', () => {
	it('writes its texts as text, never as HTML, without a space between its pieces', () => {
		const target = drawn([text('<img src=x onerror=alert(1)>'), text('end', { isBold: true })]);
		expect([target.textContent, target.querySelector('img')]).toEqual([
			'<img src=x onerror=alert(1)>end',
			null
		]);
	});

	it('draws the fonts of the markup, alone or together', () => {
		const target = drawn([
			text('b', { isBold: true }),
			text('i', { isItalic: true }),
			text('iu', { isItalic: true, isUnderlined: true }),
			text('r')
		]);
		expect(
			computed(target).map((style) => [style.fontWeight, style.fontStyle, style.textDecorationLine])
		).toEqual([
			['700', 'normal', 'none'],
			['400', 'italic', 'none'],
			['400', 'italic', 'underline'],
			['400', 'normal', 'none']
		]);
	});

	it('draws each size as a factor of the text around it', () => {
		const target = drawn([
			text('s', { size: 'small' }),
			text('m', { size: 'medium' }),
			text('l', { size: 'large' }),
			text('none')
		]);
		expect(computed(target).map((style) => style.fontSize)).toEqual([
			'20px',
			'23px',
			'27px',
			'20px'
		]);
	});

	it('draws each colour the game names in its token, readable on the surface of the author’s texts', () => {
		const target = drawn(
			Object.keys(NAMED_COLOURS)
				.filter((name) => isColourName(name))
				.map((name) => text(name, { colour: { kind: 'named', name } }))
		);
		const colours = computed(target).map((style) => style.color);
		expect(colours).toEqual(Object.values(NAMED_COLOURS));
		const surface = markupSurface();
		if (surface === undefined) {
			throw new Error('no surface');
		}
		const unreadable = colours.filter((colour) => {
			const rgb = rgbOf(colour);
			return rgb === undefined || contrastRatio(rgb, surface) < READABLE_CONTRAST;
		});
		expect(unreadable).toEqual([]);
	});

	it('draws a colour rgb as written when readable on the band, else lightened just enough', () => {
		const target = drawn([
			text('green', { colour: { kind: 'rgb', red: 134, green: 189, blue: 163 } }),
			text('black', { colour: { kind: 'rgb', red: 0, green: 0, blue: 0 } })
		]);
		expect(computed(target).map((style) => style.color)).toEqual([
			'rgb(134, 189, 163)',
			'rgb(128, 128, 128)'
		]);
	});

	it('breaks its lines where the author did', () => {
		const target = drawn([text('one'), { kind: 'lineBreak' }, { kind: 'lineBreak' }, text('two')]);
		expect(target.querySelector('.author-text')?.innerHTML.replaceAll(/<!---->/g, '')).toMatch(
			/^<span[^>]*>one<\/span><br><br><span[^>]*>two<\/span>$/
		);
	});

	it('opens an address in a new tab that keeps no hold on the page, whole in its tooltip', () => {
		const address = 'https://mobalytics.gg/poe-2/builds/spark-stormweaver';
		const target = drawn([
			{ kind: 'link', address, style: { ...PLAIN, colour: { kind: 'named', name: 'blue' } } }
		]);
		const link = target.querySelector('a');
		expect([
			link?.getAttribute('href'),
			link?.target,
			link?.rel,
			link?.title,
			link?.textContent,
			computed(target)[0]?.color
		]).toEqual([address, '_blank', 'noopener noreferrer', address, address, 'rgb(108, 140, 255)']);
	});

	it('draws an address in the order of its letters, whatever mark of direction comes before it', () => {
		const address = 'https://evil.io/moc.elgoog//:sptth';
		// U+202E, RIGHT-TO-LEFT OVERRIDE, the end of the text before the link.
		const target = drawn([text('Guide: \u202E'), { kind: 'link', address, style: PLAIN }]);
		const letters = target.querySelector('a > span')?.firstChild;
		if (letters === null || letters === undefined) {
			throw new Error('no address drawn');
		}
		expect(leftOf(letters, 0)).toBeLessThan(leftOf(letters, address.length - 1));
	});

	it('keeps a mark of direction of the author out of the words drawn after it', () => {
		const target = drawn([text('\u202Eabc')]);
		const after = document.createElement('span');
		after.textContent = 'xyz';
		target.append(after);
		const letters = after.firstChild;
		if (letters === null) {
			throw new Error('no words after');
		}
		expect(leftOf(letters, 0)).toBeLessThan(leftOf(letters, 2));
	});
});
