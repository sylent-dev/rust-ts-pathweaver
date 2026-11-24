<!-- What names an open build in the band of the open builds, its tab and its row of « +N ▾ »
     (specs.md, Window layout): its portrait square, the full height of its parent, and its name
     over the name of its ascendancy, smaller and weaker, each cut to fit. An ascendancy the game
     data don't know is its id, as the file writes it; a build without one has its square empty and
     its name alone. Its parent sets how it looks: the gap (--label-gap), the filter and the
     opacity of the portrait (--portrait-filter, --portrait-opacity). -->
<script lang="ts">
	import type { OpenedBuild } from '#lib/core.ts';
	import { pageAscendancy } from '#lib/build/named-ascendancy.ts';
	import { pageGameData } from '#lib/page/game-data.svelte.ts';

	interface Props {
		build: OpenedBuild;
	}

	let { build }: Props = $props();

	// The game data of the page: a failure is written to the console, the ascendancy named by its id.
	pageGameData.load().catch(() => undefined);

	const ascendancy = $derived(pageAscendancy(build.ascendancy, 88));
	const portrait = $derived(ascendancy?.kind === 'known' ? ascendancy.portrait : undefined);
	const ascendancyName = $derived(ascendancy?.kind === 'known' ? ascendancy.name : ascendancy?.id);
</script>

<span class="label" title={[build.name, ascendancyName].filter(Boolean).join('\n')}>
	{#if portrait === undefined}
		<span class="portrait"></span>
	{:else}
		<img class="portrait" src={portrait} width="44" height="44" alt="" />
	{/if}
	<span class="text">
		<span class="name">{build.name}</span>
		{#if ascendancyName !== undefined}
			<span class="ascendancy">{ascendancyName}</span>
		{/if}
	</span>
</span>

<style>
	.label {
		display: flex;
		align-items: center;
		gap: var(--label-gap, 8px);
		min-width: 0;
		height: 100%;
	}

	.portrait {
		flex: none;
		display: block;
		height: 100%;
		aspect-ratio: 1;
		background: var(--shade-deep);
		filter: var(--portrait-filter, none);
		opacity: var(--portrait-opacity, 1);
		transition:
			filter var(--hover-fade),
			opacity var(--hover-fade);
	}

	.text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1px;
		text-align: left;
	}

	.text > span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.2;
	}

	.name {
		font-size: 12px;
	}

	.ascendancy {
		font-size: 11px;
		opacity: 0.7;
	}
</style>
