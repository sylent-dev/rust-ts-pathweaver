<!-- The home page: the first visit, where .build files are dropped or chosen, or the JSON of a
     build pasted, and read by the core in Rust; once one opens, the band of the open builds and
     the page of the build shown. -->
<script lang="ts">
	import OpenBuildsBand from '#lib/bands/OpenBuildsBand.svelte';
	import BuildPage from '#lib/build/BuildPage.svelte';
	import { loadCore } from '#lib/core.ts';
	import FirstVisitPage from '#lib/home/FirstVisitPage.svelte';
	import { t } from '#lib/i18n.ts';
	import { openBuilds } from '#lib/page/open-builds.svelte.ts';

	/** Loaded at once, so that the first files dropped don't wait for it. */
	const core = loadCore();
</script>

<svelte:head>
	<title>{t('app-page-title')}</title>
</svelte:head>

{#if openBuilds.shown}
	<div class="build-view">
		<OpenBuildsBand />
		<BuildPage build={openBuilds.shown} />
	</div>
{:else}
	<FirstVisitPage {core} />
{/if}

<style>
	/* The whole height of the window, the page of the build taking what the band leaves. */
	.build-view {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
