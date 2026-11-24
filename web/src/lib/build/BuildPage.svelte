<!-- The page of a build (specs.md, Window layout), from top to bottom: its header, the level band
     (4h), the row of its tabs and the panel of the one shown. -->
<script lang="ts">
	import type { OpenedBuild } from '#lib/core.ts';
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
	<BuildTabPanel id="build-tab-panel" {build} />
</main>

<style>
	/* What the bands leave of the height of the window, the panel of the tab taking what the
	   header and the row of the tabs leave. */
	.build-page {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>
