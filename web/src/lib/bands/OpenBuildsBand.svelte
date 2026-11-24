<!-- The band of the open builds (specs.md, Window layout; 2e of the mock-up), under the band of the
     site, while a build is open: their tabs, the full height of the band, side by side, in the order
     of the list. In the shade of the band of the site, a very light shadow under it. -->
<script lang="ts">
	import { tick } from 'svelte';
	import { t } from '#lib/i18n.ts';
	import { openBuilds } from '#lib/page/open-builds.svelte.ts';
	import OpenBuildTab from './OpenBuildTab.svelte';

	/** The tabs drawn, by the key of the content of their build. */
	const tabs: Record<string, OpenBuildTab | null> = {};

	/** Closes a build, the keyboard on the tab of the build shown then, if any (the owner, 2026-11-24). */
	async function close(contentKey: string): Promise<void> {
		openBuilds.close(contentKey);
		await tick();
		const shown = openBuilds.shown;
		if (shown !== undefined) {
			tabs[shown.contentKey]?.focus();
		}
	}
</script>

<nav class="band" aria-label={t('builds-band')}>
	<div class="tabs">
		{#each openBuilds.all as build (build.contentKey)}
			<OpenBuildTab
				bind:this={tabs[build.contentKey]}
				{build}
				isCurrent={build.contentKey === openBuilds.shown?.contentKey}
				onshow={() => openBuilds.show(build.contentKey)}
				onclose={() => void close(build.contentKey)}
			/>
		{/each}
	</div>
</nav>

<style>
	/* 44 pixels, over what is under it, so that its menu hangs over the level band. */
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
</style>
