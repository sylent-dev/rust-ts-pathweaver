<!-- An icon of the interface, drawn in the colour of its text (docs/mockups/pathweaver/js/icons.js,
     where each was drawn): a line of 1.6 on a square of 16, its ends round but where an icon cuts
     them flat. Hidden from a screen reader: the control it is on carries the words. -->
<script lang="ts" module>
	/** The icons of the interface, by name. */
	export type IconName = 'close' | 'add' | 'down';
</script>

<script lang="ts">
	interface Props {
		name: IconName;
		/** Its side, in pixels. */
		size: number;
	}

	let { name, size }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 16 16"
	fill="none"
	stroke="currentColor"
	stroke-width="1.6"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'close'}
		<path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
	{:else if name === 'add'}
		<!-- Its ends cut flat, like the corners of the drop zone it leads to. -->
		<path d="M8 3v10M3 8h10" stroke-linecap="butt" />
	{:else if name === 'down'}
		<path d="M4.5 6.5 8 10l3.5-3.5" />
	{/if}
</svg>
