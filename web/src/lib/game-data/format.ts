// The files of the game data, one folder per version of the game (see docs/game-data.md): written
// by scripts/game-data/, read by the page. Only what Pathweaver shows is kept.

/** An attribute of the game, which colours a gem. */
export type Attribute = 'strength' | 'dexterity' | 'intelligence';

/**
 * The attributes of the colour of a gem: none (a gem without an attribute, or of three), the one
 * of its colour (a gem that leans to one, 25/75, keeps it), or two shared half and half, in the
 * order of the game (strength, dexterity, intelligence).
 */
export type GemAttributes = [] | [Attribute] | [Attribute, Attribute];

/** What a gem is, which its mark shows (`specs.md`, Skills). */
export type GemKind = 'skill' | 'spirit' | 'support' | 'lineage';

/** A gem as the page shows it. */
export interface Gem {
	name: string;
	kind: GemKind;
	attributes: GemAttributes;
	/** Its tags as the game names them, in the order of the game data, without those it hides. */
	tags: string[];
	/** The text of a support, or the description of the skill a gem grants; empty when the game data have none. */
	description: string;
}

/** The gems by their id, such as `Metadata/Items/Gem/SkillGemSpark`, in `<version>/<language>/gems.json`. */
export type Gems = Record<string, Gem>;

/** An ascendancy as the page names it. */
export interface Ascendancy {
	name: string;
	/** The name of its class, such as `Witch`. */
	characterClass: string;
}

/** The ascendancies by their id, such as `Witch3b`, in `<version>/<language>/ascendancies.json`. */
export type Ascendancies = Record<string, Ascendancy>;

/** The versions of the sources a folder was converted from, in `<version>/sources.json`. */
export interface Sources {
	/** The tag of the tree export of Grinding Gear Games, such as `0.5.2`. */
	treeExport: string;
	/** The version of the game RePoE was exported from, its `version.txt`. */
	repoe: string;
}
