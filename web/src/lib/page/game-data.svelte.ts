// The game data of the page (docs/game-data.md): loaded once, when a build first needs them, and
// read by every part of the page from the same load, since `loadGameData` loads them again at
// each call; their state, which the header and the tabs of the open builds name an ascendancy by
// (docs/technical-choices.md, State of the interface).

import { type GameData, loadGameData } from '#lib/game-data/game-data.ts';

/** Where the load of the game data stands. */
export type GameDataState =
	{ kind: 'loading' } | { kind: 'loaded'; gameData: GameData } | { kind: 'failed' };

/** The game data of the page and where their load stands. */
export class PageGameData {
	/** Replaced whole, never changed in place: the game data are handed as they are, no proxy. */
	#state = $state.raw<GameDataState>({ kind: 'loading' });
	/** The load under way or done, none before the first call or after a failure. */
	#loading: Promise<GameData> | undefined;

	/** Where the load stands: loading until the first call has loaded them or failed. */
	get state(): GameDataState {
		return this.#state;
	}

	/**
	 * Loads the game data at the first call and keeps them for the next ones. A failure isn't
	 * kept: the next call loads them again, so that a network come back gives them.
	 */
	load(): Promise<GameData> {
		if (this.#loading === undefined) {
			this.#state = { kind: 'loading' };
			this.#loading = loadGameData().then(
				(gameData) => {
					this.#state = { kind: 'loaded', gameData };
					return gameData;
				},
				(error: unknown) => {
					this.#loading = undefined;
					this.#state = { kind: 'failed' };
					throw error;
				}
			);
		}
		return this.#loading;
	}
}

/** The game data of the page. */
export const pageGameData = new PageGameData();
