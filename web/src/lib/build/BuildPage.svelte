<!-- The page of a build (specs.md, Window layout), from top to bottom: its header, the level band
     (4h), the row of its tabs and the panel of the one shown. Until their notice (4f3), the files
     refused with the build shown are a line each. -->
<script lang="ts">
	import type { OpenedBuild } from '#lib/core.ts';
	import { opening } from '#lib/page/opening.svelte.ts';
	import { refusalReason } from '#lib/page/refusal-text.ts';
	import BuildHeader from './BuildHeader.svelte';
	import BuildTabPanel from './BuildTabPanel.svelte';
	import BuildTabs from './BuildTabs.svelte';

	interface Props {
		build: OpenedBuild;
	}

	let { build }: Props = $props();
</script>

<main class="build-page">
	<BuildHeader {build} />
	<BuildTabs panelId="build-tab-panel" />
	{#each opening.refused as refused, index (index)}
		<p role="alert">{refused.fileName} {refusalReason(refused.refusal)}</p>
	{/each}
	<BuildTabPanel id="build-tab-panel" />
</main>

<style>
	/* The whole height of the window, the panel of the tab taking what the bands leave. */
	.build-page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
