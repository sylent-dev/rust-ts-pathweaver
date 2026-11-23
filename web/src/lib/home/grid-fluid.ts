// The fluid of the graph paper of the first visit (specs.md, Window layout; the owner, 2026-11-18,
// after sylent.art), its rules apart from its canvas (GridFluid.svelte), ported from the mock-up
// (docs/mockups/pathweaver/js/grid-fluid.js).
//
// Under the pointer, a fluid runs along the main lines of the grid. Each crossing holds some
// energy: the pointer pours energy into the crossings around it as it moves, the energy spreads
// to the neighbour crossings and fades, and each line glows with the energy of its two ends. Like
// blood in veins (the owner, 2026-11-18): a network of veins is laid on the grid once, the same at
// each visit; the fluid poured off the veins fades fast, what reaches a vein runs along it,
// downstream, in surges at each beat of a heart, and the glow swells with the beat.

/**
 * How much the veins hold the fluid apart from the rest of the grid, and how unevenly it is
 * poured, from 0 (the even fluid of sylent.art) to 1; and how slowly the fluid fades in the
 * veins, a share kept each frame. Tuned by the owner on sliders (2026-11-18, 2026-11-23: less
 * volatile and more discreet).
 */
const VOLATILITY = 0.4;
const PERSISTENCE = 0.945;

/** How far around the pointer the fluid is poured, in cells. */
const POUR_REACH_CELLS = 1.6;

/** A random number from 0 included to 1 excluded, as `Math.random` gives. */
export type Random = () => number;

/** A small random of a seed, so that the veins are the same at each visit (mulberry32). */
export function seededRandom(seed: number): Random {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
		return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
	};
}

/** The veins of a grid, by the index of each crossing (`row * columns + column`). */
export interface Veins {
	/** The crossing downstream of each crossing, -1 off the veins and at the end of a vein. */
	downstream: Int32Array;
	/** 1 for a crossing on a vein, 0 for the others. */
	isOnVein: Uint8Array;
}

/** A walk along the lines of the grid that lays a vein. */
interface Walk {
	column: number;
	row: number;
	/** An index of `MOVES`. */
	direction: number;
	steps: number;
}

/** The moves along the lines, turning a quarter to the right from one to the next. */
const MOVES = [
	[1, 0],
	[0, 1],
	[-1, 0],
	[0, -1]
] as const;

/**
 * The veins of a grid of crossings: random walks from random crossings, going straight, turning
 * now and then, never back, and branching; a walk that meets a vein flows into it. The same for
 * the same size of grid.
 */
export function veinsOf(columns: number, rows: number): Veins {
	const random = seededRandom(columns * 1000 + rows);
	const veins: Veins = {
		downstream: new Int32Array(columns * rows).fill(-1),
		isOnVein: new Uint8Array(columns * rows)
	};
	const walks: Walk[] = [];
	for (let count = 0; count < Math.round((columns + rows) / 2.5); count++) {
		walks.push({
			column: Math.floor(random() * columns),
			row: Math.floor(random() * rows),
			direction: Math.floor(random() * 4),
			steps: columns + rows
		});
	}
	for (let walk = walks.pop(); walk !== undefined; walk = walks.pop()) {
		walks.push(...layVein(veins, walk, { columns, rows }, random));
	}
	return veins;
}

/** Lays the vein of a walk, until it leaves the grid or meets a vein; gives its branches. */
function layVein(
	veins: Veins,
	walk: Walk,
	grid: { columns: number; rows: number },
	random: Random
): Walk[] {
	const branches: Walk[] = [];
	let { column, row, direction } = walk;
	for (let steps = walk.steps; steps > 0; steps--) {
		const turn = random();
		if (turn < 0.12) {
			direction = (direction + 1) % 4;
		} else if (turn < 0.24) {
			direction = (direction + 3) % 4;
		}
		const [dx, dy] = MOVES[direction] ?? MOVES[0];
		const toColumn = column + dx;
		const toRow = row + dy;
		if (toColumn < 0 || toRow < 0 || toColumn >= grid.columns || toRow >= grid.rows) {
			break;
		}
		const from = row * grid.columns + column;
		const to = toRow * grid.columns + toColumn;
		// Never back, never two ways out of a crossing.
		if (veins.downstream[to] === from || veins.downstream[from] !== -1) {
			break;
		}
		veins.downstream[from] = to;
		veins.isOnVein[from] = 1;
		veins.isOnVein[to] = 1;
		if (random() < 0.06) {
			const side = random() < 0.5 ? 1 : 3;
			branches.push({
				column: toColumn,
				row: toRow,
				direction: (direction + side) % 4,
				steps: Math.floor(steps / 2)
			});
		}
		column = toColumn;
		row = toRow;
	}
	return branches;
}

