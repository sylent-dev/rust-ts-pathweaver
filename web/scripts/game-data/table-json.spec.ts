import { expect, it } from 'vitest';
import { tableJson } from './table-json.ts';

it('writes a table sorted by id, one entry per line, that reads back as the same table', () => {
	const table = { b: { name: 'Two' }, a: { name: 'One' }, c: { name: 'Three, with a\nbreak' } };
	const text = tableJson(table);
	expect(text).toBe(
		'{\n"a":{"name":"One"},\n"b":{"name":"Two"},\n"c":{"name":"Three, with a\\nbreak"}\n}\n'
	);
	expect(JSON.parse(text)).toEqual(table);
});
