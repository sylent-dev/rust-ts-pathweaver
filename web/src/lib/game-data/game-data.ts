// The game data as the page reads them (see docs/game-data.md): the files of a version and a
// language, loaded once when a build first needs them, and the lookup of an id.
//
// Vite copies each file under a name made from its contents, which the browser keeps without
// asking again (`static/_headers`), and loads a file only when the page asks for it.

import {
	type Ascendancies,
	type Ascendancy,
	GAME_LANGUAGE,
	GAME_VERSION,
	type Gem,
	type Gems,
	portraitFile,
	type PortraitSide
} from './format.ts';

const gemFiles = import.meta.glob<Gems>('./*/*/gems.json', { import: 'default' });
const ascendancyFiles = import.meta.glob<Ascendancies>('./*/*/ascendancies.json', {
	import: 'default'
});
// The addresses of the portraits only, a few bytes each: an image loads when the page shows it.
const portraitFiles = import.meta.glob<string>('./*/portraits/*.webp', {
	query: '?url',
	import: 'default',
	eager: true
});

/** The game data of one version of the game, in one language. */
export interface GameData {
	/** The version of the game they are for, such as `0.5.2`. */
	readonly version: string;
	/** The gem of an id, such as `Metadata/Items/Gem/SkillGemSpark`, or `undefined` if unknown. */
	gem(id: string): Gem | undefined;
	/** The ascendancy of an id, such as `Witch3b`, or `undefined` if unknown. */
	ascendancy(id: string): Ascendancy | undefined;
	/** The address of the portrait of an ascendancy, or `undefined` if it has none. */
	portrait(ascendancyId: string, side: PortraitSide): string | undefined;
}

/**
 * A table of the game data by id. A `Map`, so that an id is compared exactly with the ids of the
 * game (`specs.md`, Unknown and invalid entries): an id of a stranger's file such as `constructor`
 * finds nothing, where the properties of an object would give the ones every object inherits.
 */
function byId<T>(table: Readonly<Record<string, T>>): ReadonlyMap<string, T> {
	return new Map(Object.entries(table));
}

/** Loads a file of the game data, or says which is missing. */
async function load<T>(
	files: Record<string, () => Promise<T>>,
	version: string,
	name: string
): Promise<T> {
	const file = files[`./${version}/${name}`];
	if (file === undefined) {
		throw new Error(`game data: no ${name} for ${version}`);
	}
	return file();
}

/**
 * Loads the game data of a version and a language. A failure is written to the console with its
 * cause, then passed on to the page, which says it.
 */
export async function loadGameData(
	version: string = GAME_VERSION,
	language: string = GAME_LANGUAGE
): Promise<GameData> {
	try {
		const [gems, ascendancies] = await Promise.all([
			load(gemFiles, version, `${language}/gems.json`).then(byId),
			load(ascendancyFiles, version, `${language}/ascendancies.json`).then(byId)
		]);
		return {
			version,
			gem: (id) => gems.get(id),
			ascendancy: (id) => ascendancies.get(id),
			portrait: (ascendancyId, side) =>
				ascendancies.has(ascendancyId)
					? portraitFiles[`./${version}/portraits/${portraitFile(ascendancyId, side)}`]
					: undefined
		};
	} catch (error) {
		console.error('game data: the files could not load', error);
		throw error;
	}
}
