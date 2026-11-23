// The files dragged over the page and dropped on it, anywhere, on any page (specs.md, Opening
// builds): the page lit while they are over it, and the files dropped opened (opening.svelte.ts).
// The layout hears the drags once for the whole page.

import { opening } from './opening.svelte.ts';

/** Whether a drag carries files, rather than a text or a link dragged from a page. */
export function carriesFiles(event: DragEvent): boolean {
	return event.dataTransfer?.types.includes('Files') ?? false;
}

/** The files over the page. */
export class FileDrop {
	/**
	 * The element a drag of files entered last. A drag enters the next element under the pointer
	 * before it leaves the one before (HTML, drag-and-drop processing model), so the page is left
	 * when the files leave the element they entered last; the browsers don't all name the element
	 * next (relatedTarget: none in WebKit). An element taken away under the pointer is left
	 * unheard, its dragleave never reaching the page: the page keeps the elements under the
	 * pointer while files are over it (DropZone).
	 */
	#lastEntered: EventTarget | null = null;
	#isOver = $state(false);
	#fileCount = $state(0);

	/** Whether files are dragged over the page. */
	get isOver(): boolean {
		return this.#isOver;
	}

	/** How many files are dragged over the page; 0 when the browser doesn't say it. */
	get fileCount(): number {
		return this.#fileCount;
	}

	/** Files enter an element of the page. */
	enter(event: DragEvent): void {
		if (!carriesFiles(event)) {
			return;
		}
		event.preventDefault();
		this.#lastEntered = event.target;
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
	 * Files leave an element of the page, for another or out of the window, or the drag is given
	 * up (Esc): the page is left with the element entered last.
	 */
	leave(event: DragEvent): void {
		if (event.target === this.#lastEntered) {
			this.#lastEntered = null;
			this.#isOver = false;
		}
	}

	/** Files dropped anywhere on the page open, rather than the browser showing one of them. */
	drop(event: DragEvent): void {
		if (!carriesFiles(event)) {
			return;
		}
		event.preventDefault();
		this.#lastEntered = null;
		this.#isOver = false;
		void opening.open([...(event.dataTransfer?.files ?? [])]);
	}
}

/** The files over the page and dropped on it. */
export const fileDrop = new FileDrop();
