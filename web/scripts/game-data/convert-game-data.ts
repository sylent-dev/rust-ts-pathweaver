// Converts the game data of one version of the game into the files of the website (see
// docs/game-data.md and the `update-game-data` skill), in `src/lib/game-data/<version>/`:
//
//     node scripts/game-data/convert-game-data.ts [--cache <folder>]
//
// From `web/`. The downloads go to the cache folder, a new temporary one by default: give the same
// folder again to run the script once more without downloading, never across versions of RePoE,
// which serves its latest data under the same names.

import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import type { Sources } from '#lib/game-data/format.ts';
import { convertAscendancies } from './ascendancies.ts';
import { convertGems } from './gems.ts';
import { writePortraits } from './portraits.ts';
import { tableJson } from './table-json.ts';
import { Downloads, GAME_VERSION, repoeFile, TREE_TAG, treeFile } from './sources.ts';

/** The language of the texts of the game, the only one of version 1 (`specs.md`, Languages). */
const LANGUAGE = 'en';

const webDirectory = path.resolve(import.meta.dirname, '..', '..');
const versionDirectory = path.join(webDirectory, 'src', 'lib', 'game-data', GAME_VERSION);

/** Writes a file of the game data, its folder made first. */
async function write(relativePath: string, text: string): Promise<void> {
	const target = path.join(versionDirectory, relativePath);
	await mkdir(path.dirname(target), { recursive: true });
	await writeFile(target, text);
	console.log(`wrote ${path.relative(webDirectory, target)}`);
}

async function main(): Promise<void> {
	const { values } = parseArgs({ options: { cache: { type: 'string' } } });
	const cache = values.cache ?? (await mkdtemp(path.join(os.tmpdir(), 'pathweaver-game-data-')));
	const downloads = new Downloads(cache);
	console.log(`downloads in ${cache}`);

	const sources: Sources = {
		treeExport: TREE_TAG,
		repoe: (await downloads.text(repoeFile('version.txt'))).trim()
	};
	const gems = convertGems(
		await downloads.json(repoeFile('skill_gems.min.json')),
		await downloads.json(repoeFile('skills.min.json')),
		await downloads.json(repoeFile('gem_tags.min.json'))
	);
	const { ascendancies, portraits } = convertAscendancies(
		await downloads.json(treeFile('data.json'))
	);

	await write('sources.json', `${JSON.stringify(sources, null, '\t')}\n`);
	await write(path.join(LANGUAGE, 'gems.json'), tableJson(gems));
	await write(path.join(LANGUAGE, 'ascendancies.json'), tableJson(ascendancies));
	await writePortraits(downloads, portraits, path.join(versionDirectory, 'portraits'));
	console.log(`wrote ${portraits.length} portraits`);
	const withoutDescription = Object.values(gems).filter((gem) => gem.description === '').length;
	console.log(
		`${Object.keys(gems).length} gems (${withoutDescription} without a description), ` +
			`${Object.keys(ascendancies).length} ascendancies, RePoE at ${sources.repoe}`
	);
}

try {
	await main();
} catch (error) {
	console.error(`convert-game-data: ${error instanceof Error ? error.message : String(error)}`);
	process.exit(1);
}
