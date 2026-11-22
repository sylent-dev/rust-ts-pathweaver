import { describe, expect, it } from 'vitest';
import { convertGems, gameWords, gemAttributes, gemKind } from './gems.ts';
import { ShapeError } from './json-shape.ts';

/** The weights of `requirement_weights`, in the order of the game. */
function weights(strength: number, dexterity: number, intelligence: number) {
	return { strength, dexterity, intelligence };
}

/** An entry of `skill_gems.json` with what the conversion reads, `overrides` replacing it. */
function skillGem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		base_item: { display_name: 'Spark', id: 'Metadata/Items/Gem/SkillGemSpark' },
		color: 'b',
		gem_type: 'active',
		grants_skills: ['SparkPlayer'],
		requirement_weights: weights(0, 0, 100),
		tags: ['intelligence', 'spell', 'area'],
		...overrides
	};
}

const TAGS = {
	intelligence: null,
	spell: '[Spell]',
	area: '[AoESkill|AoE]',
	support: '[SupportGem|Support]'
};
const SKILLS = {
	SparkPlayer: { active_skill: { description: 'Launch a [Lightning] Projectile.\r\n' } }
};

describe('gameWords', () => {
	it('keeps the words of the links of the game, without their references', () => {
		expect(gameWords('Deals [Lightning] damage in an [AoESkill|area]')).toBe(
			'Deals Lightning damage in an area'
		);
	});

	it('writes the line breaks of the game as one character, without the spaces around the text', () => {
		expect(gameWords(' First line.\r\nSecond line.\r\n')).toBe('First line.\nSecond line.');
	});
});

describe('gemKind', () => {
	it('reads each kind of the game data', () => {
		expect([
			gemKind('active', false, 'gem'),
			gemKind('spirit', false, 'gem'),
			gemKind('support', false, 'gem'),
			gemKind('support', true, 'gem')
		]).toEqual(['skill', 'spirit', 'support', 'lineage']);
	});

	it('stops on a kind it does not know rather than guess one', () => {
		expect(() => gemKind('passive', false, 'skill_gems.X')).toThrow(
			new ShapeError('skill_gems.X.gem_type', 'active, spirit or support, not « passive »')
		);
	});
});

describe('gemAttributes', () => {
	it('gives the attribute of a coloured gem, even one that leans to another too', () => {
		expect([
			gemAttributes('r', weights(100, 0, 0), 'gem'),
			gemAttributes('g', weights(0, 60, 40), 'gem'),
			gemAttributes('b', weights(25, 0, 75), 'gem')
		]).toEqual([['strength'], ['dexterity'], ['intelligence']]);
	});

	it('gives the two attributes of a white gem shared half and half, in the order of the game', () => {
		expect([
			gemAttributes('w', weights(0, 50, 50), 'gem'),
			gemAttributes('w', weights(50, 0, 50), 'gem'),
			gemAttributes('w', weights(50, 50, 0), 'gem')
		]).toEqual([
			['dexterity', 'intelligence'],
			['strength', 'intelligence'],
			['strength', 'dexterity']
		]);
	});

	it('gives no attribute to a white gem of none, of one, of three, or of two unequal', () => {
		expect([
			gemAttributes('w', weights(0, 0, 0), 'gem'),
			gemAttributes('w', weights(0, 100, 0), 'gem'),
			gemAttributes('w', weights(33, 33, 34), 'gem'),
			gemAttributes('w', weights(0, 40, 60), 'gem')
		]).toEqual([[], [], [], []]);
	});

	it('stops on a colour it does not know', () => {
		expect(() => gemAttributes('y', weights(0, 0, 0), 'skill_gems.X')).toThrow(
			new ShapeError('skill_gems.X.color', 'r, g, b or w, not « y »')
		);
	});
});

describe('convertGems', () => {
	it('keeps the name, kind, attributes, shown tags and description of each gem', () => {
		const support = skillGem({
			base_item: { display_name: 'Arcane Tempo' },
			color: 'w',
			gem_type: 'support',
			is_lineage: false,
			requirement_weights: weights(0, 50, 50),
			support_text: 'Supports [Spell|Spells] you cast.',
			tags: ['support', 'spell']
		});
		expect(
			convertGems(
				{
					'Metadata/Items/Gem/SkillGemSpark': skillGem(),
					'Metadata/Items/Gems/SupportGemArcaneTempo': support
				},
				SKILLS,
				TAGS
			)
		).toEqual({
			'Metadata/Items/Gem/SkillGemSpark': {
				name: 'Spark',
				kind: 'skill',
				attributes: ['intelligence'],
				tags: ['Spell', 'AoE'],
				description: 'Launch a Lightning Projectile.'
			},
			'Metadata/Items/Gems/SupportGemArcaneTempo': {
				name: 'Arcane Tempo',
				kind: 'support',
				attributes: ['dexterity', 'intelligence'],
				tags: ['Support', 'Spell'],
				description: 'Supports Spells you cast.'
			}
		});
	});

	it('leaves the description empty when the game data have none', () => {
		const gems = convertGems(
			{
				granting: skillGem({ grants_skills: [] }),
				unknownSkill: skillGem({ grants_skills: ['Missing'] }),
				undescribed: skillGem({ grants_skills: ['Plain'] }),
				support: skillGem({ gem_type: 'support' })
			},
			{ Plain: { active_skill: {} } },
			TAGS
		);
		expect(Object.values(gems).map((gem) => gem.description)).toEqual(['', '', '', '']);
	});

	it('stops at the place of a value of another shape', () => {
		expect(() => convertGems({ X: skillGem({ base_item: {} }) }, SKILLS, TAGS)).toThrow(
			new ShapeError('skill_gems.X.base_item.display_name', 'a string')
		);
	});
});
