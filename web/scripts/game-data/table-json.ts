// The tables of the game data as the files of the website hold them.

/**
 * A table of the game data as JSON, sorted by id with one entry per line, so that the diff of a
 * new version shows the entries that changed.
 */
export function tableJson(table: Readonly<Record<string, unknown>>): string {
	const lines = Object.keys(table)
		.sort()
		.map((id) => `${JSON.stringify(id)}:${JSON.stringify(table[id])}`);
	return `{\n${lines.join(',\n')}\n}\n`;
}