/**
 * A heart at 72 beats a minute, from 0 to 1 at a time in seconds: a strong beat (lub), then a
 * weaker one (dub), then the rest.
 */
export function heartbeat(seconds: number): number {
	const phase = seconds % (60 / 72);
	const bump = (at: number, width: number) => Math.exp(-(((phase - at) / width) ** 2));
	return Math.min(1, bump(0.05, 0.05) + 0.6 * bump(0.25, 0.05));
}

/** The energy of the crossings of the main lines of a surface, and its veins. */
export class FluidGrid {
	readonly columns: number;
	readonly rows: number;
	/** The side of a cell, in pixels. */
	readonly cell: number;
	readonly veins: Veins;
	/** The energy of each crossing, from 0 to 1. */
	energy: Float32Array;
	#next: Float32Array;
	#flow: Float32Array;

	/** The grid of a surface of this size in pixels, a crossing on each of its edges. */
	constructor(width: number, height: number, cell: number) {
		this.cell = cell;
		this.columns = Math.ceil(width / cell) + 1;
		this.rows = Math.ceil(height / cell) + 1;
		this.veins = veinsOf(this.columns, this.rows);
		this.energy = new Float32Array(this.columns * this.rows);
		this.#next = new Float32Array(this.columns * this.rows);
		this.#flow = new Float32Array(this.columns * this.rows);
	}

	/**
	 * Pours energy into the crossings near a point, in pixels, more as the pointer moved further
	 * since the last point (`movedPixels`), unevenly with the volatility.
	 */
	pour(x: number, y: number, movedPixels: number, random: Random = Math.random): void {
		const { cell, columns, rows, energy } = this;
		const amount = Math.min(0.9, 0.12 + movedPixels / 60);
		const reach = cell * POUR_REACH_CELLS;
		const lastRow = Math.min(rows - 1, Math.ceil((y + reach) / cell));
		const lastColumn = Math.min(columns - 1, Math.ceil((x + reach) / cell));
		for (let row = Math.max(0, Math.floor((y - reach) / cell)); row <= lastRow; row++) {
			for (
				let column = Math.max(0, Math.floor((x - reach) / cell));
				column <= lastColumn;
				column++
			) {
				const distance = Math.hypot(column * cell - x, row * cell - y);
				if (distance < reach) {
					const uneven = 1 + VOLATILITY * (random() - 0.5) * 1.6;
					const index = row * columns + column;
					energy[index] = Math.min(
						1,
						(energy[index] ?? 0) + amount * uneven * (1 - distance / reach)
					);
				}
			}
		}
	}

