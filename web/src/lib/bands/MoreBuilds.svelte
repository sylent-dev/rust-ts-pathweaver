<!-- « +N ▾ » and its menu (specs.md, Window layout; 2e2 of the mock-up): the builds the band has no
     tab for, each a tab laid down, its label in colour, in the shade of the band, 3 pixels under it,
     growing out of « +N ▾ » and going a little past its size before it settles, none when the
     system asks for less motion. Drawn while some builds don't fit: once every tab fits, it leaves
     the page and closes its menu. -->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { OpenedBuild } from '#lib/core.ts';
	import Icon from '#lib/icons/Icon.svelte';
	import { t } from '#lib/i18n.ts';
	import { popup, popupArea } from '#lib/page/popup.svelte.ts';
	import BuildLabel from './BuildLabel.svelte';

	interface Props {
		/** The builds without a tab, in the order of the band. */
		builds: readonly OpenedBuild[];
		/** Shows a build chosen in the menu. */
		onshow: (contentKey: string) => void;
	}

	let { builds, onshow }: Props = $props();

	const isOpen = $derived(popup.isOpen('builds-menu'));

	function show(contentKey: string): void {
		popup.close();
		onshow(contentKey);
	}

	// Its trigger gone, the menu would stay open with nothing to close it from.
	onDestroy(() => {
		if (popup.isOpen('builds-menu')) {
			popup.close();
		}
	});
</script>

<div class="more" {...popupArea('builds-menu')}>
	<button
		type="button"
		class="trigger"
		class:is-open={isOpen}
		aria-expanded={isOpen}
		aria-label={t('builds-more', { count: builds.length })}
		onclick={() => popup.toggle('builds-menu')}
	>
		+{builds.length}<Icon name="down" size={12} />
	</button>
	{#if isOpen}
		<ul class="menu">
			{#each builds as build (build.contentKey)}
				<li>
					<button type="button" class="item" onclick={() => show(build.contentKey)}>
						<BuildLabel {build} />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.more {
		position: relative;
		display: flex;
	}

	/* In the colour of the frame of the logo on the background of the band, the colour of the text
	   on hover and while open, like the links of the band of the site. */
	.trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		min-width: 44px;
		padding: 0 12px;
		border: none;
		background: var(--builds-band);
		color: var(--accent);
		cursor: pointer;
		font-size: 13px;
		transition: color var(--hover-fade);
	}

	.trigger:is(:hover, .is-open) {
		color: var(--on-top-band);
	}

	/* 300 pixels, its corners rounded as the window of what changes, over what is under the band. */
	.menu {
		position: absolute;
		z-index: 5;
		top: calc(100% + var(--popover-gap));
		right: 0;
		width: 300px;
		margin: 0;
		padding: 0;
		list-style: none;
		overflow: hidden;
		border-radius: var(--popover-radius);
		background: var(--top-band-image), var(--builds-band);
		box-shadow: var(--popover-shadow);
		transform-origin: top right;
		animation: reveal-pop 280ms var(--ease-overshoot) both;
	}

	@media (prefers-reduced-motion: reduce) {
		.menu {
			animation: none;
		}
	}

	/* A row of 44 pixels, its label in a weaker text, the colour of the text on hover. */
	.item {
		display: block;
		width: 100%;
		height: 44px;
		padding: 0 12px 0 0;
		border: none;
		background: none;
		color: color-mix(in srgb, var(--on-top-band) 80%, transparent);
		cursor: pointer;
		--label-gap: 10px;
	}

	.item:hover {
		background: color-mix(in srgb, var(--on-top-band) 9%, transparent);
		color: var(--on-top-band);
	}
</style>
