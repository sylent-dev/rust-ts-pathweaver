import { describe, expect, it } from 'vitest';
import { OpenBuilds, type ReadBuild } from './open-builds.svelte.ts';

/** A build as the core reads it, from level 1 to 100, with its markers. */
function build(contentKey: string, markers: number[] = []): ReadBuild {
	return { contentKey, levels: { lowest: 1, highest: 100, markers } };
}

/** A guide of the maps, from level 65 to 100. */
const mapsGuide: ReadBuild = {
	contentKey: 'maps',
	levels: { lowest: 65, highest: 100, markers: [] }
};

/** The open builds, once each of the builds given is opened in turn. */
function opened(...builds: ReadBuild[]): OpenBuilds {
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
			levels: { lowest: 65, highest: 90, markers: [] },
			level: 90
		});
	});

	it('shows the build already open rather than adding the same content again', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.show('a');
		openBuilds.showLevel(20);
		openBuilds.show('b');
		openBuilds.open(build('a'));
		expect(keys(openBuilds)).toEqual(['a', 'b']);
		expect(openBuilds.shown).toEqual({ ...build('a'), level: 20 });
	});
});

describe('showing an open build', () => {
	it('keeps the level of each build', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.showLevel(30);
		openBuilds.show('a');
		expect(openBuilds.shown?.level).toBe(100);
		openBuilds.show('b');
		expect(openBuilds.shown?.level).toBe(30);
	});

	it('changes nothing for a key of no open build', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.show('c');
		expect(openBuilds.shown?.contentKey).toBe('b');
	});
});

describe('closing a build', () => {
	it('keeps the build shown when another one is closed', () => {
		const openBuilds = opened(build('a'), build('b'), build('c'));
		openBuilds.close('a');
		expect(keys(openBuilds)).toEqual(['b', 'c']);
		expect(openBuilds.shown?.contentKey).toBe('c');
	});

	it('shows the build that takes the place of the one shown', () => {
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
		expect(openBuilds.shown?.level).toBe(65);
		openBuilds.showLevel(250);
		expect(openBuilds.shown?.level).toBe(100);
	});

	it('is a whole level', () => {
		const openBuilds = opened(build('a'));
		openBuilds.showLevel(42.4);
		expect(openBuilds.shown?.level).toBe(42);
	});

	it('stays when the level asked for is not a number', () => {
		const openBuilds = opened(build('a'));
		openBuilds.showLevel(42);
		openBuilds.showLevel(Number.NaN);
		openBuilds.showLevel(Number.POSITIVE_INFINITY);
		expect(openBuilds.shown?.level).toBe(42);
	});

	it('changes the build shown only', () => {
		const openBuilds = opened(build('a'), build('b'));
		openBuilds.showLevel(7);
		expect(openBuilds.all.map((open) => open.level)).toEqual([100, 7]);
	});

	it('is asked of no build without a word', () => {
		const openBuilds = new OpenBuilds();
		openBuilds.showLevel(7);
		openBuilds.showMarker('next');
		expect(openBuilds.shown).toBeUndefined();
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
		expect(openBuilds.shown?.level).toBe(59);
		openBuilds.showMarker('previous');
		expect(openBuilds.shown?.level).toBe(34);
		openBuilds.showMarker('next');
		openBuilds.showMarker('next');
		expect(openBuilds.shown?.level).toBe(59);
	});
});
