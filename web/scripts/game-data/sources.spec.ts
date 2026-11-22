import { expect, it } from 'vitest';
import { checkRepoeVersion } from './sources.ts';

it('accepts RePoE at the version converted, or at one of its builds', () => {
	expect(() => checkRepoeVersion('0.5.5.10', '0.5.5')).not.toThrow();
	expect(() => checkRepoeVersion('0.5.5', '0.5.5')).not.toThrow();
});

it('stops when RePoE is at another version, one that merely begins the same included', () => {
	expect(() => checkRepoeVersion('0.5.5.10', '0.5.2')).toThrow(
		'RePoE is at 0.5.5.10, not at the version converted, 0.5.2.'
	);
	expect(() => checkRepoeVersion('0.5.50.1', '0.5.5')).toThrow(
		'RePoE is at 0.5.50.1, not at the version converted, 0.5.5.'
	);
});
