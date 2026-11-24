import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { OpenBuilds, type OpenBuild } from './open-builds.svelte.ts';

/** A build as the core reads it, from level 1 to 100, with its markers. */
function build(contentKey: string, markers: number[] = []): OpenBuild {
	return { contentKey, levels: { lowest: 1, highest: 100, markers } };
}

/** A guide of the maps, from level 65 to 100. */
const mapsGuide: OpenBuild = {
	contentKey: 'maps',
	levels: { lowest: 65, highest: 100, markers: [] }
};

/** The open builds, once each of the builds given is opened in turn. */
function opened(...builds: OpenBuild[]): OpenBuilds {
	const openBuilds = new OpenBuilds();
	for (const read of builds) {
		openBuilds.open(read);
	}
	return openBuilds;
}

/** The keys of the open builds, in their order. */
function keys(openBuilds: OpenBuilds): string[] {
	return openBuilds.all.map((open) => open.contentKey);
}

describe('opening a build', () => {
	it('shows nothing while no build is open', () => {
		const openBuilds = new OpenBuilds();
		expect(openBuilds.all).toEqual([]);
		expect(openBuilds.shown).toBeUndefined();
	});

	it('adds it to the list and shows it at the highest level it covers', () => {
		const openBuilds = opened(build('a'), {
			...mapsGuide,
			levels: { lowest: 65, highest: 90, markers: [] }
		});
		expect(keys(openBuilds)).toEqual(['a', 'maps']);
		expect(openBuilds.shown).toEqual({
			contentKey: 'maps',
			levels: { lowest: 65, highest: 90, markers: [] }
		});
		expect(openBuilds.level).toBe(90);
	});

	it('shows the build already open rather than adding the same content again', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.show('a');
		openBuilds.showLevel(20);
		openBuilds.show('b');
		openBuilds.open(build('a'));
		expect(keys(openBuilds)).toEqual(['a', 'b']);
		expect(openBuilds.shown).toEqual(build('a'));
		expect(openBuilds.level).toBe(20);
	});
});

describe('showing an open build', () => {
	it('keeps the level of each build', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.showLevel(30);
		openBuilds.show('a');
		expect(openBuilds.level).toBe(100);
		openBuilds.show('b');
		expect(openBuilds.level).toBe(30);
	});

	it('changes nothing for a key of no open build', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.show('c');
		expect(openBuilds.shown?.contentKey).toBe('b');
	});
});

describe('showing no build, for the library', () => {
	it('keeps the builds open', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.showNone();
		expect(keys(openBuilds)).toEqual(['a', 'b']);
		expect(openBuilds.shown).toBeUndefined();
		expect(openBuilds.level).toBeUndefined();
	});

	it('leaves the levels alone: no build is there to move', () => {
		const openBuilds = opened(build('a', [12]));
		openBuilds.showLevel(30);
		openBuilds.showNone();
		openBuilds.showLevel(50);
		openBuilds.showMarker('previous');
		expect(openBuilds.markerBeside('previous')).toBeUndefined();
		openBuilds.show('a');
		expect(openBuilds.level).toBe(30);
	});

	it("stays when a build that wasn't shown is closed", () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.showNone();
		openBuilds.close('b');
		expect(keys(openBuilds)).toEqual(['a']);
		expect(openBuilds.shown).toBeUndefined();
	});
});

