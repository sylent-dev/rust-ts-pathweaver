// What the page says of the files refused: the reason of each, and the few listed of many.

import { describe, expect, it } from 'vitest';
import type { RefusedRead } from './opening.svelte.ts';
import { listedRefusals, refusalReason } from './refusal-text.ts';

/** A file refused as not text, named by its number. */
function refused(number: number): RefusedRead {
	return { kind: 'refused', fileName: `${number}.png`, refusal: { reason: 'notText' } };
}

describe('the reason of a file refused', () => {
	it('is written after its name, without a period, for each reason', () => {
		expect([
			refusalReason({ reason: 'tooLarge', bytes: 48_234_112, limit: 1_048_576 }),
			refusalReason({ reason: 'notText' }),
			refusalReason({ reason: 'notJson', line: 12, excerpt: '"level": 12,,' }),
			refusalReason({ reason: 'notABuild' }),
			refusalReason({ reason: 'wrongValue', field: 'skills[2].level' }),
			refusalReason({ reason: 'missingField', field: 'passives[0].id' }),
			refusalReason({ reason: 'unreadable' })
		]).toEqual([
			'is 48,234,112 bytes, larger than 1,048,576',
			"isn't a text file",
			"isn't valid JSON at line 12",
			"isn't a build: an object with a name",
			'has a value of the wrong type at skills[2].level',
			'misses the field passives[0].id',
			"couldn't be read by the browser"
		]);
	});
});

describe('the files refused listed', () => {
	it('are all of them, up to four', () => {
		const four = [1, 2, 3, 4].map(refused);

		expect(listedRefusals(four)).toEqual({ listed: four, more: 0 });
	});

	it('are the first three of five or more, the others counted', () => {
		const seven = [1, 2, 3, 4, 5, 6, 7].map(refused);

		expect(listedRefusals(seven.slice(0, 5))).toEqual({ listed: seven.slice(0, 3), more: 2 });
		expect(listedRefusals(seven)).toEqual({ listed: seven.slice(0, 3), more: 4 });
	});
});
