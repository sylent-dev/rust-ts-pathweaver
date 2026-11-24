<!-- The box of What's next (specs.md, Window layout: the band of the site; 2k6 of the mock-up): in
     the middle of the window, over a veil, one panel in the shade of the bands, × at its corner, its
     two cards side by side, a thin grey line between them. A modal dialog of the browser, drawn
     while it is open: the keyboard stays in it, the page under it can't be reached. ×, Esc and a
     click on the veil close it, which `onclose` does. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/icons/Icon.svelte';
	import { t } from '#lib/i18n.ts';
	import UpdateCard from './UpdateCard.svelte';
	import { UPDATES } from './updates.ts';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let dialog: HTMLDialogElement;

	// Over the page from the moment it is drawn, the keyboard on its first button.
	onMount(() => dialog.showModal());

	/** A click on the veil, which the dialog takes: its cards cover the whole panel. */
	function closeOnVeil(event: MouseEvent): void {
		if (event.target === dialog) {
			onclose();
		}
	}
</script>

<!-- The click is the veil's, which a pointer alone reaches: the keyboard has × and Esc. -->
<dialog
	bind:this={dialog}
	class="box"
	aria-label={t('site-whats-next')}
	onclick={closeOnVeil}
	{onclose}
>
	<button type="button" class="close" aria-label={t('next-close')} onclick={onclose}>
		<Icon name="close" size={12} />
	</button>
	<div class="cards">
		{#each UPDATES as update, index (update.version)}
			{#if index > 0}<span class="seam"></span>{/if}
			<UpdateCard {update} />
		{/each}
	</div>
</dialog>

<style>
	/* In the middle of the window, as a modal dialog is. */
	.box {
		overflow: hidden;
		max-width: none;
		padding: 0;
		border: none;
		border-radius: 4px;
		background: var(--band-image), var(--shade-deep);
		box-shadow: var(--dialog-shadow);
		color: var(--on-band);
		font-size: 13px;
		line-height: 1.45;
	}

	.box::backdrop {
		background: var(--veil);
	}

	.close {
		position: absolute;
		z-index: 3;
		top: 8px;
		right: 8px;
		display: flex;
		padding: 5px;
		border: none;
		background: none;
		color: var(--on-band-weak);
		cursor: pointer;
		transition: color var(--hover-fade);
	}

	.close:hover {
		color: var(--on-band);
	}

	.cards {
		position: relative;
		display: flex;
	}

	/* The text at 12 %. */
	.seam {
		flex: none;
		width: 1px;
		background: color-mix(in srgb, var(--on-band) 12%, transparent);
	}
</style>