describe('closing a build', () => {
	it('keeps the build shown when another one is closed', () => {
		const openBuilds = opened(build('a'), build('b'), build('c'));
		openBuilds.close('a');
		expect(keys(openBuilds)).toEqual(['b', 'c']);
		expect(openBuilds.shown?.contentKey).toBe('c');
	});

	it('shows the build after the one shown', () => {
		const openBuilds = opened(build('a'), build('b'), build('c'));
		openBuilds.show('b');
		openBuilds.close('b');
		expect(keys(openBuilds)).toEqual(['a', 'c']);
		expect(openBuilds.shown?.contentKey).toBe('c');
	});

	it('shows the build before the one shown when it was the last', () => {
		const openBuilds = opened(build('a'), build('b'), build('c'));
		openBuilds.close('c');
		expect(openBuilds.shown?.contentKey).toBe('b');
	});

	it('shows nothing once the only build is closed', () => {
		const openBuilds = opened(build('a'));
		openBuilds.close('a');
		expect(openBuilds.all).toEqual([]);
		expect(openBuilds.shown).toBeUndefined();
	});

	it('changes nothing for a key of no open build', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.close('c');
		expect(keys(openBuilds)).toEqual(['a', 'b']);
		expect(openBuilds.shown?.contentKey).toBe('b');
	});
});

describe('the level of the build shown', () => {
	it('is brought back into the levels the build covers', () => {
		const openBuilds = opened(mapsGuide);
		openBuilds.showLevel(12);
		expect(openBuilds.level).toBe(65);
		openBuilds.showLevel(250);
		expect(openBuilds.level).toBe(100);
	});

	it('is a whole level', () => {
		const openBuilds = opened(build('a'));
		openBuilds.showLevel(42.4);
		expect(openBuilds.level).toBe(42);
		openBuilds.showLevel(42.6);
		expect(openBuilds.level).toBe(43);
	});

	it('stays when the level asked for is not a number', () => {
		const openBuilds = opened(build('a'));
		openBuilds.showLevel(42);
		openBuilds.showLevel(Number.NaN);
		openBuilds.showLevel(Number.POSITIVE_INFINITY);
		expect(openBuilds.level).toBe(42);
	});

	it('changes the build shown only', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.showLevel(7);
		expect(openBuilds.level).toBe(7);
		openBuilds.show('a');
		expect(openBuilds.level).toBe(100);
	});

	it('is asked of no build without a word', () => {
		const openBuilds = new OpenBuilds();
		openBuilds.showLevel(7);
		openBuilds.showMarker('next');
		expect(openBuilds.shown).toBeUndefined();
		expect(openBuilds.level).toBeUndefined();
	});
});

describe('the markers beside the level', () => {
	const markers = [12, 34, 59];

	/** The markers before and after a level of the build. */
	function beside(level: number): (number | undefined)[] {
		const openBuilds = opened(build('a', markers));
		openBuilds.showLevel(level);
		return [openBuilds.markerBeside('previous'), openBuilds.markerBeside('next')];
	}

	it('are the nearest on each side, the level itself left out', () => {
		expect(beside(34)).toEqual([12, 59]);
		expect(beside(40)).toEqual([34, 59]);
	});

	it('are missing past the first and the last', () => {
		expect(beside(12)).toEqual([undefined, 34]);
		expect(beside(100)).toEqual([59, undefined]);
	});

	it('are missing for a snapshot, and while no build is open', () => {
		const snapshot = opened(build('a'));
		expect(snapshot.markerBeside('previous')).toBeUndefined();
		expect(new OpenBuilds().markerBeside('next')).toBeUndefined();
	});

	it('are where ◀ and ▶ go, the level staying without one', () => {
		const openBuilds = opened(build('a', markers));
		openBuilds.showMarker('previous');
		expect(openBuilds.level).toBe(59);
		openBuilds.showMarker('previous');
		expect(openBuilds.level).toBe(34);
		openBuilds.showMarker('next');
		openBuilds.showMarker('next');
		expect(openBuilds.level).toBe(59);
	});
});

