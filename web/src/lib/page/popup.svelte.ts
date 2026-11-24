// The windows and the menus that open over the page, one at a time (see Window layout in
// specs.md): which one is open is one value, never a boolean per window, so that two can't be
// open (docs/technical-choices.md, State of the interface).

/**
 * A window or a menu that opens over the page: the menu of the open builds that the band has no
 * room for (« +N ▾ »), the window of what changes at the level (« N changes »), the box of What's
 * next.
 */
export type PopupName = 'builds-menu' | 'level-changes' | 'whats-next';

/**
 * Whether this one covers the page with a veil, under which the keys of the page don't reach: the
 * box of What's next, not a menu or a window that hangs from its trigger.
 */
export function coversPage(name: PopupName): boolean {
	switch (name) {
		case 'whats-next':
			return true;
		case 'builds-menu':
		case 'level-changes':
			return false;
	}
}

/**
 * What marks an element as belonging to a window or a menu, its trigger as its window, to
 * spread on it (`{...popupArea('level-changes')}`): a click under it doesn't close it
 * (page-events.ts reads the attribute).
 */
export function popupArea(name: PopupName): { 'data-popup': PopupName } {
	return { 'data-popup': name };
}

/** The window or the menu open over the page. */
export class Popup {
	#openName = $state<PopupName>();

	/** The one open, none when all are closed. */
	get openName(): PopupName | undefined {
		return this.#openName;
	}

	/** Whether this one is the one open. */
	isOpen(name: PopupName): boolean {
		return this.#openName === name;
	}

	/** What a click on its trigger does: opens it in place of the one open, or closes it. */
	toggle(name: PopupName): void {
		this.#openName = this.#openName === name ? undefined : name;
	}

	/** Closes the one open. */
	close(): void {
		this.#openName = undefined;
	}

	/**
	 * What a click anywhere on the page does: closes the one open, unless the click landed in
	 * what belongs to it, the area named by `area` (none for a click elsewhere). The same
	 * whether it is heard before or after the trigger the click landed on.
	 */
	closeUnlessClickedIn(area: string | undefined): void {
		if (area !== this.#openName) {
			this.#openName = undefined;
		}
	}
}

/** The window or the menu open over the page. */
export const popup = new Popup();
