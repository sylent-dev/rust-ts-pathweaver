// The portraits of the ascendancies (docs/game-data.md), cut from the sprites of the tree export,
// `assets/background-<class>.webp`: a round portrait of 1,500 pixels per ascendancy, placed by the
// `.json` beside it. ImageMagick (`magick`) cuts them, as for the mock-up.

import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { PORTRAIT_SIDES, portraitFile } from '#lib/game-data/format.ts';
import type { PortraitPlace } from './ascendancies.ts';
import { numberAt, objectAt, ShapeError } from './json-shape.ts';
import { type Downloads, treeFile } from './sources.ts';

/** The quality of the WebP of a portrait, as in the mock-up. */
const WEBP_QUALITY = 82;

/** A rectangle of a sprite, in pixels. */
export interface Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** The largest square inside the disc of a frame, centred, in whole pixels. */
export function squareInDisc(frame: Rectangle): Rectangle {
	const side = Math.floor(frame.width / Math.SQRT2);
	const inset = Math.floor((frame.width - side) / 2);
	return { x: frame.x + inset, y: frame.y + inset, width: side, height: side };
}

/** The rectangle of a frame of the `.json` of a sprite, which must be a square: a disc inside. */
export function frameAt(sprite: unknown, frame: string, place: string): Rectangle {
	const frames = objectAt(objectAt(sprite, place).frames, `${place}.frames`);
	if (!(frame in frames)) {
		throw new ShapeError(`${place}.frames`, `a frame « ${frame} »`);
	}
	const rectangle = objectAt(
		objectAt(frames[frame], `${place}.frames.${frame}`).frame,
		`${place}.frames.${frame}.frame`
	);
	const at = (field: string) =>
		numberAt(rectangle[field], `${place}.frames.${frame}.frame.${field}`);
	const [x, y, width, height] = [at('x'), at('y'), at('w'), at('h')];
	if (width !== height) {
		throw new ShapeError(`${place}.frames.${frame}.frame`, 'a square');
	}
	return { x, y, width, height };
}

/** The arguments of `magick` that cut a square of a sprite and make it `side` pixels wide. */
export function cutArguments(
	sprite: string,
	square: Rectangle,
	side: number,
	target: string
): string[] {
	return [
		sprite,
		'-crop',
		`${square.width}x${square.height}+${square.x}+${square.y}`,
		'+repage',
		'-resize',
		`${side}x${side}`,
		'-quality',
		String(WEBP_QUALITY),
		target
	];
}

/** Stops the script with a clear message when ImageMagick isn't installed. */
function checkMagick(): void {
	try {
		execFileSync('magick', ['-version'], { stdio: 'ignore' });
	} catch {
		throw new Error('ImageMagick 7 (the `magick` command) is needed to cut the portraits.');
	}
}

/** Writes the portraits of every ascendancy, at each side, into `folder`. */
export async function writePortraits(
	downloads: Downloads,
	places: readonly PortraitPlace[],
	folder: string
): Promise<void> {
	checkMagick();
	await mkdir(folder, { recursive: true });
	for (const place of places) {
		const spriteName = `assets/background-${place.sprite}`;
		const frame = frameAt(
			await downloads.json(treeFile(`${spriteName}.json`)),
			place.frame,
			`${spriteName}.json`
		);
		const sprite = await downloads.path(treeFile(`${spriteName}.webp`));
		for (const side of PORTRAIT_SIDES) {
			const target = path.join(folder, portraitFile(place.ascendancyId, side));
			execFileSync('magick', cutArguments(sprite, squareInDisc(frame), side, target));
		}
	}
}
