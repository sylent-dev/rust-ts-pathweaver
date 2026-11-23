// The files the page is given, dropped or chosen (specs.md, Opening builds), read one by one: a
// file refused never stops the others; and the JSON of a build pasted.

import { loadCore, readBuildFile, refusedBySize, type OpenedBuild } from '#lib/core.ts';
import type { RefusedFile } from '#lib/core.ts';

/**
 * Why a file is refused: a reason of the core, or a file the browser couldn't read (a folder
 * dropped, a file removed or locked since it was chosen).
 */
export type FileRefusal = RefusedFile | { reason: 'unreadable' };

/** What a file gives: its build, or its name and why it is refused. */
export type ReadFile =
	| { kind: 'build'; build: OpenedBuild }
	| { kind: 'refused'; fileName: string; refusal: FileRefusal };

/**
 * Reads the files given, in their order, once the core is loaded. A file larger than the core
 * reads is refused from its size, before its bytes are read (a file of a few gigabytes would fill
 * the memory of the page). The core reads the bytes of each file, not a text decoded here: it
 * measures the file itself and says when it isn't text (an image). Rejects only when the core
 * can't load.
 */
export async function readFiles(files: Iterable<File>): Promise<ReadFile[]> {
	await loadCore();
	const read: ReadFile[] = [];
	for (const file of files) {
		read.push(await readFile(file));
	}
	return read;
}

/** What a text pasted gives: its build, or why it is refused. */
export type ReadText =
	{ kind: 'build'; build: OpenedBuild } | { kind: 'refused'; refusal: RefusedFile };

/**
 * Reads a text pasted, once the core is loaded: its bytes in UTF-8, read by the core as those of
 * a file, so that the same rules hold for both, its size included. Rejects only when the core
 * can't load.
 */
export async function readText(text: string): Promise<ReadText> {
	await loadCore();
	const result = readBuildFile(new TextEncoder().encode(text));
	return result.kind === 'build' ? result : { kind: 'refused', refusal: result.error };
}

/** Reads one file, the core loaded. */
async function readFile(file: File): Promise<ReadFile> {
	const tooLarge = refusedBySize(BigInt(file.size));
	if (tooLarge !== undefined) {
		return { kind: 'refused', fileName: file.name, refusal: tooLarge };
	}
	let bytes: Uint8Array;
	try {
		bytes = new Uint8Array(await file.arrayBuffer());
	} catch (error) {
		console.warn(`read-files: the browser could not read ${file.name}`, error);
		return { kind: 'refused', fileName: file.name, refusal: { reason: 'unreadable' } };
	}
	const result = readBuildFile(bytes);
	return result.kind === 'build'
		? result
		: { kind: 'refused', fileName: file.name, refusal: result.error };
}
