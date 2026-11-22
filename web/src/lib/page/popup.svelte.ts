// The windows and the menus that open over the page, one at a time (see Window layout in
// specs.md): which one is open is one value, never a boolean per window, so that two can't be
// open (docs/technical-choices.md, State of the interface).

/**
 * A window or a menu that opens over the page: the menu of the open builds that the band has no
 * room for (« +N ▾ »), the window of what changes at the level (« N changes »).
 */
export type PopupName = 'builds-menu' | 'level-changes';

/** The window or the menu open over the page. */
export class Popup {
	#open = $state<PopupName>();

	/** The one open, none when all are closed. */
	get open(): PopupName | undefined {
		return this.#open;
	}

	/** What a click on its trigger does: opens it in place of the one open, or closes it. */
	toggle(name: PopupName): void {
		this.#open = this.#open === name ? undefined : name;
	}

	/** Closes the one open. */
	close(): void {
		this.#open = undefined;
	}

	/**
	 * What a click anywhere on the page does, heard after its trigger: closes the one open,
	 * unless the click landed in what belongs to it (its trigger, its window), named by
	 * `clickedIn`.
	 */
	closeFromOutside(clickedIn: string | undefined): void {
		if (clickedIn !== this.#open) {
			this.#open = undefined;
		}
	}
}

/** The window or the menu open over the page. */
export const popup = new Popup();
