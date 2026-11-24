<!-- The band of the open builds (specs.md, Window layout; 2e of the mock-up), under the band of the
     site, while a build is open: their tabs, the full height of the band, side by side, in the order
     of the list, as many as fit (band-layout.ts), the build shown always among them; « +N ▾ » for
     the others; then +, which opens the choice of files of the system at once (the owner,
     2026-11-18). In the shade of the band of the site, a very light shadow under it. -->
<script lang="ts">
	import { tick } from 'svelte';
	import Icon from '#lib/icons/Icon.svelte';
	import { t } from '#lib/i18n.ts';
	import FileChooser from '#lib/page/FileChooser.svelte';
	import { openBuilds } from '#lib/page/open-builds.svelte.ts';
	import { ADD_WIDTH_PIXELS, END_PADDING_PIXELS, TAB_WIDTH_PIXELS } from './band-layout.ts';
	import MoreBuilds from './MoreBuilds.svelte';
	import OpenBuildTab from './OpenBuildTab.svelte';

	let chooser: FileChooser;
	/** None once the band leaves the page, its last build closed. */
	let band: HTMLElement | null = $state(null);

	/** Every build has a tab until the band is measured. */
	const layout = $derived(
		openBuilds.bandLayout ?? {
			tabCount: openBuilds.all.length,
			tabWidthPixels: TAB_WIDTH_PIXELS
		}
	);
	const tabBuilds = $derived(openBuilds.all.slice(0, layout.tabCount));
	const menuBuilds = $derived(openBuilds.all.slice(layout.tabCount));

	// The band follows the width of the window: the open builds read it.
	$effect(() => {
		if (band === null) {
			return;
		}
		const measured = band;
		const observer = new ResizeObserver(() => openBuilds.measureBand(measured.clientWidth));
		observer.observe(measured);
		return () => observer.disconnect();
	});

	/**
	 * Puts the keyboard on the tab of the build shown, once it is drawn, as when the notice over
	 * the band is closed; nowhere when the last build was closed, which takes the band off the page.
	 */
	export async function focusShownTab(): Promise<void> {
		await tick();
		band?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
	}

	/** Closes a build, the keyboard on the tab of the build shown then (the owner, 2026-11-24). */
	function close(contentKey: string): void {
		openBuilds.close(contentKey);
		void focusShownTab();
	}

	/** Shows a build chosen in « +N ▾ », which takes the place of the last tab, the keyboard on it. */
	function showFromMenu(contentKey: string): void {
		openBuilds.show(contentKey);
		void focusShownTab();
	}
</script>

<nav
	bind:this={band}
	class="band"
	aria-label={t('builds-band')}
	style:padding-right="{END_PADDING_PIXELS}px"
>
	<div class="tabs" style:--tab-width="{layout.tabWidthPixels}px">
		{#each tabBuilds as build (build.contentKey)}
			<OpenBuildTab
				{build}
				isCurrent={build.contentKey === openBuilds.shown?.contentKey}
				onshow={() => openBuilds.show(build.contentKey)}
				onclose={() => close(build.contentKey)}
			/>
		{/each}
	</div>
	{#if menuBuilds.length > 0}
		<MoreBuilds builds={menuBuilds} onshow={showFromMenu} />
	{/if}
	<button
		type="button"
		class="add"
		style:width="{ADD_WIDTH_PIXELS}px"
		title={t('builds-add')}
		aria-label={t('builds-add')}
		onclick={() => chooser.open()}
	>
		<span class="add-mark"><Icon name="add" size={14} /></span>
	</button>
	<FileChooser bind:this={chooser} />
</nav>

<style>
	/* 44 pixels, over what is under it, so that the menu of « +N ▾ » hangs over the level band. */
	.band {
		position: relative;
		z-index: 6;
		display: flex;
		height: 44px;
		background: var(--top-band-image), var(--builds-band);
		color: var(--on-top-band);
		box-shadow: var(--band-shadow);
	}

	.tabs {
		display: flex;
		min-width: 0;
	}

	/* The button that matters most: the colour of the band on the colour of its text, the full
	   height of the band, square; that colour a little dimmed and the + a little larger on hover,
	   with the small bounce of the motions, none when the system asks for less motion. */
	.add {
		display: grid;
		place-items: center;
		flex: none;
		padding: 0;
		border: none;
		background: var(--on-top-band);
		color: var(--builds-band);
		cursor: pointer;
		transition: background-color var(--hover-fade);
	}

	.add:hover {
		background: color-mix(in srgb, var(--on-top-band) 82%, transparent);
	}

	.add-mark {
		display: grid;
		transition: transform 0.2s var(--ease-overshoot);
	}

	.add:hover .add-mark {
		transform: scale(1.3);
	}

	@media (prefers-reduced-motion: reduce) {
		.add-mark {
			transition: none;
		}
	}
</style>
