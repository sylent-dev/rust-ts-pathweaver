// The files dragged over the page and dropped on it, anywhere, on any page (specs.md, Opening
// builds), and the files chosen: each build opens and is shown, each file refused is kept with
// its reason until the next files. The layout hears the drags once for the whole page.

import { openBuilds } from './open-builds.svelte.ts';
import { readFiles, type ReadFile } from './read-files.ts';

/** A file refused, its name and why. */
export type RefusedRead = Extract<ReadFile, { kind: 'refused' }>;

/** Whether a drag carries files, rather than a text or a link dragged from a page. */
function carriesFiles(event: DragEvent): boolean {
	return event.dataTransfer?.types.includes('Files') ?? false;
}

/** The files over the page, and the files refused of the last opened. */
export class FileDrop {
	/**
	 * The elements the files have entered and not left: a drag enters each element under the
	 * pointer and leaves it for the next, so the page is left when none is left entered.
	 */
	#entered = 0;
	#isOver = $state(false);
	#fileCount = $state(0);
	#refused = $state.raw<readonly RefusedRead[]>([]);

	/** Whether files are dragged over the page. */
	get isOver(): boolean {
		return this.#isOver;
	}

	/** How many files are dragged over the page; 0 when the browser doesn't say it. */
	get fileCount(): number {
		return this.#fileCount;
	}

	/** The files refused of the last files dropped or chosen, in their order. */
	get refused(): readonly RefusedRead[] {
		return this.#refused;
	}

	/** Files enter an element of the page. */
	enter(event: DragEvent): void {
		if (!carriesFiles(event)) {
			return;
		}
		event.preventDefault();
		this.#entered += 1;
		this.#isOver = true;
		this.#fileCount = [...(event.dataTransfer?.items ?? [])].filter(
			(item) => item.kind === 'file'
		).length;
	}

	/** Files move over the page: the browser opens them only where this is said. */
	over(event: DragEvent): void {
		if (carriesFiles(event)) {
			event.preventDefault();
		}
	}

	/**
	 * Files leave an element of the page, for another or out of the window (no element next),
	 * or the drag is given up (Esc).
	 */
	leave(event: DragEvent): void {
		if (!carriesFiles(event)) {
			return;
		}
		this.#entered = event.relatedTarget === null ? 0 : Math.max(0, this.#entered - 1);
		this.#isOver = this.#entered > 0;
	}

	/** Files dropped anywhere on the page open, rather than the browser showing one of them. */
	drop(event: DragEvent): void {
		if (!carriesFiles(event)) {
			return;
		}
		event.preventDefault();
		this.#entered = 0;
		this.#isOver = false;
		void this.open([...(event.dataTransfer?.files ?? [])]);
	}

	/**
	 * Opens the files dropped or chosen: each build opens and the last is shown, each file
	 * refused is kept, in place of those of the files before. When the core can't load, the page
	 * already says it (+page.svelte), and nothing opens.
	 */
	async open(files: readonly File[]): Promise<void> {
		if (files.length === 0) {
			return;
		}
		let read: ReadFile[];
		try {
			read = await readFiles(files);
		} catch {
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

/** The files over the page and dropped on it. */
export const fileDrop = new FileDrop();
