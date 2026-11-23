// The rules of the fluid of the graph paper, without a canvas.

import { describe, expect, it } from 'vitest';
import { FluidGrid, heartbeat, rgbChannels, seededRandom, veinsOf } from './grid-fluid.ts';

/** A random that always gives the middle, so that the fluid is poured and spread evenly. */
const even = () => 0.5;

describe('the veins', () => {
	it('are the same at each visit for the same window', () => {
		expect(veinsOf(21, 19)).toEqual(veinsOf(21, 19));
		expect(seededRandom(7)()).toBe(seededRandom(7)());
	});

	it('run from a crossing to a neighbour along a line of the grid', () => {
		const columns = 21;
		const { downstream, isOnVein } = veinsOf(columns, 19);
		const segments = [...downstream].flatMap((to, from) => (to < 0 ? [] : [[from, to]]));

		expect(segments.length).toBeGreaterThan(0);
		for (const [from = 0, to = 0] of segments) {
			const step = Math.abs(to - from);
			expect(step === 1 || step === columns).toBe(true);
			expect([isOnVein[from], isOnVein[to]]).toEqual([1, 1]);
		}
	});

	it('never run back to the crossing they came from', () => {
		const { downstream } = veinsOf(21, 19);
		downstream.forEach((to, from) => {
			if (to >= 0) {
				expect(downstream[to]).not.toBe(from);
			}
		});
	});
});

describe('the heartbeat', () => {
	it('beats strongly, then weaker, then rests, 72 times a minute', () => {
		const beat = 60 / 72;
		expect(heartbeat(0.05)).toBeCloseTo(1, 1);
		expect(heartbeat(0.25)).toBeCloseTo(0.6, 1);
		expect(heartbeat(0.6)).toBeLessThan(0.01);
		expect(heartbeat(beat + 0.05)).toBeCloseTo(heartbeat(0.05));
	});
});

describe('the fluid', () => {
	it('is poured into the crossings around the pointer only', () => {
		const grid = new FluidGrid(480, 480, 48);
		grid.pour(240, 240, 0, even);

		const at = (column: number, row: number) => grid.energy[row * grid.columns + column] ?? 0;
		expect(at(5, 5)).toBeGreaterThan(0);
		expect(at(0, 0)).toBe(0);
		expect(at(10, 10)).toBe(0);
	});

	it('is poured more as the pointer moves faster, never past full', () => {
		const slow = new FluidGrid(480, 480, 48);
		const fast = new FluidGrid(480, 480, 48);
		slow.pour(240, 240, 0, even);
		fast.pour(240, 240, 120, even);
		const middle = 5 * slow.columns + 5;

		expect(fast.energy[middle]).toBeGreaterThan(slow.energy[middle] ?? 0);
		for (let pours = 0; pours < 10; pours++) {
			fast.pour(240, 240, 600, even);
		}
		expect(Math.max(...fast.energy)).toBeLessThanOrEqual(1);
	});

	it('fades until it is gone, so that the canvas stops drawing', () => {
		const grid = new FluidGrid(480, 480, 48);
		grid.pour(240, 240, 60, even);
		let left = Infinity;
		for (let frames = 0; frames < 2000 && left > 0.01; frames++) {
			left = grid.step(0, even);
		}
		expect(left).toBeLessThanOrEqual(0.01);
	});

	it('runs downstream along a vein, more at a beat', () => {
		const flowOf = (pulse: number) => {
			const grid = new FluidGrid(960, 960, 48);
			const from = grid.veins.downstream.findIndex((to) => to >= 0);
			const to = grid.veins.downstream[from] ?? -1;
			grid.energy[from] = 1;
			grid.step(pulse, even);
			return grid.energy[to] ?? 0;
		};
		expect(flowOf(0)).toBeGreaterThan(0);
		expect(flowOf(1)).toBeGreaterThan(flowOf(0));
	});

	it('dims a line that touches a vein without running along it', () => {
		const grid = new FluidGrid(960, 960, 48);
		const { downstream, isOnVein } = grid.veins;
		const from = downstream.findIndex((to) => to >= 0);
		const to = downstream[from] ?? -1;
		const offVein = isOnVein.findIndex((on, index) => on === 0 && isOnVein[index + 1] === 0);
		const across = [from - 1, from + 1, from - grid.columns, from + grid.columns].find(
			(neighbour) => neighbour >= 0 && neighbour !== to && downstream[neighbour] !== from
		);

		expect(grid.lineStrength(from, to)).toBe(1);
		expect(grid.lineStrength(offVein, offVein + 1)).toBe(1);
		expect(grid.lineStrength(from, across ?? 0)).toBeLessThan(1);
	});
});

describe('the ink of the fluid', () => {
	it('is read from a token written #rrggbb', () => {
		expect(rgbChannels(' #ffffff')).toBe('255 255 255');
		expect(rgbChannels('#60A5fa')).toBe('96 165 250');
		expect(rgbChannels('white')).toBeUndefined();
	});
});
