// The files the page opens, dropped anywhere or chosen (specs.md, Opening builds): each build
// opens and the last is shown, each file refused is kept with its reason until the next files.
// Apart from the drag (file-drop.svelte.ts): the files chosen and, in 4e3, the JSON pasted open
// here too, with no drag.

import { openBuilds } from './open-builds.svelte.ts';
import { readFiles, type ReadFile } from './read-files.ts';

/** A file refused, its name and why. */
export type RefusedRead = Extract<ReadFile, { kind: 'refused' }>;

/** The files opened, one set after the other. */
export class Opening {
	#refused = $state.raw<readonly RefusedRead[]>([]);
	/** The files opened last, or being opened: the next wait for them. */
	#pending: Promise<void> = Promise.resolve();

	/** The files refused of the last files dropped or chosen, in their order. */
	get refused(): readonly RefusedRead[] {
		return this.#refused;
	}

	/**
	 * Opens the files dropped or chosen: each build opens and the last is shown, each file
	 * refused is kept, in place of those of the files before. Files given while others are still
	 * read open after them, so that the last given are the last shown, however long each takes
	 * to read. When the core can't load, the page already says it (+page.svelte), and nothing
	 * opens.
	 */
	open(files: readonly File[]): Promise<void> {
		if (files.length === 0) {
			return this.#pending;
		}
		this.#pending = this.#pending.then(() => this.#openNow(files));
		return this.#pending;
	}

	async #openNow(files: readonly File[]): Promise<void> {
		let read: ReadFile[];
		try {
			read = await readFiles(files);
		} catch (error) {
			console.error('opening: the files could not be read', error);
			return;
		}
		for (const file of read) {
			if (file.kind === 'build') {
				openBuilds.open(file.build);
			}
		}
		this.#refused = read.filter((file) => file.kind === 'refused');
	}
}

/** The files the page opens. */
export const opening = new Opening();