// What a component reads in its markup is read here in an effect: the state must tell it.
describe('whoever reads the open builds', () => {
	/** What an effect sees of the open builds, each time they tell it. */
	function seenBy<T>(openBuilds: OpenBuilds, read: (openBuilds: OpenBuilds) => T): T[] {
		const seen: T[] = [];
		$effect.root(() => {
			$effect(() => {
				seen.push(read(openBuilds));
			});
		});
		flushSync();
		return seen;
	}

	it('is told when the level changes', () => {
		const openBuilds = opened(build('a'));
		const seen = seenBy(openBuilds, (builds) => builds.level);
		openBuilds.showLevel(20);
		flushSync();
		expect(seen).toEqual([100, 20]);
	});

	it('is told when another build is shown, or none', () => {
		const openBuilds = opened(build('a'), build('b'));
		const seen = seenBy(openBuilds, (builds) => builds.shown?.contentKey);
		openBuilds.show('a');
		flushSync();
		openBuilds.showNone();
		flushSync();
		expect(seen).toEqual(['b', 'a', undefined]);
	});

	it('is told when a build opens or closes', () => {
		const openBuilds = opened(build('a'));
		const seen = seenBy(openBuilds, keys);
		openBuilds.open(build('b'));
		flushSync();
		openBuilds.close('a');
		flushSync();
		expect(seen).toEqual([['a'], ['a', 'b'], ['b']]);
	});
});

describe('the build shown in the band', () => {
	/** A band of 900 pixels: four tabs once some builds don't fit (band-layout.ts). */
	const NARROW_PIXELS = 900;

	/** These builds opened, in their order, in a band of 900 pixels, the first shown. */
	function inNarrowBand(...contentKeys: string[]): OpenBuilds {
		const openBuilds = opened(...contentKeys.map((key) => build(key)));
		openBuilds.show(contentKeys[0] ?? '');
		openBuilds.measureBand(NARROW_PIXELS);
		return openBuilds;
	}

	it('moves a build chosen in « +N ▾ » to the place of the last tab, for good', () => {
		const openBuilds = inNarrowBand('a', 'b', 'c', 'd', 'e', 'f');
		openBuilds.show('f');
		openBuilds.show('b');
		expect([keys(openBuilds), openBuilds.bandLayout?.tabCount]).toEqual([
			['a', 'b', 'c', 'f', 'd', 'e'],
			4
		]);
	});

	it('gives a tab to a build opened while every tab is taken', () => {
		const openBuilds = inNarrowBand('a', 'b', 'c', 'd');
		openBuilds.open(build('e'));
		expect(keys(openBuilds)).toEqual(['a', 'b', 'c', 'e', 'd']);
	});

	it('gives a tab to a build opened again while in « +N ▾ »', () => {
		const openBuilds = inNarrowBand('a', 'b', 'c', 'd', 'e', 'f');
		openBuilds.open(build('e'));
		expect([keys(openBuilds), openBuilds.shown?.contentKey]).toEqual([
			['a', 'b', 'c', 'e', 'd', 'f'],
			'e'
		]);
	});

	it('keeps the build shown in a tab when the band is made narrower, and moves nothing back', () => {
		const openBuilds = opened(...['a', 'b', 'c', 'd', 'e', 'f'].map((key) => build(key)));
		openBuilds.measureBand(1280);
		openBuilds.measureBand(NARROW_PIXELS);
		const narrowed = keys(openBuilds);
		openBuilds.measureBand(1280);
		expect([narrowed, keys(openBuilds)]).toEqual([
			['a', 'b', 'c', 'f', 'd', 'e'],
			['a', 'b', 'c', 'f', 'd', 'e']
		]);
	});

	it('shows the build after the one closed in the order of the band', () => {
		const openBuilds = inNarrowBand('a', 'b', 'c', 'd', 'e', 'f');
		openBuilds.show('f');
		openBuilds.close('f');
		expect(openBuilds.shown?.contentKey).toBe('d');
	});

	it('moves nothing before the band is measured', () => {
		const openBuilds = opened(...['a', 'b', 'c', 'd', 'e', 'f'].map((key) => build(key)));
		expect([keys(openBuilds), openBuilds.bandLayout]).toEqual([
			['a', 'b', 'c', 'd', 'e', 'f'],
			undefined
		]);
	});
});
