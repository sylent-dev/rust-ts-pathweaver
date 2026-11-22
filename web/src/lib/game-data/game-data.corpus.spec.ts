// The ids of the builds of the corpus, `inputs/builds/` (local only, never committed), looked up
// in the game data of the page: the test to run again, and to look at, at each new version of the
// game data (the `update-game-data` skill). Skipped where the corpus isn't, as in the CI.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadGameData } from './game-data.ts';

const corpus = fileURLToPath(new URL('../../../../inputs/builds', import.meta.url));

/** The id of an entry of a build: a string, or the `id` of an object. */
function idOf(entry: unknown): string | undefined {
	if (typeof entry === 'string') {
		return entry;
	}
	if (typeof entry === 'object' && entry !== null && 'id' in entry) {
		return typeof entry.id === 'string' ? entry.id : undefined;
	}
	return undefined;
}

/** The ids of the gems of a build, its skills and their supports. */
function gemIds(build: { skills?: unknown }): string[] {
	const skills = Array.isArray(build.skills) ? build.skills : [];
	return skills.flatMap((skill: unknown) => {
		const supports =
			typeof skill === 'object' && skill !== null && 'support_skills' in skill
				? skill.support_skills
				: [];
		return [skill, ...(Array.isArray(supports) ? supports : [])].flatMap(
			(entry) => idOf(entry) ?? []
		);
	});
}

/**
 * The 21 references of the corpus the game data don't have (docs/build-files-in-the-wild.md,
 * measured on 2026-11-16): a file written by hand and two test files, with the wrong folder
 * (`Gem/` for `Gems/`, or the other way) or a gem that doesn't exist; in the order of the files.
 */
const MISSES = [
	'companion-fixture-deadeye.build: Metadata/Items/Gems/SkillGemIceShot',
	'companion-fixture-deadeye.build: Metadata/Items/Gems/SkillGemDoesNotExistFixture',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemBrink',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gem/SkillGemRollingSlam',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemBrink',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gem/SkillGemBoneshatter',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SkillGemShieldWall',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemMagnifiedEffectThree',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemImpale',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemHeft',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemRagingCry',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemTireless',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemMagnifiedEffectThree',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SkillGemFortifyingCry',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemRagingCry',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemHeft',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemMagnifiedEffectThree',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SkillGemWarBanner',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SupportGemMagnifiedEffectThree',
	'ferox-shield-wall-leveling.build: Metadata/Items/Gems/SkillGemScavengedPlating',
	'pobr-writer-fixture.build: Metadata/Items/Gem/SupportGemFastForward'
];

describe.skipIf(!existsSync(corpus))('the corpus', () => {
	const builds = readdirSync(corpus)
		.filter((name) => name.endsWith('.build'))
		.sort()
		.map((name) => ({
			name,
			// Some tools write a byte order mark before the JSON.
			build: JSON.parse(readFileSync(path.join(corpus, name), 'utf8').replace(/^\uFEFF/, '')) as {
				ascendancy?: unknown;
				skills?: unknown;
			}
		}));

	it('holds builds to look up', () => {
		expect(builds.length).toBeGreaterThan(30);
	});

	it('finds every gem and every ascendancy of the corpus in the game data, but its 21 misses', async () => {
		const data = await loadGameData();
		const unknown = builds.flatMap(({ name, build }) => [
			...gemIds(build)
				.filter((id) => data.gem(id) === undefined)
				.map((id) => `${name}: ${id}`),
			...(typeof build.ascendancy === 'string' && data.ascendancy(build.ascendancy) === undefined
				? [`${name}: ${build.ascendancy}`]
				: [])
		]);
		expect(unknown).toEqual(MISSES);
	});
});
