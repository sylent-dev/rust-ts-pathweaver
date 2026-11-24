import { describe, expect, it } from 'vitest';
import { loadGameData } from '#lib/game-data/game-data.ts';
import { namedAscendancy } from './named-ascendancy.ts';

describe('namedAscendancy', () => {
	it('names an ascendancy the game data know, with its class and its portrait', async () => {
		const gameData = await loadGameData();
		expect(namedAscendancy('Witch3b', gameData, 88)).toEqual({
			kind: 'known',
			name: 'Abyssal Lich',
			characterClass: 'Witch',
			portrait: gameData.portrait('Witch3b', 88)
		});
		expect(gameData.portrait('Witch3b', 88)).toMatch(/witch3b-88/);
	});

	it('gives the id of the file when the game data know it not, or could not load', async () => {
		const gameData = await loadGameData();
		expect([
			namedAscendancy('Ranger2', gameData, 88),
			namedAscendancy('witch3b', gameData, 88),
			namedAscendancy('Witch3b', undefined, 88)
		]).toEqual([
			{ kind: 'unknown', id: 'Ranger2' },
			{ kind: 'unknown', id: 'witch3b' },
			{ kind: 'unknown', id: 'Witch3b' }
		]);
	});

	it('gives none for a build without an ascendancy', async () => {
		expect(namedAscendancy(undefined, await loadGameData(), 88)).toBeUndefined();
	});
});
