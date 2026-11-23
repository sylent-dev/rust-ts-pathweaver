// What the page says of the files refused (specs.md, Opening builds, Window layout): the reason of
// each, written after its name, the title of the zone that refuses them, and the few listed of
// many. Read by the drop zone of the first
// visit, and by the notice of the page of a build (4f).

import { t } from '#lib/i18n.ts';
import type { RefusedRead } from './opening.svelte.ts';
import type { FileRefusal } from './read-files.ts';

/** The most files refused listed whole: four fit the drop zone without a scroll. */
const MOST_LISTED = 4;

/**
 * The files listed of more than `MOST_LISTED`, before « and N more »: three, so that « and N more »
 * always hides two or more (the owner, 2026-11-23: whoever drops that many files can drop them
 * again).
 */
const LISTED_OF_MANY = 3;

/** Why a file is refused, written after its name, without a period at its end. */
export function refusalReason(refusal: FileRefusal): string {
	switch (refusal.reason) {
		case 'tooLarge':
			return t('refused-too-large', { bytes: refusal.bytes, limit: refusal.limit });
		case 'notText':
			return t('refused-not-text');
		case 'notJson':
			return t('refused-not-json', { line: refusal.line });
		case 'notABuild':
			return t('refused-not-a-build');
		case 'wrongValue':
			return t('refused-wrong-value', { field: refusal.field });
		case 'missingField':
			return t('refused-missing-field', { field: refusal.field });
		case 'unreadable':
			return t('refused-unreadable');
	}
}

/**
 * What went wrong with the files of a drop, all refused, which the drop zone says over them: a
 * file that isn't text isn't a .build file at all; a file of another reason is one that can't be
 * read; several files, whatever their reasons, can't be read.
 */
export function refusalTitle(refused: readonly RefusedRead[]): string {
	const [first, ...others] = refused;
	if (first === undefined || others.length > 0) {
		return t('refused-zone-several');
	}
	switch (first.refusal.reason) {
		case 'notText':
			return t('refused-zone-not-a-build-file');
		case 'tooLarge':
		case 'notJson':
		case 'notABuild':
		case 'wrongValue':
		case 'missingField':
		case 'unreadable':
			return t('refused-zone-unreadable');
	}
}

/** The files refused a page lists, and how many more it only counts. */
export interface ListedRefusals {
	listed: readonly RefusedRead[];
	/** The files refused not listed: none, or two and more. */
	more: number;
}

/** The files refused listed: all of them up to four, the first three of five or more. */
export function listedRefusals(refused: readonly RefusedRead[]): ListedRefusals {
	const listed = refused.length > MOST_LISTED ? refused.slice(0, LISTED_OF_MANY) : refused;
	return { listed, more: refused.length - listed.length };
}
