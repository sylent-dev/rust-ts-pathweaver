<!-- The home page: the first visit, where .build files are dropped or chosen, or the JSON of a
     build pasted, and read by the core in Rust; once one opens, the two bands, the site above the
     open builds, the notice of the files refused between them, and the page of the build shown. -->
<script lang="ts">
	import OpenBuildsBand from '#lib/bands/OpenBuildsBand.svelte';
	import SiteBand from '#lib/bands/SiteBand.svelte';
	import BuildPage from '#lib/build/BuildPage.svelte';
	import { loadCore } from '#lib/core.ts';
	import FirstVisitPage from '#lib/home/FirstVisitPage.svelte';
	import { t } from '#lib/i18n.ts';
	import RefusedNotice from '#lib/notices/RefusedNotice.svelte';
	import { openBuilds } from '#lib/page/open-builds.svelte.ts';
	import { opening } from '#lib/page/opening.svelte.ts';

	/** Loaded at once, so that the first files dropped don't wait for it. */
	const core = loadCore();

	let buildsBand: OpenBuildsBand | undefined = $state();

	/** Closes the notice of the files refused, the keyboard on the tab of the build shown. */
	function closeRefusedNotice(): void {
		opening.dismissRefused();
		void buildsBand?.focusShownTab();
	}
</script>

<svelte:head>
	<title>{t('app-page-title')}</title>
</svelte:head>

{#if openBuilds.shown}
	<div class="build-view">
		<SiteBand />
		<!-- Drawn again for each drop that refuses files, so that a screen reader says it again; under the
		     band of the site, so that a tab always touches the page it shows. -->
		{#if opening.refused.length > 0}
			{#key opening.refused}
				<RefusedNotice refused={opening.refused} onclose={closeRefusedNotice} />
			{/key}
		{/if}
		<OpenBuildsBand bind:this={buildsBand} />
		<BuildPage build={openBuilds.shown} />
	</div>
{:else}
	<FirstVisitPage {core} />
{/if}

<style>
	/* The whole height of the window, the page of the build taking what the bands leave. */
	.build-view {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
