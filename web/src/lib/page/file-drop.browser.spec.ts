// The files dragged over the page and dropped on it, in a real browser, the core loaded.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileDrop } from './file-drop.svelte.ts';
import { openBuilds } from './open-builds.svelte.ts';

/** A file of this text. */
function fileOf(name: string, text: string): File {
	return new File([text], name, { type: 'application/json' });
}

/** A drag of these files, as the browser fires it on the page. */
function dragOf(type: string, files: File[], relatedTarget: EventTarget | null = document.body) {
	const dataTransfer = new DataTransfer();
	for (const file of files) {
		dataTransfer.items.add(file);
	}
	return new DragEvent(type, { dataTransfer, relatedTarget, cancelable: true, bubbles: true });
}

/** Two elements of the page the files go through, the title in the zone. */
let zone: HTMLElement;
let title: HTMLElement;

beforeEach(() => {
	zone = document.createElement('div');
	title = document.createElement('strong');
	zone.append(title);
	document.body.append(zone);
});

/**
 * A drag of a file fired on an element of the page, as the browser does, and heard by the page
 * (`enter` or `leave`) on the window, as the layout hears it.
 */
function fire(
	heard: (event: DragEvent) => void,
	type: string,
	at: Element,
	relatedTarget: EventTarget | null = document.body
): void {
	const event = dragOf(type, [buildA], relatedTarget);
	window.addEventListener(type, (heardEvent) => heard(heardEvent as DragEvent), { once: true });
	at.dispatchEvent(event);
}

/** A drag of a text selected in a page, which carries no file. */
function textDrag(type: string): DragEvent {
	const dataTransfer = new DataTransfer();
	dataTransfer.setData('text/plain', 'a few words');
	return new DragEvent(type, { dataTransfer, cancelable: true });
}

const buildA = fileOf('a.build', '{ "name": "A" }');
const buildB = fileOf('b.build', '{ "name": "B" }');
const image = fileOf('passive-tree.png', '\u0089PNG');

afterEach(() => {
	zone.remove();
	for (const build of openBuilds.all) {
		openBuilds.close(build.contentKey);
	}
});

describe('files over the page', () => {
	it('light the page, which counts them', () => {
		const drop = new FileDrop();
		const enter = dragOf('dragenter', [buildA, buildB]);

		drop.enter(enter);

		expect(drop.isOver).toBe(true);
		expect(drop.fileCount).toBe(2);
		expect(enter.defaultPrevented).toBe(true);
	});

	it('keep it lit from one element to the next, the next entered before the first is left', () => {
		const drop = new FileDrop();
		const enter = (at: Element) => fire((event) => drop.enter(event), 'dragenter', at);
		const leave = (at: Element) => fire((event) => drop.leave(event), 'dragleave', at);
		enter(zone);
		enter(title);
		leave(zone);
		expect(drop.isOver).toBe(true);

		enter(zone);
		leave(title);
		expect(drop.isOver).toBe(true);
	});

	it('keep it lit where the browser names no element next, as WebKit', () => {
		const drop = new FileDrop();
		fire((event) => drop.enter(event), 'dragenter', zone, null);
		fire((event) => drop.enter(event), 'dragenter', title, null);
		fire((event) => drop.leave(event), 'dragleave', zone, null);

		expect(drop.isOver).toBe(true);
	});

	it('leave it dark once they leave the window from the element they entered last', () => {
		const drop = new FileDrop();
		fire((event) => drop.enter(event), 'dragenter', zone);
		fire((event) => drop.enter(event), 'dragenter', title);

		fire((event) => drop.leave(event), 'dragleave', title, null);

		expect(drop.isOver).toBe(false);
	});

	it('leave it dark once they leave the window, the element they entered first taken away', () => {
		const drop = new FileDrop();
		fire((event) => drop.enter(event), 'dragenter', title);
		const next = document.createElement('strong');
		title.replaceWith(next);
		fire((event) => drop.enter(event), 'dragenter', next);

		fire((event) => drop.leave(event), 'dragleave', next, null);

		expect(drop.isOver).toBe(false);
	});

	it('are let go on the page rather than opened by the browser', () => {
		const over = dragOf('dragover', [buildA]);
		new FileDrop().over(over);
		expect(over.defaultPrevented).toBe(true);
	});

	it('are not a text dragged from a page, which stays the browser’s', () => {
		const drop = new FileDrop();
		const enter = textDrag('dragenter');
		const over = textDrag('dragover');

		drop.enter(enter);
		drop.over(over);

		expect(drop.isOver).toBe(false);
		expect(enter.defaultPrevented).toBe(false);
		expect(over.defaultPrevented).toBe(false);
	});
});

describe('files dropped', () => {
	it('open each build and show the last, the page dark again', async () => {
		const drop = new FileDrop();
		drop.enter(dragOf('dragenter', [buildA, buildB]));
		const dropped = dragOf('drop', [buildA, buildB]);

		drop.drop(dropped);

		expect(dropped.defaultPrevented).toBe(true);
		expect(drop.isOver).toBe(false);
		await expect.poll(() => openBuilds.all.map((build) => build.name)).toEqual(['A', 'B']);
		expect(openBuilds.shown?.name).toBe('B');
	});

	it('keep each file refused with its reason, the others opened', async () => {
		const drop = new FileDrop();

		await drop.open([image, buildA]);

		expect(openBuilds.shown?.name).toBe('A');
		expect(drop.refused).toEqual([
			{
				kind: 'refused',
				fileName: 'passive-tree.png',
				refusal: expect.objectContaining({ reason: 'notJson' })
			}
		]);
	});

	it('forget the files refused before them', async () => {
		const drop = new FileDrop();
		await drop.open([image]);

		await drop.open([buildA]);

		expect(drop.refused).toEqual([]);
	});
});
