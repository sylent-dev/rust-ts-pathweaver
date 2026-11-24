// The updates the box of What's next tells of (specs.md, Window layout: the band of the site), in
// the order of their versions: what each brings, the portraits of its card and the messages of its words (locales/en.ftl, The
// box of What's next).

/** An update to come. */
export interface Update {
	/** The version it is, such as 2. */
	version: number;
	/** The start of the names of its messages: `<messages>-name`, `<messages>-line`. */
	messages: 'next-editor' | 'next-community';
	/** What it brings, a message each, in their order. */
	items: readonly string[];
	/**
	 * The ascendancies whose portraits head its card, by their ids in the game data: one large,
	 * or several side by side (the mock-up, 2k6).
	 */
	portraits: readonly string[];
}

/** The two updates of the versions after the first. */
export const UPDATES: readonly Update[] = [
	{
		version: 2,
		messages: 'next-editor',
		items: ['next-editor-tree', 'next-editor-gems', 'next-editor-hints', 'next-editor-export'],
		// Stormweaver.
		portraits: ['Sorceress1']
	},
	{
		version: 3,
		messages: 'next-community',
		items: [
			'next-community-publish',
			'next-community-links',
			'next-community-search',
			'next-community-versions',
			'next-community-french'
		],
		// Amazon, Disciple of Varashta, Warbringer, Stormweaver.
		portraits: ['Huntress1', 'Sorceress3', 'Warrior2', 'Sorceress1']
	}
];
