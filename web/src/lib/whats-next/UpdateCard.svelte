<!-- The card of an update in the box of What's next (specs.md, Window layout; 2k6 of the mock-up):
     « Version N » small, in capitals and the accent, its name in the title font, a line in the weak
     grey, then what it brings, each line after a small diamond of the accent. -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import type { Update } from './updates.ts';

	interface Props {
		update: Update;
	}

	let { update }: Props = $props();
</script>

<article class="card">
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

	.body {
		position: relative;
		padding: 16px;
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
