<!-- The row of the five tabs of a build (specs.md, Window layout; 2h of the mock-up): their names
     alone on the graph paper of the page, the current one in the colour of the text over the
     cursor of the level laid down, a white bar that slides to the tab clicked. Plain buttons, the
     one shown marked current: ← and → stay the level's wherever the focus is (the owner,
     2026-11-19), where the tabs of a `tablist` would take them. -->
<script lang="ts">
	import { BUILD_TABS, type BuildTab, shownTab } from '#lib/page/build-tab.svelte.ts';
	import { t } from '#lib/i18n.ts';

	interface Props {
		/** The id of the panel the tabs show, for a screen reader. */
		panelId: string;
	}

	let { panelId }: Props = $props();

	/** The width of the bar, in pixels, as the cursor of the level laid down is long. */
	const BAR_WIDTH_PIXELS = 28;

	const buttons: (HTMLButtonElement | undefined)[] = $state([]);
	/** The tab the bar was last put under without a motion: at first, and when the words grow. */
	let placedTab = $state<BuildTab>();
	/** Whether the bar slides to its place: to a tab chosen, however it was chosen. */
	const isSliding = $derived(placedTab !== undefined && placedTab !== shownTab.current);

	/** Where the bar is under a tab: in the middle of its words. */
	function barUnder(tab: BuildTab): number | undefined {
		const button = buttons[BUILD_TABS.indexOf(tab)];
		return button === undefined
			? undefined
			: button.offsetLeft + (button.offsetWidth - BAR_WIDTH_PIXELS) / 2;
	}

	/**
	 * Where the bar is, from the left of the row, under the tab shown however it was chosen (a
	 * line of the window of what changes); none until the tabs are measured.
	 */
	let barPixels = $derived(barUnder(shownTab.current));

	// The words of the tabs change their width once the font is loaded: the bar moves at once.
	$effect(() => {
		const observer = new ResizeObserver(() => {
			placedTab = shownTab.current;
			barPixels = barUnder(placedTab);
		});
		for (const button of buttons) {
			if (button !== undefined) {
				observer.observe(button);
			}
		}
		return () => observer.disconnect();
	});
</script>

<div class="tabs graph-paper">
	{#each BUILD_TABS as tab, index (tab)}
		<button
			bind:this={buttons[index]}
			type="button"
			class="tab"
			aria-current={tab === shownTab.current}
			aria-controls={panelId}
			onclick={() => shownTab.show(tab)}
		>
			{t(`tab-${tab}`)}
		</button>
	{/each}
	{#if barPixels !== undefined}
		<span class="bar" class:is-sliding={isSliding} style:--bar-x="{barPixels}px" aria-hidden="true"
		></span>
	{/if}
</div>

<style>
	/* 44 pixels, on the graph paper of the page. */
	.tabs {
		position: relative;
		display: flex;
		align-items: stretch;
		height: 44px;
		padding: 0 0 0 4px;
	}

	/* Their names in Manrope 600, grey, the current one and the hover in the colour of the text. */
	.tab {
		padding: 0 16px;
		border: none;
		background: none;
		color: var(--weak);
		cursor: pointer;
		font-size: 14px;
		font-weight: 600;
		transition: color 0.2s;
	}

	.tab:is(:hover, [aria-current='true']) {
		color: var(--text);
	}

	/* The cursor of the level laid down: a white bar of 28 × 4 pixels, without glow. */
	.bar {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 28px;
		height: 4px;
		background: var(--highlight);
		transform: translateX(var(--bar-x));
		pointer-events: none;
	}

	/* It slides in 0.28 s with the small bounce of the cursor set down; nothing moves when the
	   system asks for less motion. */
	.bar.is-sliding {
		transition: transform 0.28s cubic-bezier(0.3, 1.45, 0.5, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.bar.is-sliding {
			transition: none;
		}
	}
</style>