	/**
	 * One frame: the energy spreads and fades, then runs downstream along the veins, more at a
	 * beat (`pulse`, from `heartbeat`). Gives the energy left on the whole grid.
	 */
	step(pulse: number, random: Random = Math.random): number {
		this.#spread(random);
		this.#runDownstream(pulse);
		[this.energy, this.#next] = [this.#next, this.energy];
		return this.energy.reduce((total, value) => total + value, 0);
	}

	/**
	 * Each crossing moves toward the weighted mean of its neighbours, then fades: in a vein at
	 * the persistence, off the veins faster, so that the fluid stays in the veins; into `#next`.
	 */
	#spread(random: Random): void {
		const { columns, rows, energy } = this;
		const { isOnVein } = this.veins;
		const fadeOff = PERSISTENCE - VOLATILITY * 0.12;
		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				const index = row * columns + column;
				const own = energy[index] ?? 0;
				const onVein = isOnVein[index] === 1;
				let sum = 0;
				let weights = 0;
				const take = (neighbour: number) => {
					// A vein and the grid around it hardly exchange: a vein keeps its fluid.
					const weight =
						isOnVein[neighbour] === isOnVein[index] ? 1 : Math.max(0, 1 - VOLATILITY * 1.6);
					sum += (energy[neighbour] ?? 0) * weight;
					weights += weight;
				};
				if (column > 0) take(index - 1);
				if (column < columns - 1) take(index + 1);
				if (row > 0) take(index - columns);
				if (row < rows - 1) take(index + columns);
				const mean = weights > 0 ? sum / weights : own;
				// A surge keeps its shape along a vein.
				const spread = onVein ? 0.05 : 0.42;
				const flicker = 1 + VOLATILITY * (random() - 0.5) * 0.06;
				const value = (own + (mean - own) * spread) * (onVein ? PERSISTENCE : fadeOff) * flicker;
				this.#next[index] = value < 0.004 ? 0 : Math.min(1, value);
			}
		}
	}

	/**
	 * Each crossing of a vein hands part of its energy to the next one downstream, about three
	 * crossings a second, more at a beat; through a buffer, so that the fluid moves at most one
	 * crossing a frame.
	 */
	#runDownstream(pulse: number): void {
		const next = this.#next;
		const flow = this.#flow;
		const { downstream } = this.veins;
		flow.fill(0);
		for (let index = 0; index < next.length; index++) {
			const to = downstream[index] ?? -1;
			const value = next[index] ?? 0;
			if (value < 0.01 || to < 0) {
				continue;
			}
			const moved = value * VOLATILITY * (0.04 + 0.25 * pulse);
			flow[index] = (flow[index] ?? 0) - moved;
			flow[to] = (flow[to] ?? 0) + moved;
		}
		for (let index = 0; index < next.length; index++) {
			next[index] = Math.min(1, Math.max(0, (next[index] ?? 0) + (flow[index] ?? 0)));
		}
	}

	/**
	 * Draws the lines of the grid in a colour (`rgb`, its channels such as `255 255 255`), each
	 * with the energy of its two ends: a soft wide stroke for the glow, swelling with the beat,
	 * then the thin line itself. A line that touches a vein without being one of its segments is
	 * dimmed, so that the veins read as paths rather than as crosses.
	 */
	draw(context: CanvasRenderingContext2D, rgb: string, pulse: number): void {
		const swell = 1 + VOLATILITY * 0.6 * pulse;
		for (const [lineWidth, alpha] of [
			[4 * swell, 0.22 * swell],
			[1, 1]
		] as const) {
			context.lineWidth = lineWidth;
			context.globalAlpha = alpha;
			this.#drawLines(context, rgb);
		}
		context.globalAlpha = 1;
	}

	/** Draws each line of the grid once, at its strength. */
	#drawLines(context: CanvasRenderingContext2D, rgb: string): void {
		const { columns, rows, cell, energy } = this;
		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				const index = row * columns + column;
				const x = column * cell + 0.5;
				const y = row * cell + 0.5;
				if (column < columns - 1) {
					const strength = this.lineStrength(index, index + 1);
					drawLine(context, rgb, { x, y, toX: x + cell, toY: y }, [
						(energy[index] ?? 0) * strength,
						(energy[index + 1] ?? 0) * strength
					]);
				}
				if (row < rows - 1) {
					const strength = this.lineStrength(index, index + columns);
					drawLine(context, rgb, { x, y, toX: x, toY: y + cell }, [
						(energy[index] ?? 0) * strength,
						(energy[index + columns] ?? 0) * strength
					]);
				}
			}
		}
	}

	/**
	 * How strongly the line between two crossings is drawn: dimmed when it touches a vein without
	 * being one of its segments, whole otherwise.
	 */
	lineStrength(from: number, to: number): number {
		const { isOnVein, downstream } = this.veins;
		const touchesVein = isOnVein[from] === 1 || isOnVein[to] === 1;
		const isSegment = downstream[from] === to || downstream[to] === from;
		return touchesVein && !isSegment ? 1 - VOLATILITY * 0.95 : 1;
	}
}

/** A line from its start to its end, in pixels. */
interface Segment {
	x: number;
	y: number;
	toX: number;
	toY: number;
}

/** Draws a line fading from the energy of its start to that of its end; none when both are dark. */
function drawLine(
	context: CanvasRenderingContext2D,
	rgb: string,
	segment: Segment,
	[start, end]: readonly [number, number]
): void {
	if (start + end < 0.02) {
		return;
	}
	const gradient = context.createLinearGradient(segment.x, segment.y, segment.toX, segment.toY);
	gradient.addColorStop(0, `rgb(${rgb} / ${Math.min(1, start * 1.3)})`);
	gradient.addColorStop(1, `rgb(${rgb} / ${Math.min(1, end * 1.3)})`);
	context.strokeStyle = gradient;
	context.beginPath();
	context.moveTo(segment.x, segment.y);
	context.lineTo(segment.toX, segment.toY);
	context.stroke();
}

/**
 * The channels of a colour written `#rrggbb`, as the token of the ink of the fluid is (its
 * `--accent`), such as `96 165 250`; none for a colour written otherwise.
 */
export function rgbChannels(colour: string): string | undefined {
	const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(colour.trim());
	return hex === null
		? undefined
		: hex
				.slice(1)
				.map((channel) => Number.parseInt(channel, 16))
				.join(' ');
}
