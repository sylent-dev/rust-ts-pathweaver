// The drag of an element with the pointer (the cursor of the level along its track): it hears the
// pointer and tells the component, which keeps the state of its drag
// (docs/technical-choices.md, State of the interface).

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
	/** The pointer was released, or taken back by the system (a gesture of a touch screen). */
	drop(): void;
}

/** What a drag needs of its element. */
type DraggedElement = Pick<
	HTMLElement,
	'addEventListener' | 'removeEventListener' | 'setPointerCapture'
>;

/**
 * Makes an element dragged, as a Svelte attachment (`{@attach dragged(…)}`). The element keeps
 * the pointer from the press to the release, wherever it goes; one pointer drags at a time, a
 * second finger changes nothing. The press doesn't select the text around nor move the focus.
 */
export function dragged(handlers: DragHandlers): (element: DraggedElement) => () => void {
	return (element) => {
		let draggingPointer: number | undefined;

		function press(event: PointerEvent): void {
			if (event.button !== 0 || draggingPointer !== undefined) {
				return;
			}
			event.preventDefault();
			draggingPointer = event.pointerId;
			element.setPointerCapture(event.pointerId);
			handlers.start(event);
		}
		function move(event: PointerEvent): void {
			if (event.pointerId === draggingPointer) {
				handlers.move(event);
			}
		}
		function release(event: PointerEvent): void {
			if (event.pointerId === draggingPointer) {
				draggingPointer = undefined;
				handlers.drop();
			}
		}

		element.addEventListener('pointerdown', press);
		element.addEventListener('pointermove', move);
		element.addEventListener('pointerup', release);
		element.addEventListener('pointercancel', release);
		return () => {
			element.removeEventListener('pointerdown', press);
			element.removeEventListener('pointermove', move);
			element.removeEventListener('pointerup', release);
			element.removeEventListener('pointercancel', release);
		};
	};
}
