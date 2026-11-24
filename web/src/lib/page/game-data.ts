// The game data of the page (docs/game-data.md): loaded once, when a build first needs them, and
// read by every part of the page from the same promise, since `loadGameData` loads them again at
// each call.

import { type GameData, loadGameData } from '#lib/game-data/game-data.ts';

/** The game data being loaded or loaded, none before the first call or after a failure. */
let loading: Promise<GameData> | undefined;

/**
 * The game data of the page, loaded at the first call and kept for the next ones. A failure isn't
 * kept: the next call loads them again, so that a network come back gives them.
 */
export function pageGameData(): Promise<GameData> {
	loading ??= loadGameData().catch((error: unknown) => {
		loading = undefined;
		throw error;
	});
	return loading;
}
