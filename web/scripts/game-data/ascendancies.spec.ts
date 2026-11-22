import { describe, expect, it } from 'vitest';
import { convertAscendancies } from './ascendancies.ts';
import { ShapeError } from './json-shape.ts';

/** A class of `data.json` with the ascendancies of its list, a slot without a name as `null`. */
function characterClass(name: string, ascendancies: [string, string | null][]) {
	return { name, ascendancies: ascendancies.map(([id, ascendancy]) => ({ id, name: ascendancy })) };
}

describe('convertAscendancies', () => {
	it('names each ascendancy with its class, and finds its portrait by its place in the list', () => {
		const tree = {
			classes: [
				{ name: 'Marauder' },
				characterClass('Ranger', [
					['Ranger1', 'Deadeye'],
					['Ranger2', null],
					['Ranger3', 'Pathfinder']
				]),
				characterClass('Witch', [
					['Witch1', 'Infernalist'],
					['Witch2', 'Blood Mage'],
					['Witch3', 'Lich'],
					['Witch3b', 'Abyssal Lich']
				])
			]
		};
		expect(convertAscendancies(tree)).toEqual({
			ascendancies: {
				Ranger1: { name: 'Deadeye', characterClass: 'Ranger' },
				Ranger3: { name: 'Pathfinder', characterClass: 'Ranger' },
				Witch1: { name: 'Infernalist', characterClass: 'Witch' },
				Witch2: { name: 'Blood Mage', characterClass: 'Witch' },
				Witch3: { name: 'Lich', characterClass: 'Witch' },
				Witch3b: { name: 'Abyssal Lich', characterClass: 'Witch' }
			},
			portraits: [
				{ ascendancyId: 'Ranger1', sprite: 'ranger', frame: 'classRanger:Class1' },
				{ ascendancyId: 'Ranger3', sprite: 'ranger', frame: 'classRanger:Class3' },
				{ ascendancyId: 'Witch1', sprite: 'witch', frame: 'classWitch:Class1' },
				{ ascendancyId: 'Witch2', sprite: 'witch', frame: 'classWitch:Class2' },
				{ ascendancyId: 'Witch3', sprite: 'witch', frame: 'classWitch:Class3' },
				{ ascendancyId: 'Witch3b', sprite: 'witch', frame: 'classWitch:Class4' }
			]
		});
	});

	it('stops at the place of a value of another shape', () => {
		expect(() =>
			convertAscendancies({ classes: [{ name: 'Witch', ascendancies: [{ name: 'Lich' }] }] })
		).toThrow(new ShapeError('tree.classes[0].ascendancies[0].id', 'a string'));
	});
});
