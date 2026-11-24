<!-- The panel of the tab shown, under the row of the tabs (specs.md, Window layout): empty until
     the views are built, the Overview and the Tree with the tree (5), the Skills tab (4j), the
     Inventory tab (6), the About tab (4g). -->
<script lang="ts">
	import { shownTab } from '#lib/page/build-tab.svelte.ts';
	import { t } from '#lib/i18n.ts';

	interface Props {
		/** Its id, which the tabs name as what they show. */
		id: string;
	}

	let { id }: Props = $props();
</script>

<section {id} class="panel" aria-label={t(`tab-${shownTab.current}`)}></section>

<style>
	.panel {
		flex: 1;
	}
</style>
