<!-- The mark of Pathweaver, drawn by the owner (2026-11-17): two rings of a triangle pointing down,
     the outer one three bars in the accent, the inner one a P in the colour of the text around it.
     Its paths are those the mock-up builds from its rules (docs/mockups/pathweaver/js/logo-mark.js,
     the weight 88 · Bold), written out once: the weight is decided, nothing here computes it. -->
<script lang="ts">
	interface Props {
		/** The side of its square, in pixels. */
		size: number;
	}

	let { size }: Props = $props();
</script>

<svg
	class="mark"
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="-119.22 -113.97 238.45 238.45"
	aria-hidden="true"
>
	<path
		class="frame"
		d="M68.70 -98.00L84.87 -70.00L-84.87 -70.00L-68.70 -98.00ZM-119.22 -10.50L-50.52 108.50L-18.19 108.50L-103.06 -38.50ZM119.22 -10.50L56.58 98.00L40.41 70.00L103.06 -38.50Z"
	/>
	<path
		class="p"
		d="M-84.87 -49.00L6.06 108.50L38.39 108.50L-36.37 -21.00L36.37 -21.00L12.12 21.00L28.29 49.00L84.87 -49.00Z"
	/>
</svg>

<style>
	.mark {
		flex: none;
		display: block;
	}

	.frame {
		fill: var(--accent);
	}

	.p {
		fill: currentColor;
	}
</style>
