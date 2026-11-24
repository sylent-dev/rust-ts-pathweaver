// The tab of the page of a build that is shown (specs.md, Window layout: five tabs): one source,
// which the row of the tabs, the window of what changes at a level (4h) and the warnings of the
// header (4i) all show a tab by (docs/technical-choices.md, State of the interface).

/** The tabs of the page of a build, in the order of their row. */
export const BUILD_TABS = ['overview', 'skills', 'tree', 'inventory', 'about'] as const;

/** A tab of the page of a build. */
export type BuildTab = (typeof BUILD_TABS)[number];

/** The tab shown, the same whichever build is shown. */
export class ShownTab {
	#tab = $state<BuildTab>('overview');

	/** The tab shown: the Overview until another is chosen. */
	get current(): BuildTab {
		return this.#tab;
	}

	/** Shows a tab. */
	show(tab: BuildTab): void {
		this.#tab = tab;
	}
}

/** The tab of the page of a build that is shown. */
export const shownTab = new ShownTab();
