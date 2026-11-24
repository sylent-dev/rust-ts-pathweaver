<!-- An icon of the interface, drawn in the colour of its text (docs/mockups/pathweaver/js/icons.js,
     where each was drawn): a line of 1.6 on a square of 16, its ends round but where an icon cuts
     them flat, or a shape filled. Hidden from a screen reader: the control it is on carries the
     words. -->
<script lang="ts" module>
	/** How an icon is drawn: a line, its ends round unless cut flat, or a shape filled. */
	type IconDrawing =
		{ kind: 'line'; path: string; lineCap?: 'butt' } | { kind: 'filled'; path: string };

	/** The icons of the interface, each drawn: a name without its drawing stops the type check. */
	const ICONS = {
		close: { kind: 'line', path: 'M4.5 4.5l7 7M11.5 4.5l-7 7' },
		// Its ends cut flat, like the corners of the drop zone it leads to.
		add: { kind: 'line', path: 'M8 3v10M3 8h10', lineCap: 'butt' },
		down: { kind: 'line', path: 'M4.5 6.5 8 10l3.5-3.5' },
		// The mark of a note of the author, a speech bubble (js/level-changes.js).
		note: { kind: 'filled', path: 'M2 3h12v8.2H7.2L3.4 14.2V11.2H2z' }
	} satisfies Record<string, IconDrawing>;

	/** The icons of the interface, by name. */
	export type IconName = keyof typeof ICONS;
</script>

<script lang="ts">
	interface Props {
		name: IconName;
		/** Its side, in pixels. */
		size: number;
	}

	let { name, size }: Props = $props();

	const drawing: IconDrawing = $derived(ICONS[name]);
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
	{#if drawing.kind === 'filled'}
		<path d={drawing.path} fill="currentColor" stroke="none" />
	{:else}
		<path d={drawing.path} stroke-linecap={drawing.lineCap} />
	{/if}
</svg>
