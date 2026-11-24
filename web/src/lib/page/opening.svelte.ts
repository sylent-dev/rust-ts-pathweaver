// The files the page opens, dropped anywhere or chosen, and the JSON of a build pasted (specs.md,
// Opening builds): each build opens and the last is shown, each file refused is kept with its
// reason until the next files or until its notice is closed. Apart from the drag (file-drop.svelte.ts): the files chosen and
// the text pasted open here too, with no drag.

import { openBuilds } from './open-builds.svelte.ts';
import { popup } from './popup.svelte.ts';
import { readFiles, readText, type FileRefusal, type ReadFile } from './read-files.ts';

/** A file refused, its name and why. */
export type RefusedRead = Extract<ReadFile, { kind: 'refused' }>;

/** The files opened, one set after the other. */
export class Opening {
	#refused = $state.raw<readonly RefusedRead[]>([]);
	#openedNone = $state(false);
	/** The files opened last, or being opened: the next wait for them. Never rejected. */
	#pending: Promise<void> = Promise.resolve();

	/** The files refused of the last files dropped or chosen, in their order. */
	get refused(): readonly RefusedRead[] {
		return this.#refused;
	}

	/**
	 * The files refused of the last files dropped or chosen when none of them opened, which the
	 * drop zone of the first visit says; none when one of them opened, which the notice of the page
	 * of a build says.
	 */
	get refusedAll(): readonly RefusedRead[] {
		return this.#openedNone ? this.#refused : [];
	}

	/** Forgets the files refused, whose notice is closed. */
	dismissRefused(): void {
		this.#refused = [];
		this.#openedNone = false;
	}

	/**
	 * Opens the files dropped or chosen: each build opens and the last is shown, each file
	 * refused is kept, in place of those of the files before. Files given while others are still
	 * read open after them, so that the last given are the last shown, however long each takes
	 * to read; a build opened closes the window or the menu open. When the core can't load, the
	 * page already says it (FirstVisitPage), and nothing opens; any failure is written to the
	 * console, and the files after open still.
	 */
	open(files: readonly File[]): Promise<void> {
		if (files.length === 0) {
			return this.#pending;
		}
		this.#pending = this.#pending
			.then(() => this.#openNow(files))
			.catch((error: unknown) => {
				console.error('opening: the files could not be opened', error);
			});
		return this.#pending;
	}

	/**
	 * Opens the JSON of a build pasted, after the files given before it: its build opens and is
	 * shown, the files refused before it forgotten. Gives why it is refused, which the field that took it says; nothing when it opens or
	 * when the core can't load, which the page already says (FirstVisitPage).
	 */
	openText(text: string): Promise<FileRefusal | undefined> {
		const opened = this.#pending.then(() => this.#openTextNow(text));
		this.#pending = opened.then(
			() => {},
			(error: unknown) => {
				console.error('opening: the text could not be opened', error);
			}
		);
		return opened.catch(() => undefined);
	}

	async #openTextNow(text: string): Promise<FileRefusal | undefined> {
		const read = await readText(text);
		if (read.kind === 'refused') {
			return read.refusal;
		}
		openBuilds.open(read.build);
		// The files refused before it are no longer those of the build shown.
		this.#refused = [];
		this.#openedNone = false;
		return undefined;
	}

	async #openNow(files: readonly File[]): Promise<void> {
		const read = await readFiles(files);
		openBuilds.openAll(read.flatMap((file) => (file.kind === 'build' ? [file.build] : [])));
		this.#refused = read.filter((file) => file.kind === 'refused');
		this.#openedNone = this.#refused.length === read.length;
		// The build shown changed without a click, which would have closed the window or the menu
		// open over the page (docs/technical-choices.md, State of the interface).
		if (!this.#openedNone) {
			popup.close();
		}
	}
}

/** The files the page opens. */
export const opening = new Opening();
