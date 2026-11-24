<!-- The card of an update in the box of What's next (specs.md, Window layout; 2k6 of the mock-up):
     its portraits at its top, one large or several side by side, fading into the panel, drawn once
     the game data are loaded; then « Version N » small, in capitals and the accent, its name in the
     title font, a line in the weak grey, then what it brings, each line after a small diamond of
     the accent. -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import { pageGameData } from '#lib/page/game-data.svelte.ts';
	import type { Update } from './updates.ts';

	interface Props {
		update: Update;
	}

	let { update }: Props = $props();

	/** The addresses of its portraits, none until the game data are loaded or when one has none. */
	const portraits = $derived.by(() => {
		const state = pageGameData.state;
		if (state.kind !== 'loaded') {
			return [];
		}
		return update.portraits.flatMap((id) => state.gameData.portrait(id, 520) ?? []);
	});
</script>

<article class="card">
	<div class="art" class:is-many={update.portraits.length > 1}>
		{#each portraits as portrait (portrait)}
			<img src={portrait} alt="" />
		{/each}
	</div>
	<div class="body">
		<p class="version">{t('next-version', { version: update.version })}</p>
		<h2 class="name">{t(`${update.messages}-name`)}</h2>
		<p class="line">{t(`${update.messages}-line`)}</p>
		<ul class="items">
			{#each update.items as item (item)}
				<li>{t(item)}</li>
			{/each}
		</ul>
	</div>
</article>

<style>
	.card {
		position: relative;
		flex: none;
		width: 320px;
	}

	/* The portraits fading into the panel from the middle of their height. */
	.art {
		display: flex;
		height: 190px;
		mask-image: linear-gradient(#000 45%, transparent);
	}

	.art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 50% 22%;
	}

	.is-many img {
		width: 25%;
		object-position: 50% 30%;
	}

	/* Its words over the foot of the portraits. */
	.body {
		position: relative;
		margin-top: -36px;
		padding: 0 16px 16px;
	}

	.version {
		margin: 0;
		color: var(--accent);
		font:
			800 11px/1 var(--brand-font),
			sans-serif;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.name {
		margin: 5px 0 2px;
		font-family: var(--font-title);
		font-weight: var(--title-weight);
		font-size: 18px;
		line-height: 1.2;
		letter-spacing: var(--title-spacing);
		text-transform: var(--title-transform);
	}

	.line {
		margin: 0 0 10px;
		color: var(--on-band-weak);
		font-size: 12px;
	}

	.items {
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 12px;
	}

	.items li {
		position: relative;
		padding: 2px 0 2px 14px;
	}

	/* A small diamond of the accent. */
	.items li::before {
		content: '';
		position: absolute;
		left: 1px;
		top: 0.62em;
		width: 5px;
		height: 5px;
		background: var(--accent);
		transform: rotate(45deg);
	}
</style>
