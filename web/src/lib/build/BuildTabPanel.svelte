<!-- The panel of the tab shown, under the row of the tabs (specs.md, Window layout): the About tab
     (4g); the others empty until their views are built, the Overview and the Tree with the tree
     (5), the Skills tab (4j), the Inventory tab (6). -->
<script lang="ts">
	import AboutTab from '#lib/about/AboutTab.svelte';
	import type { OpenedBuild } from '#lib/core.ts';
	import { shownTab } from '#lib/page/build-tab.svelte.ts';
	import { t } from '#lib/i18n.ts';

	interface Props {
		/** Its id, which the tabs name as what they show. */
		id: string;
		/** The build shown. */
		build: OpenedBuild;
	}

	let { id, build }: Props = $props();
</script>

<section {id} class="panel" aria-label={t(`tab-${shownTab.current}`)}>
	{#if shownTab.current === 'about'}
		<AboutTab {build} />
	{/if}
</section>

<style>
	.panel {
		flex: 1;
	}
</style>
