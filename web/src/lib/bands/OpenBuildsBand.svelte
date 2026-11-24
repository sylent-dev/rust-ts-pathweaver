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
	import { TAB_WIDTH_PIXELS } from './band-layout.ts';
	import MoreBuilds from './MoreBuilds.svelte';
	import OpenBuildTab from './OpenBuildTab.svelte';

	/** The tabs drawn, by the key of the content of their build. */
	const tabs: Record<string, OpenBuildTab | null> = {};
	let chooser: FileChooser;
	let band: HTMLElement;

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
		const observer = new ResizeObserver(() => openBuilds.measureBand(band.clientWidth));
		observer.observe(band);
		return () => observer.disconnect();
	});

	/** Puts the keyboard on the tab of the build shown, if any, once it is drawn. */
	async function focusShownTab(): Promise<void> {
		await tick();
		const shown = openBuilds.shown;
		if (shown !== undefined) {
			tabs[shown.contentKey]?.focus();
		}
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

<nav bind:this={band} class="band" aria-label={t('builds-band')}>
	<div class="tabs" style:--tab-width="{layout.tabWidthPixels}px">
		{#each tabBuilds as build (build.contentKey)}
			<OpenBuildTab
				bind:this={tabs[build.contentKey]}
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
		padding-right: 12px;
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
		width: 44px;
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
