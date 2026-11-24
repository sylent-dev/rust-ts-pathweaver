// An author's text drawn in a real browser, with the tokens of the style.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import type { MarkupPiece, MarkupStyle } from '#lib/core.ts';
import '#lib/style/tokens.css';
import AuthorText from './AuthorText.svelte';

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

	it('draws each size as a factor of the text around it, a size inside a size not again', () => {
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

	it('draws a named colour in its token, gray as grey', () => {
		const target = drawn([
			text('gold', { colour: { kind: 'named', name: 'gold' } }),
			text('grey', { colour: { kind: 'named', name: 'grey' } }),
			text('black', { colour: { kind: 'named', name: 'black' } })
		]);
		expect(computed(target).map((style) => style.color)).toEqual([
			'rgb(200, 166, 90)',
			'rgb(140, 140, 140)',
			'rgb(128, 128, 128)'
		]);
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
});
