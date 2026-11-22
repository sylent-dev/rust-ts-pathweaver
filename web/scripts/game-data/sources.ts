// The sources of the game data and their versions (docs/game-data.md), and their files downloaded
// once into a cache folder, so that a second run is fast.

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * The tag of the tree export of Grinding Gear Games: the last at or before the version of the
 * game, since the tree doesn't change at every patch (0.5.2 for 0.5.5).
 */
export const TREE_TAG = '0.5.2';

/** A file to download: its address, and its name in the cache. */
export interface SourceFile {
	url: string;
	name: string;
}

const TREE_URL = `https://raw.githubusercontent.com/grindinggear/poe2-skilltree-export/${TREE_TAG}`;

/**
 * RePoE serves the data of the latest version of the game only, at no fixed address: the version
 * it was read at is written with the data, in `sources.json`.
 */
const REPOE_URL = 'https://repoe-fork.github.io/poe2';

/** A file of the tree export, such as `data.json` or `assets/background-witch.webp`. */
export function treeFile(name: string): SourceFile {
	return { url: `${TREE_URL}/${name}`, name: `tree-${TREE_TAG}-${name.replaceAll('/', '-')}` };
}

/** A file of RePoE, such as `skill_gems.min.json`. */
export function repoeFile(name: string): SourceFile {
	return { url: `${REPOE_URL}/${name}`, name: `repoe-${name}` };
}

/**
 * Stops the script when RePoE, which serves the latest version of the game only, is at another
 * version than the one converted: its `version.txt` (`0.5.5.10`) must begin with it (`0.5.5`).
 */
export function checkRepoeVersion(repoe: string, gameVersion: string): void {
	if (repoe !== gameVersion && !repoe.startsWith(`${gameVersion}.`)) {
		throw new Error(`RePoE is at ${repoe}, not at the version converted, ${gameVersion}.`);
	}
}

/** Downloads files of the sources into a cache folder, each once. */
export class Downloads {
	readonly folder: string;

	constructor(folder: string) {
		this.folder = folder;
	}

	/** The path of a file in the cache, downloaded first if it isn't there yet. */
	async path(file: SourceFile): Promise<string> {
		const target = path.join(this.folder, file.name);
		if (!existsSync(target)) {
			const answer = await fetch(file.url);
			if (!answer.ok) {
				throw new Error(`${file.url}: ${answer.status} ${answer.statusText}`);
			}
			await mkdir(this.folder, { recursive: true });
			await writeFile(target, new Uint8Array(await answer.arrayBuffer()));
		}
		return target;
	}

	/** The text of a file of the sources. */
	async text(file: SourceFile): Promise<string> {
		return readFile(await this.path(file), 'utf8');
	}

	/** A file of the sources read as JSON, its shape still unchecked. */
	async json(file: SourceFile): Promise<unknown> {
		return JSON.parse(await this.text(file)) as unknown;
	}
}
