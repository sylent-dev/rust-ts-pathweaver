<!-- What's next (specs.md, Window layout: the band of the site): the link in words that opens the
     box of what the next versions bring, in the band of the site and over the first visit; a second
     click on it, ×, Esc or a click outside closes it, the keyboard back on the link. One box at a
     time over the page with the other windows and menus (popup.svelte.ts). -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import { popup, popupArea } from '#lib/page/popup.svelte.ts';
	import SiteLink from '#lib/site/SiteLink.svelte';
	import NextBox from './NextBox.svelte';

	let link: SiteLink | undefined = $state();

	const isOpen = $derived(popup.isOpen('whats-next'));

	/**
	 * Closed, the keyboard goes back to the link, however it was closed: the box took it with
	 * it, and the page would give it to no element.
	 */
	let wasOpen = false;
	$effect(() => {
		if (wasOpen && !isOpen) {
			link?.focus();
		}
		wasOpen = isOpen;
	});
</script>

<!-- The link and its box one area, so that a click in either doesn't close it (page-events.ts). -->
<div class="whats-next" {...popupArea('whats-next')}>
	<SiteLink
		bind:this={link}
		label={t('site-whats-next')}
		isExpanded={isOpen}
		onclick={() => popup.toggle('whats-next')}
	/>
	{#if isOpen}
		<NextBox onclose={() => popup.close()} />
	{/if}
</div>

<style>
	/* The full height of the row of the links it is in. */
	.whats-next {
		display: flex;
		height: 100%;
	}
</style>
