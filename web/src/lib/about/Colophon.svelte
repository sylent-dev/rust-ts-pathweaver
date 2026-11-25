<!-- The colophon of a build, at the left of its About tab (specs.md, Window layout: the About tab;
     2k3 of the mock-up), on a pane as dark as a slot: the portrait of its ascendancy the width of
     the pane from its top, fading toward its foot; over its foot, the name and « by author ·
     ascendancy class »; the levels it covers and its entries, each thing once over every level.
     The guide comes next (4g4b), the file to download with its step (7). -->
<script lang="ts">
	import BuildByline from '#lib/build/BuildByline.svelte';
	import BuildName from '#lib/build/BuildName.svelte';
	import { pageAscendancy } from '#lib/build/named-ascendancy.ts';
	import type { OpenedBuild } from '#lib/core.ts';
	import { t } from '#lib/i18n.ts';
	import { pageGameData } from '#lib/page/game-data.svelte.ts';

	interface Props {
		build: OpenedBuild;
	}

	let { build }: Props = $props();

	// The game data of the page: a failure is written to the console, the ascendancy named by its id.
	pageGameData.load().catch(() => undefined);

	const ascendancy = $derived(pageAscendancy(build.ascendancy, 520));
	const portrait = $derived(ascendancy?.kind === 'known' ? ascendancy.portrait : undefined);
	const levels = $derived(
		build.levels.isSnapshot
			? t('about-snapshot')
			: t('about-level-range', { lowest: build.levels.lowest, highest: build.levels.highest })
	);
	const entries = $derived([
		t('about-passives', { count: build.totals.passives }),
		t('about-skills', { count: build.totals.skills }),
		t('about-supports', { count: build.totals.supports }),
		t('about-items', { count: build.totals.hints })
	]);
</script>

<aside class="colophon">
	{#if portrait !== undefined}
		<img class="portrait" src={portrait} width="260" height="260" alt="" />
	{/if}
	<h2 class="name"><BuildName name={build.name} /></h2>
	<p class="by"><BuildByline author={build.author} {ascendancy} /></p>
	<dl class="facts">
		<dt>{t('about-levels')}</dt>
		<dd>{levels}</dd>
		<dt>{t('about-entries')}</dt>
		<dd>
			{#each entries as entry (entry)}
				<span class="entry">{entry}</span>
			{/each}
		</dd>
	</dl>
</aside>

<style>
	.colophon {
		flex: none;
		width: 260px;
		box-sizing: border-box;
		padding: 24px 24px 28px 32px;
		background: var(--pane);
	}

	/* Across the pane from its top, fading toward the bottom from 40 % of its height to nothing at
	   its foot; the name and the author rise 70 pixels over it (the owner, 2026-11-21, on
	   sliders: too imposing whole). */
	.portrait {
		display: block;
		width: calc(100% + 56px);
		height: auto;
		margin: -24px -24px -54px -32px;
		mask-image: linear-gradient(#000 40%, transparent);
	}

	.name,
	.by {
		position: relative;
	}

	.name {
		margin: 0;
		overflow-wrap: anywhere;
		font-family: var(--font-title);
		font-size: 17px;
		font-weight: var(--title-weight);
		line-height: 1.25;
		letter-spacing: var(--title-spacing);
		text-transform: var(--title-transform);
	}

	.by {
		margin: 2px 0 0;
		overflow-wrap: anywhere;
		font-size: 12.5px;
		--class-colour: var(--weak);
	}

	.facts {
		display: grid;
		grid-template-columns: 58px 1fr;
		gap: 8px 10px;
		margin: 16px 0;
		font-size: 12.5px;
	}

	dt {
		color: var(--on-band-weak);
		font-size: 11px;
	}

	dd {
		margin: 0;
		min-width: 0;
	}

	.entry {
		display: block;
	}
</style>
