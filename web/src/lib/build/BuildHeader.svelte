<!-- The header of a build (specs.md, Window layout: the page of a build; 2f of the mock-up): its
     portrait on the left, square, the full height of the header, as in the tabs of the band above;
     its name; « by author · ascendancy class », the class in a darker grey. An ascendancy the game
     data don't know is its id, as the file writes it; a build without one has its square empty,
     since a .build file names no class. The warnings (4i) and the file to download (7) come on its
     right. -->
<script lang="ts">
	import type { OpenedBuild } from '#lib/core.ts';
	import { t } from '#lib/i18n.ts';
	import { pageGameData } from '#lib/page/game-data.svelte.ts';
	import { pageAscendancy } from './named-ascendancy.ts';

	interface Props {
		build: OpenedBuild;
	}

	let { build }: Props = $props();

	/** What parts the author from the ascendancy, written here until French (docs/backlog.md). */
	const SEPARATOR = ' · ';

	// The game data of the page: a failure is written to the console, the ascendancy named by its id.
	pageGameData.load().catch(() => undefined);

	const ascendancy = $derived(pageAscendancy(build.ascendancy, 88));
	const portrait = $derived(ascendancy?.kind === 'known' ? ascendancy.portrait : undefined);
</script>

<header class="header graph-paper">
	{#if portrait === undefined}
		<span class="portrait"></span>
	{:else}
		<img class="portrait" src={portrait} width="66" height="66" alt="" />
	{/if}
	<div class="text">
		<h1 class="name">{build.name}</h1>
		<p class="by">
			{#if build.author !== undefined}
				{t('build-by', { author: build.author })}{#if ascendancy !== undefined}{SEPARATOR}{/if}
			{/if}
			{#if ascendancy?.kind === 'known'}
				{ascendancy.name} <span class="class">{ascendancy.characterClass}</span>
			{:else if ascendancy?.kind === 'unknown'}
				{ascendancy.id}
			{/if}
		</p>
	</div>
</header>

<style>
	/* 66 pixels, on the graph paper of the page. */
	.header {
		display: flex;
		align-items: center;
		gap: 14px;
		height: 66px;
		padding: 0 16px 0 0;
		border-bottom: var(--border-width) solid var(--divider);
	}

	/* Square, the full height of the header; the place kept when it has no portrait. */
	.portrait {
		flex: none;
		display: block;
		height: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		background: var(--shade-deep);
	}

	.text {
		flex: 1;
		min-width: 0;
	}

	.name {
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: var(--font-title);
		font-size: var(--title-size);
		font-weight: var(--title-weight);
		line-height: 1.25;
		letter-spacing: var(--title-spacing);
		text-transform: var(--title-transform);
	}

	.by {
		margin: 2px 0 0;
		min-height: 1lh;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--weak);
		font-size: 13px;
	}

	/* The class, a grey a little darker than the rest of the line: the weak grey over the page. */
	.class {
		color: color-mix(in srgb, var(--weak) 70%, var(--page));
	}
</style>
