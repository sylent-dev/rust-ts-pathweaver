import { describe, expect, it } from 'vitest';
import { dragged } from './pointer-drag.ts';

/** An element that hears events and notes the pointers it keeps, without a page. */
class FakeElement extends EventTarget {
	keptPointers: number[] = [];

	setPointerCapture(pointerId: number): void {
		this.keptPointers.push(pointerId);
	}
}

/** What a test says of a pointer event; the main button of the first pointer otherwise. */
interface PointerDetails {
	button?: number;
	pointerId?: number;
	clientX?: number;
	clientY?: number;
}

/** A pointer event, as far as a drag reads it. */
function pointer(type: string, details: PointerDetails = {}): Event {
	return Object.assign(new Event(type, { cancelable: true }), {
		button: 0,
		pointerId: 1,
		clientX: 0,
		clientY: 0,
		...details
	});
}

/** A dragged element, with what its drag told, in order. */
function draggedElement(): { element: FakeElement; told: string[]; detach: () => void } {
	const element = new FakeElement();
	const told: string[] = [];
	const detach = dragged({
		start: ({ clientX, clientY }) => told.push(`start ${clientX},${clientY}`),
		move: ({ clientX, clientY }) => told.push(`move ${clientX},${clientY}`),
		drop: () => told.push('drop')
	})(element);
	return { element, told, detach };
}

describe('dragged', () => {
	it('follows the pointer from the press to the release', () => {
		const { element, told } = draggedElement();
		element.dispatchEvent(pointer('pointerdown', { clientX: 10, clientY: 5 }));
		element.dispatchEvent(pointer('pointermove', { clientX: 14, clientY: 5 }));
		element.dispatchEvent(pointer('pointermove', { clientX: 30, clientY: 9 }));
		element.dispatchEvent(pointer('pointerup', { clientX: 30, clientY: 9 }));
		expect(told).toEqual(['start 10,5', 'move 14,5', 'move 30,9', 'drop']);
	});

	it('keeps the pointer, and the press from selecting the text around', () => {
		const { element } = draggedElement();
		const press = pointer('pointerdown', { pointerId: 7 });
		element.dispatchEvent(press);
		expect(element.keptPointers).toEqual([7]);
		expect(press.defaultPrevented).toBe(true);
	});

	it('starts with the main button only', () => {
		const { element, told } = draggedElement();
		const press = pointer('pointerdown', { button: 2 });
		element.dispatchEvent(press);
		element.dispatchEvent(pointer('pointermove', { clientX: 14 }));
		element.dispatchEvent(pointer('pointerup'));
		expect(told).toEqual([]);
		expect(element.keptPointers).toEqual([]);
		expect(press.defaultPrevented).toBe(false);
	});

	it('tells nothing of a pointer that only passes over the element', () => {
		const { element, told } = draggedElement();
		element.dispatchEvent(pointer('pointermove', { clientX: 14 }));
		element.dispatchEvent(pointer('pointerup'));
		expect(told).toEqual([]);
	});

	it('drops when the system takes the pointer back', () => {
		const { element, told } = draggedElement();
		element.dispatchEvent(pointer('pointerdown'));
		element.dispatchEvent(pointer('pointercancel'));
		element.dispatchEvent(pointer('pointermove', { clientX: 14 }));
		expect(told).toEqual(['start 0,0', 'drop']);
	});

	it('follows one pointer at a time: a second finger changes nothing', () => {
		const { element, told } = draggedElement();
		element.dispatchEvent(pointer('pointerdown', { pointerId: 1 }));
		element.dispatchEvent(pointer('pointerdown', { pointerId: 2, clientX: 80 }));
		element.dispatchEvent(pointer('pointermove', { pointerId: 2, clientX: 90 }));
		element.dispatchEvent(pointer('pointerup', { pointerId: 2 }));
		element.dispatchEvent(pointer('pointermove', { pointerId: 1, clientX: 20 }));
		element.dispatchEvent(pointer('pointerup', { pointerId: 1 }));
		expect(told).toEqual(['start 0,0', 'move 20,0', 'drop']);
		expect(element.keptPointers).toEqual([1]);
	});

	it('starts again after a drop', () => {
		const { element, told } = draggedElement();
		element.dispatchEvent(pointer('pointerdown'));
		element.dispatchEvent(pointer('pointerup'));
		element.dispatchEvent(pointer('pointerdown', { pointerId: 2, clientX: 40 }));
		element.dispatchEvent(pointer('pointerup', { pointerId: 2 }));
		expect(told).toEqual(['start 0,0', 'drop', 'start 40,0', 'drop']);
	});

	it('hears nothing once detached', () => {
		const { element, told, detach } = draggedElement();
		detach();
		element.dispatchEvent(pointer('pointerdown'));
		element.dispatchEvent(pointer('pointermove', { clientX: 14 }));
		element.dispatchEvent(pointer('pointerup'));
		expect(told).toEqual([]);
	});

	it('drops a drag under way when detached', () => {
		const { element, told, detach } = draggedElement();
		element.dispatchEvent(pointer('pointerdown'));
		detach();
		element.dispatchEvent(pointer('pointermove', { clientX: 14 }));
		element.dispatchEvent(pointer('pointerup'));
		expect(told).toEqual(['start 0,0', 'drop']);
	});
});

// A browser sends a click to the element that kept the pointer once it is released.
describe('the click that follows a release', () => {
	/** Whether a click sent to the element stops there, rather than going on to what is around. */
	function stopsClick(element: FakeElement): boolean {
		const click = new Event('click', { bubbles: true });
		element.dispatchEvent(click);
		return click.cancelBubble;
	}

	it('stops at the element, and the click after it goes on', () => {
		const { element } = draggedElement();
		element.dispatchEvent(pointer('pointerdown'));
		element.dispatchEvent(pointer('pointerup'));
		expect([stopsClick(element), stopsClick(element)]).toEqual([true, false]);
	});

	it('is none when the system took the pointer back: the next click goes on', () => {
		const { element } = draggedElement();
		element.dispatchEvent(pointer('pointerdown'));
		element.dispatchEvent(pointer('pointercancel'));
		expect(stopsClick(element)).toBe(false);
	});

	it('is none without a press: a click goes on', () => {
		const { element } = draggedElement();
		element.dispatchEvent(pointer('pointerup'));
		expect(stopsClick(element)).toBe(false);
	});
});
