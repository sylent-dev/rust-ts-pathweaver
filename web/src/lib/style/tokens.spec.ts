// The tokens of the application are a copy of those of the mock-up, the reference (specs.md, The
// style): a value changed on one side only is a test that fails, not a colour that drifts.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The tokens a style sheet sets, by name, their values written as Prettier writes them in the
 * application: the spaces single, none inside the brackets, the quotes single, a 0 before a
 * point.
 */
function tokensOf(path: string): Map<string, string> {
	const sheet = readFileSync(new URL(path, import.meta.url), 'utf8').replaceAll(
		/\/\*[\s\S]*?\*\//g,
		''
	);
	const tokens = new Map<string, string>();
	for (const [, name, value] of sheet.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
		if (name !== undefined && value !== undefined) {
			const written = value
				.replaceAll(/\s+/g, ' ')
				.replaceAll(/\( | \)/g, (bracket) => bracket.trim())
				.replaceAll('"', "'")
				.replaceAll(/(?<![\d.])\./g, '0.')
				.trim();
			tokens.set(name, written);
		}
	}
	return tokens;
}

/** The tokens of the mock-up that draw the mock-up itself, not the application. */
const MOCK_UP_ONLY = ['--window-shadow'];

describe('the tokens', () => {
	it('are those of the mock-up, value for value', () => {
		const mockUp = tokensOf('../../../../docs/mockups/pathweaver/css/tokens.css');
		for (const name of MOCK_UP_ONLY) {
			mockUp.delete(name);
		}
		expect(Object.fromEntries(tokensOf('./tokens.css'))).toEqual(Object.fromEntries(mockUp));
	});
});
