import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameData } from '#lib/game-data/game-data.ts';

const loadGameData = vi.hoisted(() => vi.fn<() => Promise<GameData>>());
vi.mock('#lib/game-data/game-data.ts', () => ({ loadGameData }));

/** The module as a fresh page loads it, without the game data of the test before. */
async function freshModule(): Promise<typeof import('./game-data.ts')> {
	vi.resetModules();
	return import('./game-data.ts');
}

const DATA: GameData = {
	version: '0.5.5',
	gem: () => undefined,
	ascendancy: () => undefined,
	portrait: () => undefined
};

describe('pageGameData', () => {
	beforeEach(() => {
		loadGameData.mockReset();
	});

	it('loads the game data once, however many parts of the page ask for them', async () => {
		loadGameData.mockResolvedValue(DATA);
		const { pageGameData } = await freshModule();
		const first = pageGameData();
		const second = pageGameData();
		expect([await first, await second, loadGameData.mock.calls.length]).toEqual([DATA, DATA, 1]);
		expect(await pageGameData()).toBe(DATA);
		expect(loadGameData).toHaveBeenCalledOnce();
	});

	it('loads them again after a failure, which it passes on', async () => {
		loadGameData.mockRejectedValueOnce(new Error('offline')).mockResolvedValue(DATA);
		const { pageGameData } = await freshModule();
		await expect(pageGameData()).rejects.toThrow('offline');
		expect(await pageGameData()).toBe(DATA);
		expect(loadGameData).toHaveBeenCalledTimes(2);
	});
});
