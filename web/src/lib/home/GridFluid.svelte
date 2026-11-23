<!-- The fluid of the graph paper of the first visit (specs.md, Window layout): a canvas over the
     grid of its parent, where a fluid in the accent, at 80 %, runs along the main lines under the
     pointer (the owner, 2026-11-23: discreet), its rules in grid-fluid.ts. Still,
     and not drawn, when the system asks for less motion. It reads the tile of its parent (--tile)
     and its ink from the tokens (--accent). -->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { FluidGrid, heartbeat, rgbChannels } from './grid-fluid.ts';

	const lessMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	/** The canvas, null while it isn't drawn: Svelte sets it back to null when it is taken away. */
	let canvas = $state<HTMLCanvasElement | null>(null);
	/** The grid of the size of the canvas, made again when it changes. */
	let grid: FluidGrid | undefined;
	let context: CanvasRenderingContext2D | null = null;
	let ink: string | undefined;
	/** The ink last said unreadable, so that a window resized says it once. */
	let unreadInk: string | undefined;
	/** Where the pointer was over the canvas, none while it is elsewhere. */
	let pointer: { x: number; y: number } | undefined;
	/** The frame asked for, none while the fluid is still. */
	let frame: number | undefined;

	/** Sizes the canvas to its box, at most two pixels of the screen a pixel, and its grid. */
	function resize(element: HTMLCanvasElement): void {
		const width = element.clientWidth;
		const height = element.clientHeight;
		const ratio = Math.min(devicePixelRatio, 2);
		element.width = Math.round(width * ratio);
		element.height = Math.round(height * ratio);
		context = element.getContext('2d');
		context?.setTransform(ratio, 0, 0, ratio, 0, 0);
		const style = getComputedStyle(element);
		const accent = style.getPropertyValue('--accent');
		ink = rgbChannels(accent);
		if (ink === undefined && accent !== unreadInk) {
			unreadInk = accent;
			console.warn('grid-fluid: --accent is not written #rrggbb, the fluid is not drawn', accent);
		}
		grid = new FluidGrid(width, height, Number.parseFloat(style.getPropertyValue('--tile')));
	}

	$effect(() => {
		const element = canvas;
		if (element === null) {
			return;
		}
		const observer = new ResizeObserver(() => resize(element));
		observer.observe(element);
		return () => {
			observer.disconnect();
			if (frame !== undefined) {
				cancelAnimationFrame(frame);
				frame = undefined;
			}
		};
	});

	/** Pours the fluid under the pointer as it moves, and runs it. */
	function pour(event: PointerEvent): void {
		if (canvas === null || grid === undefined) {
			return;
		}
		const box = canvas.getBoundingClientRect();
		const x = event.clientX - box.left;
		const y = event.clientY - box.top;
		if (x < 0 || y < 0 || x > box.width || y > box.height) {
			pointer = undefined;
			return;
		}
		const moved = pointer === undefined ? 0 : Math.hypot(x - pointer.x, y - pointer.y);
		pointer = { x, y };
		grid.pour(x, y, moved);
		frame ??= requestAnimationFrame(run);
	}

	/** One frame of the fluid; it stops once the fluid is gone, until the pointer moves again. */
	function run(): void {
		frame = undefined;
		if (grid === undefined || context === null || ink === undefined || canvas === null) {
			return;
		}
		const pulse = heartbeat(performance.now() / 1000);
		const left = grid.step(pulse);
		context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
		if (left > 0.01) {
			grid.draw(context, ink, pulse);
			frame = requestAnimationFrame(run);
		}
	}
</script>

<svelte:window onpointermove={lessMotion.current ? undefined : pour} />

{#if !lessMotion.current}
	<canvas class="fluid" bind:this={canvas} aria-hidden="true"></canvas>
{/if}

<style>
	.fluid {
		position: absolute;
		inset: 0;
		z-index: -1;
		width: 100%;
		height: 100%;
		pointer-events: none;
		opacity: 80%;
	}
</style>
