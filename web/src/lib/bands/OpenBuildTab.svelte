<!-- The tab of an open build in the band of the open builds (specs.md, Window layout; 2e of the
     mock-up): its label the full height of the band, a button that shows the build, then its close
     button, always shown. No box: the one shown in the full colour of the text and the only portrait
     in colour, the others in a weaker text, their portraits grey and dimmed, less on hover. A plain
     button marked current, as the tabs of the page: ← and → stay the level's (the owner,
     2026-11-19). -->
<script lang="ts">
	import type { OpenedBuild } from '#lib/core.ts';
	import { plainName } from '#lib/build/build-name.ts';
	import Icon from '#lib/icons/Icon.svelte';
	import { t } from '#lib/i18n.ts';
	import BuildLabel from './BuildLabel.svelte';

	interface Props {
		build: OpenedBuild;
		/** Whether it is the build shown. */
		isCurrent: boolean;
		onshow: () => void;
		onclose: () => void;
	}

	let { build, isCurrent, onshow, onclose }: Props = $props();
</script>

<div class="tab" class:is-current={isCurrent}>
	<button type="button" class="show" aria-current={isCurrent} onclick={onshow}>
		<BuildLabel {build} />
	</button>
	<button
		type="button"
		class="close"
		aria-label={t('builds-close', { name: plainName(build.name) })}
		onclick={onclose}
	>
		<Icon name="close" size={12} />
	</button>
</div>

<style>
	/* The full height of the band, its width the band's to set (--tab-width, band-layout.ts),
	   square corners. */
	.tab {
		display: flex;
		align-items: center;
		gap: 8px;
		width: var(--tab-width);
		box-sizing: border-box;
		padding-right: 6px;
		color: color-mix(in srgb, var(--on-top-band) 68%, transparent);
		transition:
			color var(--hover-fade),
			background-color var(--hover-fade);
		--portrait-filter: grayscale(1) brightness(0.8);
		--portrait-opacity: 0.55;
	}

	.tab:hover {
		background: color-mix(in srgb, var(--on-top-band) 7%, transparent);
		color: var(--on-top-band);
		--portrait-filter: grayscale(0.3);
		--portrait-opacity: 0.9;
	}

	.tab.is-current {
		color: var(--on-top-band);
		--portrait-filter: none;
		--portrait-opacity: 1;
	}

	.show {
		flex: 1;
		min-width: 0;
		height: 100%;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
	}

	.close {
		display: grid;
		place-items: center;
		flex: none;
		width: 20px;
		height: 20px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: none;
		opacity: 0.6;
		cursor: pointer;
	}

	.close:is(:hover, :focus-visible) {
		opacity: 1;
		background: color-mix(in srgb, currentColor 16%, transparent);
	}
</style>
