import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameData } from '#lib/game-data/game-data.ts';
import { PageGameData } from './game-data.svelte.ts';

const loadGameData = vi.hoisted(() => vi.fn<() => Promise<GameData>>());
vi.mock('#lib/game-data/game-data.ts', () => ({ loadGameData }));

const DATA: GameData = {
	version: '0.5.5',
	gem: () => undefined,
	ascendancy: () => undefined,
	portrait: () => undefined
};

describe('the game data of the page', () => {
	beforeEach(() => {
		loadGameData.mockReset();
	});

	it('load once, however many parts of the page ask for them', async () => {
		loadGameData.mockResolvedValue(DATA);
		const gameData = new PageGameData();
		const first = gameData.load();
		const second = gameData.load();
		expect(gameData.state).toEqual({ kind: 'loading' });
		expect([await first, await second, await gameData.load()]).toEqual([DATA, DATA, DATA]);
		expect(gameData.state).toEqual({ kind: 'loaded', gameData: DATA });
		expect(loadGameData).toHaveBeenCalledOnce();
	});

	it('load again after a failure, which they pass on and say', async () => {
		loadGameData.mockRejectedValueOnce(new Error('offline')).mockResolvedValue(DATA);
		const gameData = new PageGameData();
		await expect(gameData.load()).rejects.toThrow('offline');
		expect(gameData.state).toEqual({ kind: 'failed' });
		const again = gameData.load();
		expect(gameData.state).toEqual({ kind: 'loading' });
		expect(await again).toBe(DATA);
		expect(gameData.state).toEqual({ kind: 'loaded', gameData: DATA });
		expect(loadGameData).toHaveBeenCalledTimes(2);
	});
});
