// The gems of the game data, from RePoE (docs/game-data.md): `skill_gems.json` gives their names,
// kinds, colours and tags, `skills.json` the description of the skill a gem grants, and
// `gem_tags.json` the words of the game for each tag.

import type { Attribute, Gem, GemAttributes, GemKind, Gems } from '#lib/game-data/format.ts';
import {
	arrayAt,
	flagAt,
	numberAt,
	objectAt,
	optionalStringAt,
	ShapeError,
	stringAt
} from './json-shape.ts';

/** The attributes in the order of the game, which orders the two of a gem shared between them. */
const ATTRIBUTES: readonly Attribute[] = ['strength', 'dexterity', 'intelligence'];

/** The attribute of each colour of RePoE; « w » is a gem without one, or shared between several. */
const COLOUR_ATTRIBUTES: Readonly<Record<string, Attribute | null>> = {
	r: 'strength',
	g: 'dexterity',
	b: 'intelligence',
	w: null
};

/**
 * The words of a text of the game without its links: `[Ref|Words]` gives Words, `[Words]` Words;
 * its line breaks as `\n`, without the spaces around it.
 */
export function gameWords(text: string): string {
	return text
		.replace(/\[([^\]|]*)\|([^\]]*)\]|\[([^\]]*)\]/g, (_, _ref, words, alone) => words ?? alone)
		.replace(/\r\n?/g, '\n')
		.trim();
}

/** The kind of a gem, from its `gem_type` and `is_lineage`. */
export function gemKind(gemType: string, isLineage: boolean, place: string): GemKind {
	switch (gemType) {
		case 'active':
			return 'skill';
		case 'spirit':
			return 'spirit';
		case 'support':
			return isLineage ? 'lineage' : 'support';
		default:
			throw new ShapeError(`${place}.gem_type`, `active, spirit or support, not « ${gemType} »`);
	}
}

/**
 * The attributes of the colour of a gem: the one of its colour, even when its weights lean to
 * another too (25/75, Malice); for « w », the two its `requirement_weights` share half and half
 * (114 gems, `specs.md`, Skills), or none.
 */
export function gemAttributes(
	colour: string,
	weights: Readonly<Record<Attribute, number>>,
	place: string
): GemAttributes {
	if (!(colour in COLOUR_ATTRIBUTES)) {
		throw new ShapeError(`${place}.color`, `r, g, b or w, not « ${colour} »`);
	}
	const attribute = COLOUR_ATTRIBUTES[colour];
	if (attribute) {
		return [attribute];
	}
	const [first, second, ...others] = ATTRIBUTES.filter((name) => weights[name] > 0);
	if (first && second && others.length === 0 && weights[first] === weights[second]) {
		return [first, second];
	}
	return [];
}

/** The weight of each attribute of a gem, `requirement_weights` of RePoE. */
function weightsAt(value: unknown, place: string): Record<Attribute, number> {
	const weights = objectAt(value, place);
	return {
		strength: numberAt(weights.strength, `${place}.strength`),
		dexterity: numberAt(weights.dexterity, `${place}.dexterity`),
		intelligence: numberAt(weights.intelligence, `${place}.intelligence`)
	};
}

/**
 * The tags of a gem as the game names them; a tag the game hides (`strength`) has no name, and a
 * tag missing from `gem_tags.json` stops the script rather than vanish from the page.
 */
function tagNames(
	tags: unknown,
	names: Readonly<Record<string, unknown>>,
	place: string
): string[] {
	return arrayAt(tags, place).flatMap((value, index) => {
		const tag = stringAt(value, `${place}[${index}]`);
		if (!Object.hasOwn(names, tag)) {
			throw new ShapeError('gem_tags', `a tag « ${tag} », which ${place} names`);
		}
		const name = optionalStringAt(names[tag], `gem_tags.${tag}`);
		return name === undefined ? [] : [gameWords(name)];
	});
}

/** The description of a gem: the text of a support, or that of the first skill a gem grants. */
function description(
	entry: Readonly<Record<string, unknown>>,
	kind: GemKind,
	skills: unknown,
	place: string
): string {
	if (kind === 'support' || kind === 'lineage') {
		return gameWords(optionalStringAt(entry.support_text, `${place}.support_text`) ?? '');
	}
	const [granted] = arrayAt(entry.grants_skills ?? [], `${place}.grants_skills`);
	if (granted === undefined) {
		return '';
	}
	const skill = objectAt(skills, 'skills')[stringAt(granted, `${place}.grants_skills[0]`)];
	if (skill === undefined) {
		return '';
	}
	const active = objectAt(skill, `skills.${granted}`).active_skill;
	if (active === undefined) {
		return '';
	}
	const text = objectAt(active, `skills.${granted}.active_skill`).description;
	return gameWords(optionalStringAt(text, `skills.${granted}.active_skill.description`) ?? '');
}

/** One gem of `skill_gems.json`. */
function convertGem(
	value: unknown,
	skills: unknown,
	tags: Readonly<Record<string, unknown>>,
	place: string
): Gem {
	const entry = objectAt(value, place);
	const kind = gemKind(
		stringAt(entry.gem_type, `${place}.gem_type`),
		flagAt(entry.is_lineage, `${place}.is_lineage`),
		place
	);
	return {
		name: stringAt(
			objectAt(entry.base_item, `${place}.base_item`).display_name,
			`${place}.base_item.display_name`
		),
		kind,
		attributes: gemAttributes(
			stringAt(entry.color, `${place}.color`),
			weightsAt(entry.requirement_weights, `${place}.requirement_weights`),
			place
		),
		tags: tagNames(entry.tags, tags, `${place}.tags`),
		description: description(entry, kind, skills, place)
	};
}

/** Every gem of the game by its id, from the three files of RePoE. */
export function convertGems(skillGems: unknown, skills: unknown, gemTags: unknown): Gems {
	const tags = objectAt(gemTags, 'gem_tags');
	const gems: Gems = {};
	for (const [id, entry] of Object.entries(objectAt(skillGems, 'skill_gems'))) {
		gems[id] = convertGem(entry, skills, tags, `skill_gems.${id}`);
	}
	return gems;
}
