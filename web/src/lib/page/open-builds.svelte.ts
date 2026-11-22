// The builds open in the page (see Opening builds in specs.md), the one shown and its level (The
// level): the one source of what the band of the open builds, the level band, the tabs and the
// tree all read (docs/technical-choices.md, State of the interface).

import type { OpenedBuild } from '#lib/core.ts';

/**
 * A build open in the page: what the state reads of a build the core has read from its file, the
 * key of its content and the levels the page moves among.
 */
export type OpenBuild = Pick<OpenedBuild, 'contentKey' | 'levels'>;

/** The side of the level a marker is looked for on. */
export type MarkerSide = 'previous' | 'next';

/**
 * The builds open in the page. A build is named by the key of its content, never by its object
 * nor by its place in the list.
 */
export class OpenBuilds {
	/**
	 * Replaced whole when a build opens or closes, never changed in place: what the core has read
	 * is handed back as it is, without a proxy around each of its entries.
	 */
	#builds = $state.raw<readonly OpenBuild[]>([]);
	/** The level each open build is shown at, by the key of its content. */
	#levels = $state<Record<string, number>>({});
	#shownKey = $state<string>();

	/** The open builds, in the order they were opened. */
	get all(): readonly OpenBuild[] {
		return this.#builds;
	}

	/** The build shown: none when no build is open, or while the library is shown. */
	get shown(): OpenBuild | undefined {
		return this.#builds.find((build) => build.contentKey === this.#shownKey);
	}

	/** The level of the character the build shown is shown at, among those it covers. */
	get level(): number | undefined {
		return this.#shownKey === undefined ? undefined : this.#levels[this.#shownKey];
	}

	/**
	 * Opens a build and shows it, at the highest level it covers. The same content already open
	 * isn't added again: the build already open is shown, at the level it was left at.
	 */
	open(build: OpenBuild): void {
		if (!this.#builds.some((open) => open.contentKey === build.contentKey)) {
			this.#builds = [...this.#builds, build];
			this.#levels[build.contentKey] = build.levels.highest;
		}
		this.#shownKey = build.contentKey;
	}

	/** Shows a build already open, at the level it was left at; a key of no open build changes nothing. */
	show(contentKey: string): void {
		if (this.#builds.some((build) => build.contentKey === contentKey)) {
			this.#shownKey = contentKey;
		}
	}

	/** Shows no build, for the library: the open builds stay open, each at its level. */
	showNone(): void {
		this.#shownKey = undefined;
	}

	/**
	 * Takes a build off the list. When it was the one shown, the build after it in the list is
	 * shown, the one before it when it was the last, none when it was the only one.
	 */
	close(contentKey: string): void {
		const index = this.#builds.findIndex((build) => build.contentKey === contentKey);
		if (index === -1) {
			return;
		}
		this.#builds = this.#builds.toSpliced(index, 1);
		delete this.#levels[contentKey];
		if (this.#shownKey === contentKey) {
			this.#shownKey = (this.#builds[index] ?? this.#builds.at(-1))?.contentKey;
		}
	}

	/**
	 * Shows the build shown at a level, brought back to a whole level among those it covers. A
	 * level that isn't a number (a track measured while it has no width) changes nothing.
	 */
	showLevel(level: number): void {
		const build = this.shown;
		if (build === undefined || !Number.isFinite(level)) {
			return;
		}
		const { lowest, highest } = build.levels;
		this.#levels[build.contentKey] = Math.min(Math.max(Math.round(level), lowest), highest);
	}

	/** The level ◀ or ▶ goes to: the marker nearest to the level shown on a side, if any. */
	markerBeside(side: MarkerSide): number | undefined {
		const { shown, level } = this;
		if (shown === undefined || level === undefined) {
			return undefined;
		}
		return side === 'previous'
			? shown.levels.markers.findLast((marker) => marker < level)
			: shown.levels.markers.find((marker) => marker > level);
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
