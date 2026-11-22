import { describe, expect, it, vi } from 'vitest';
import ascendancies from './0.5.2/en/ascendancies.json';
import gems from './0.5.2/en/gems.json';
import { loadGameData } from './game-data.ts';

describe('loadGameData', () => {
	it('loads the game data of the version and language of the page', async () => {
		const data = await loadGameData();
		expect(data.version).toBe('0.5.2');
		expect(data.gem('Metadata/Items/Gems/SkillGemSpark')).toEqual(
			gems['Metadata/Items/Gems/SkillGemSpark']
		);
		expect(data.ascendancy('Witch3b')).toEqual(ascendancies.Witch3b);
	});

	it('finds an id written exactly as in the game data only', async () => {
		const data = await loadGameData();
		expect([
			// The gems of the game live in two folders: Spark in `Gems/`, never in `Gem/`.
			data.gem('Metadata/Items/Gem/SkillGemSpark'),
			data.gem('metadata/items/gems/skillgemspark'),
			data.gem('SkillGemSpark'),
			// The properties every object inherits, which a file of a stranger may write as an id.
			data.gem('constructor'),
			data.gem('__proto__'),
			data.ascendancy('toString'),
			data.ascendancy('witch3b'),
			data.ascendancy('Ranger2')
		]).toEqual([
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined
		]);
	});

	it('gives the address of the portrait of a known ascendancy, at each side', async () => {
		const data = await loadGameData();
		expect(data.portrait('Witch3b', 88)).toMatch(/witch3b-88.*\.webp$/);
		expect(data.portrait('Witch3b', 520)).toMatch(/witch3b-520.*\.webp$/);
		expect([data.portrait('witch3b', 88), data.portrait('Ranger2', 88)]).toEqual([
			undefined,
			undefined
		]);
	});

	it('says which file is missing for a version it does not have', async () => {
		const console = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
		await expect(loadGameData('0.1.0')).rejects.toThrow('game data: no en/gems.json for 0.1.0');
		expect(console).toHaveBeenCalledOnce();
	});
});
