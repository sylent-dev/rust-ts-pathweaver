// The values of the files of the sources, checked where they are read: their format may change at
// any version of the game (docs/game-data.md, Risks accepted), and the script then stops with the
// place of the value rather than write incomplete data.

/** A value of the sources that isn't of the shape the script reads, with its place. */
export class ShapeError extends Error {
	constructor(place: string, expected: string) {
		super(`${place}: expected ${expected}`);
		this.name = 'ShapeError';
	}
}

/** An object of JSON, such as `{ "name": … }`, its fields still unchecked. */
export type JsonObject = Record<string, unknown>;

/** An object, such as an entry of a table. */
export function objectAt(value: unknown, place: string): JsonObject {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new ShapeError(place, 'an object');
	}
	return value as JsonObject;
}

/** An array, such as the classes of the tree. */
export function arrayAt(value: unknown, place: string): unknown[] {
	if (!Array.isArray(value)) {
		throw new ShapeError(place, 'an array');
	}
	return value;
}

/** A string, such as a name. */
export function stringAt(value: unknown, place: string): string {
	if (typeof value !== 'string') {
		throw new ShapeError(place, 'a string');
	}
	return value;
}

/** A number, such as a weight or a coordinate. */
export function numberAt(value: unknown, place: string): number {
	if (typeof value !== 'number') {
		throw new ShapeError(place, 'a number');
	}
	return value;
}

/** A string, or `undefined` for a field missing or `null`. */
export function optionalStringAt(value: unknown, place: string): string | undefined {
	return value === undefined || value === null ? undefined : stringAt(value, place);
}

/** A boolean, or `false` for a field missing. */
export function flagAt(value: unknown, place: string): boolean {
	if (value === undefined) {
		return false;
	}
	if (typeof value !== 'boolean') {
		throw new ShapeError(place, 'a boolean');
	}
	return value;
}
