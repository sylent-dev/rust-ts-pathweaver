// The ascendancy of a build as the page names it (specs.md, Window layout: its portrait marks the
// build wherever it is named, its tab and its header): its name, its class and its portrait from
// the game data, or the id of the file when they don't know it.

import type { GameData } from '#lib/game-data/game-data.ts';
import type { PortraitSide } from '#lib/game-data/format.ts';
import { pageGameData } from '#lib/page/game-data.svelte.ts';

/** An ascendancy the game data know, or the id of one they don't, shown as the file writes it. */
export type NamedAscendancy =
	| { kind: 'known'; name: string; characterClass: string; portrait: string | undefined }
	| { kind: 'unknown'; id: string };

/**
 * The ascendancy of a build, named by the game data, or its id when they don't know it or
 * couldn't load (`gameData` undefined); none when the build has none.
 */
export function namedAscendancy(
	id: string | undefined,
	gameData: GameData | undefined,
	side: PortraitSide
): NamedAscendancy | undefined {
	if (id === undefined) {
		return undefined;
	}
	const ascendancy = gameData?.ascendancy(id);
	if (gameData === undefined || ascendancy === undefined) {
		return { kind: 'unknown', id };
	}
	return {
		kind: 'known',
		name: ascendancy.name,
		characterClass: ascendancy.characterClass,
		portrait: gameData.portrait(id, side)
	};
}

/**
 * The ascendancy of a build, named by the game data of the page once they have loaded or failed
 * (read in a `$derived`, it follows their load); none while they load or when the build has none.
 */
export function pageAscendancy(
	id: string | undefined,
	side: PortraitSide
): NamedAscendancy | undefined {
	const { state } = pageGameData;
	return state.kind === 'loading'
		? undefined
		: namedAscendancy(id, state.kind === 'loaded' ? state.gameData : undefined, side);
}
