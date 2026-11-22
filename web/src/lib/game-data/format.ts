// The files of the game data, one folder per version of the game (see docs/game-data.md): written
// by scripts/game-data/, read by the page (game-data.ts). Only what Pathweaver shows is kept.

/**
 * The version of the game the page reads the data of, and the script writes: the name of their
 * folder, and the version the page names beside an unknown id (`specs.md`, Unknown and invalid
 * entries).
 */
export const GAME_VERSION = '0.5.5';

/** The language of the texts of the game, the only one of version 1 (`specs.md`, Languages). */
export const GAME_LANGUAGE = 'en';

/**
 * The sides of the portraits, in pixels, each the largest square inside the disc of the game
 * (the owner, 2026-11-17): 88 for a tab of the open builds (44 pixels, twice for the screens of a
 * higher density), which the header (66) and the library (56) show too, as in the mock-up; 520 for
 * the colophon of the About tab (its column of 260 pixels, twice).
 */
export const PORTRAIT_SIDES = [88, 520] as const;

/** The side of a portrait, one of {@link PORTRAIT_SIDES}. */
export type PortraitSide = (typeof PORTRAIT_SIDES)[number];

/** The name of the file of a portrait in `<version>/portraits/`, such as `witch3b-88.webp`. */
export function portraitFile(ascendancyId: string, side: PortraitSide): string {
	return `${ascendancyId.toLowerCase()}-${side}.webp`;
}

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
	/** The text of a support, or the description of the skill a gem grants; absent when the game data have none. */
	description?: string;
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
	/** The tag of the tree export of Grinding Gear Games, such as `0.5.2`, the last before 0.5.5. */
	treeExport: string;
	/** The version of the game RePoE was exported from, its `version.txt`. */
	repoe: string;
}
