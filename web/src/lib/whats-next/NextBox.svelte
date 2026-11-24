<!-- The box of What's next (specs.md, Window layout: the band of the site; 2k6 of the mock-up): in
     the middle of the window, over a veil, one panel in the shade of the bands, × at its corner, its
     two cards side by side, a thin grey line between them, coming in in 600 ms, the left one
     fading in from 40 pixels above, the right one from 40 pixels below, over a veil that fades in;
     when the system asks for less motion, a plain fade. A modal dialog of the browser, drawn
     while it is open: the keyboard stays in it, the page under it can't be reached. ×, Esc and a
     click on the veil close it, which `onclose` does. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/icons/Icon.svelte';
	import { t } from '#lib/i18n.ts';
	import { pageGameData } from '#lib/page/game-data.svelte.ts';
	import UpdateCard from './UpdateCard.svelte';
	import { UPDATES } from './updates.ts';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let dialog: HTMLDialogElement;

	// Over the page from the moment it is drawn, the keyboard on its first button; the portraits
	// of the cards come with the game data, which a failure leaves out: the page already says it
	// on the page of a build, and the console has its cause.
	onMount(() => {
		dialog.showModal();
		pageGameData.load().catch(() => {});
	});

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
			<div class="entering" class:from-below={index > 0}><UpdateCard {update} /></div>
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
		animation: fade-in 300ms ease-out both;
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

	/* The left card from above, the right one from below, a little after the veil. */
	.entering {
		animation: from-above 600ms cubic-bezier(0.2, 0.8, 0.2, 1) 120ms backwards;
	}

	.from-below {
		animation-name: from-below;
	}

	@media (prefers-reduced-motion: reduce) {
		.box::backdrop,
		.entering {
			animation: fade-in 200ms ease-out both;
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes from-above {
		from {
			opacity: 0;
			transform: translateY(-40px);
		}
	}

	@keyframes from-below {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
	}

	/* The text at 12 %. */
	.seam {
		flex: none;
		width: 1px;
		background: color-mix(in srgb, var(--on-band) 12%, transparent);
	}
</style>
