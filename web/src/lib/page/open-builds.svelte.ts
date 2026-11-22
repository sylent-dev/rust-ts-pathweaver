// The builds open in the page (see Opening builds in specs.md), the one shown and its level (The
// level): the one source of what the band of the open builds, the level band, the tabs and the
// tree all read (docs/technical-choices.md, State of the interface).

/** The levels of a build, as the core reads them from its entries. */
export interface BuildLevels {
	/** The lowest level its entries cover. */
	lowest: number;
	/** The highest level its entries cover, included. */
	highest: number;
	/** The levels where the build changes, each once, from the lowest to the highest. */
	markers: readonly number[];
}

/** What the page needs of a file the core has read to open it. */
export interface ReadBuild {
	/** The key of its content: two files of the same content have the same key. */
	contentKey: string;
	levels: BuildLevels;
}

/** A build open in the page. */
export interface OpenBuild extends ReadBuild {
	/** The level of the character it is shown at, from `levels.lowest` to `levels.highest`. */
	level: number;
}

/** The side of the level a marker is looked for on. */
export type MarkerSide = 'previous' | 'next';

/**
 * The builds open in the page. A build is named by the key of its content, never by its object:
 * the one read back from a `$state` is a proxy, not the object that was given.
 */
export class OpenBuilds {
	#builds = $state<OpenBuild[]>([]);
	#shownKey = $state<string>();

	/** The open builds, in the order they were opened. */
	get all(): readonly Readonly<OpenBuild>[] {
		return this.#builds;
	}

	/** The build shown, none when no build is open. */
	get shown(): Readonly<OpenBuild> | undefined {
		return this.#builds.find((build) => build.contentKey === this.#shownKey);
	}

	/**
	 * Opens a build and shows it, at the highest level it covers. The same content already open
	 * isn't added again: the build already open is shown, at the level it was left at.
	 */
	open(build: ReadBuild): void {
		if (!this.#builds.some((open) => open.contentKey === build.contentKey)) {
			this.#builds.push({ ...build, level: build.levels.highest });
		}
		this.#shownKey = build.contentKey;
	}

	/** Shows a build already open; a key of no open build changes nothing. */
	show(contentKey: string): void {
		if (this.#builds.some((build) => build.contentKey === contentKey)) {
			this.#shownKey = contentKey;
		}
	}

	/**
	 * Takes a build off the list. When it was the one shown, the build that takes its place in
	 * the list is shown, the one before it when it was the last.
	 */
	close(contentKey: string): void {
		const index = this.#builds.findIndex((build) => build.contentKey === contentKey);
		if (index === -1) {
			return;
		}
		this.#builds.splice(index, 1);
		if (this.#shownKey === contentKey) {
			this.#shownKey = (this.#builds[index] ?? this.#builds.at(-1))?.contentKey;
		}
	}

	/**
	 * Shows the build shown at a level, brought back into the levels it covers. A level that
	 * isn't a number (a track measured while it has no width) changes nothing.
	 */
	showLevel(level: number): void {
		const build = this.#builds.find((open) => open.contentKey === this.#shownKey);
		if (build === undefined || !Number.isFinite(level)) {
			return;
		}
		const { lowest, highest } = build.levels;
		build.level = Math.min(Math.max(Math.round(level), lowest), highest);
	}

	/** The level ◀ or ▶ goes to: the marker nearest to the level shown on a side, if any. */
	markerBeside(side: MarkerSide): number | undefined {
		const build = this.shown;
		if (build === undefined) {
			return undefined;
		}
		return side === 'previous'
			? build.levels.markers.findLast((marker) => marker < build.level)
			: build.levels.markers.find((marker) => marker > build.level);
	}

	/** Goes to the marker nearest to the level shown on a side; stays without one. */
	showMarker(side: MarkerSide): void {
		const marker = this.markerBeside(side);
		if (marker !== undefined) {
			this.showLevel(marker);
		}
	}
}

/** The builds open in the page. */
export const openBuilds = new OpenBuilds();
