// The drag of an element with the pointer (the cursor of the level along its track): it hears the
// pointer and tells the component, which keeps the state of its drag
// (docs/technical-choices.md, State of the interface). Not the drop of files on the page.

/** Where the pointer is, in the pixels of the window. */
export interface PointerPlace {
	clientX: number;
	clientY: number;
}

/** What a drag tells the component that owns the element. */
export interface DragHandlers {
	/** The main button went down on the element. */
	start(place: PointerPlace): void;
	/** The pointer moved, on the element or away from it. */
	move(place: PointerPlace): void;
	/**
	 * The drag is over: the pointer was released, or taken back by the system (a gesture of a
	 * touch screen), or the element left the page.
	 */
	drop(): void;
}

/** What a drag needs of its element. */
type DraggedElement = Pick<
	HTMLElement,
	'addEventListener' | 'removeEventListener' | 'setPointerCapture'
>;

/**
 * Makes an element dragged, as a Svelte attachment (`{@attach dragged(handlers)}`). The element
 * keeps the pointer from the press to the release, wherever it goes; one pointer drags at a time,
 * a second finger changes nothing. The click the browser sends to the element after the release
 * stops there: it is the end of the drag, not a click on what is around.
 *
 * Left to the component:
 * - the focus: the press doesn't select the text around, and so doesn't move the focus either;
 * - `touch-action: none` in the style of the element, without which a touch screen takes the
 *   gesture back to scroll after a few pixels;
 * - handlers set once in its script: an attachment made again while its state changes detaches
 *   the element, which ends the drag under way.
 */
export function dragged(handlers: DragHandlers): (element: DraggedElement) => () => void {
	return (element) => {
		let draggingPointerId: number | undefined;
		// Whether the next click on the element is the one that follows a release.
		let endsWithClick = false;

		function press(event: PointerEvent): void {
			if (event.button !== 0 || draggingPointerId !== undefined) {
				return;
			}
			event.preventDefault();
			draggingPointerId = event.pointerId;
			element.setPointerCapture(event.pointerId);
			handlers.start(event);
		}
		function move(event: PointerEvent): void {
			if (event.pointerId === draggingPointerId) {
				handlers.move(event);
			}
		}
		function drop(): void {
			draggingPointerId = undefined;
			handlers.drop();
		}
		function release(event: PointerEvent): void {
			if (event.pointerId === draggingPointerId) {
				// No click follows a pointer the system took back.
				endsWithClick = event.type === 'pointerup';
				drop();
			}
		}
		function stopClickOfRelease(event: Event): void {
			if (endsWithClick) {
				endsWithClick = false;
				event.stopPropagation();
			}
		}

		element.addEventListener('pointerdown', press);
		element.addEventListener('pointermove', move);
		element.addEventListener('pointerup', release);
		element.addEventListener('pointercancel', release);
		element.addEventListener('click', stopClickOfRelease, true);
		return () => {
			element.removeEventListener('pointerdown', press);
			element.removeEventListener('pointermove', move);
			element.removeEventListener('pointerup', release);
			element.removeEventListener('pointercancel', release);
			element.removeEventListener('click', stopClickOfRelease, true);
			if (draggingPointerId !== undefined) {
				drop();
			}
		};
	};
}
