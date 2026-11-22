// The ascendancies of the game data, from the tree export of Grinding Gear Games (docs/game-data.md):
// `data.json` lists the classes, each with its ascendancies, and the sprite of a class,
// `assets/background-<class>.webp`, holds their portraits in the same order.

import type { Ascendancies } from '#lib/game-data/format.ts';
import { arrayAt, objectAt, optionalStringAt, stringAt } from './json-shape.ts';

/** Where the portrait of an ascendancy is in the sprites of the tree export. */
export interface PortraitPlace {
	ascendancyId: string;
	/** The name of the sprite of its class, such as `witch` for `background-witch.webp`. */
	sprite: string;
	/** The name of its frame in the `.json` of the sprite, such as `classWitch:Class4`. */
	frame: string;
}

/** The ascendancies of the tree, and where their portraits are. */
export interface ConvertedAscendancies {
	ascendancies: Ascendancies;
	portraits: PortraitPlace[];
}

/**
 * The ascendancies of the tree export, by class. Frame 0 of a sprite is the class; frame `n` the
 * `n`-th ascendancy of its list, the slots without a name included (`Ranger2`, unused in 0.5.2),
 * which are left out: `Witch3b`, the fourth of the Witch, is `classWitch:Class4`.
 */
export function convertAscendancies(tree: unknown): ConvertedAscendancies {
	const converted: ConvertedAscendancies = { ascendancies: {}, portraits: [] };
	const classes = arrayAt(objectAt(tree, 'tree').classes, 'tree.classes');
	classes.forEach((value, classIndex) => {
		const place = `tree.classes[${classIndex}]`;
		const characterClass = objectAt(value, place);
		const className = stringAt(characterClass.name, `${place}.name`);
		const list = arrayAt(characterClass.ascendancies ?? [], `${place}.ascendancies`);
		list.forEach((entry, index) => {
			const ascendancy = objectAt(entry, `${place}.ascendancies[${index}]`);
			const id = stringAt(ascendancy.id, `${place}.ascendancies[${index}].id`);
			const name = optionalStringAt(ascendancy.name, `${place}.ascendancies[${index}].name`);
			if (name === undefined) {
				return;
			}
			converted.ascendancies[id] = { name, characterClass: className };
			converted.portraits.push({
				ascendancyId: id,
				sprite: className.toLowerCase(),
				frame: `class${className}:Class${index + 1}`
			});
		});
	});
	return converted;
}
