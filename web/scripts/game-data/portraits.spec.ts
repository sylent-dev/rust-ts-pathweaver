import { describe, expect, it } from 'vitest';
import { ShapeError } from './json-shape.ts';
import { cutArguments, frameAt, portraitFile, squareInDisc } from './portraits.ts';

describe('squareInDisc', () => {
	it('gives the largest square inside the disc of a frame, centred in it', () => {
		// 1,500 / √2 = 1,060.66; (1,500 − 1,060) / 2 = 220.
		expect(squareInDisc({ x: 1500, y: 3000, width: 1500, height: 1500 })).toEqual({
			x: 1720,
			y: 3220,
			width: 1060,
			height: 1060
		});
	});
});

describe('frameAt', () => {
	const sprite = {
		frames: {
			'classWitch:Class4': { frame: { x: 1500, y: 1500, w: 1500, h: 1500 } },
			'classWitch:Class5': { frame: { x: 0, y: 3000, w: 1500, h: 1400 } }
		}
	};

	it('reads the rectangle of a frame of the sprite', () => {
		expect(frameAt(sprite, 'classWitch:Class4', 'witch.json')).toEqual({
			x: 1500,
			y: 1500,
			width: 1500,
			height: 1500
		});
	});

	it('stops on a frame missing, or one that holds no disc', () => {
		expect(() => frameAt(sprite, 'classWitch:Class9', 'witch.json')).toThrow(
			new ShapeError('witch.json.frames', 'a frame « classWitch:Class9 »')
		);
		expect(() => frameAt(sprite, 'classWitch:Class5', 'witch.json')).toThrow(
			new ShapeError('witch.json.frames.classWitch:Class5.frame', 'a square')
		);
	});
});

it('names a portrait by its ascendancy, in lower case, and its side', () => {
	expect(portraitFile('Witch3b', 88)).toBe('witch3b-88.webp');
});

it('asks ImageMagick to cut the square, then make it as wide as the side', () => {
	expect(
		cutArguments('sprite.webp', { x: 1720, y: 220, width: 1060, height: 1060 }, 88, 'out.webp')
	).toEqual([
		'sprite.webp',
		'-crop',
		'1060x1060+1720+220',
		'+repage',
		'-resize',
		'88x88',
		'-quality',
		'82',
		'out.webp'
	]);
});
