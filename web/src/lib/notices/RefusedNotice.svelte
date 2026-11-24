<!-- The notice of the files refused while a build is shown (specs.md, Window layout, The notices;
     2l3 of the mock-up): a band the whole width of the window, in a red shade, without a border nor
     an icon; each file refused on a line, its name in the colour of the text and its reason in the
     red, four at most, from five the first three and « and N more », as the zone of the first visit;
     no title that counts them. On its right, centred on its height, the close button. -->
<script lang="ts">
	import Icon from '#lib/icons/Icon.svelte';
	import { t } from '#lib/i18n.ts';
	import type { RefusedRead } from '#lib/page/opening.svelte.ts';
	import { listedRefusals, refusalReason } from '#lib/page/refusal-text.ts';

	interface Props {
		/** The files refused: one or more. */
		refused: readonly RefusedRead[];
		onclose: () => void;
	}

	let { refused, onclose }: Props = $props();

	const listed = $derived(listedRefusals(refused));
</script>

<div class="notice" role="alert">
	<ul>
		{#each listed.listed as file, index (index)}
			<li>{file.fileName} <span class="reason">{refusalReason(file.refusal)}</span></li>
		{/each}
		{#if listed.more > 0}
			<li class="more">{t('refused-more', { count: listed.more })}</li>
		{/if}
	</ul>
	<button
		type="button"
		class="close"
		aria-label={t('notice-close')}
		title={t('notice-close')}
		onclick={onclose}
	>
		<span class="close-mark"><Icon name="close" size={16} /></span>
	</button>
</div>

<style>
	/* The red of the errors at 14 % over the page; its words 2.5 pixels smaller than the text of the
	   page, none in bold (the owner, 2026-11-18). */
	.notice {
		display: flex;
		align-items: center;
		background: color-mix(in srgb, var(--error) 14%, var(--page));
		font-size: 11.5px;
	}

	/* The words start at the margin of the brand. */
	ul {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 0;
		padding: 13px 16px 13px 14px;
		list-style: none;
	}

	/* One line each, cut by « … » as in the zone of the first visit. */
	li {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.reason {
		color: var(--error);
	}

	.more {
		color: var(--weak);
	}

	/* A square of 44 pixels, its × in the vivid red of the errors, turning white and growing like
	   the + of the band of the open builds on hover, without turning; at once when the system asks
	   for less motion. */
	.close {
		display: grid;
		place-items: center;
		flex: none;
		width: 44px;
		height: 44px;
		padding: 0;
		border: none;
		background: none;
		color: var(--error);
		cursor: pointer;
		transition: color 0.2s;
	}

	.close:hover {
		color: var(--highlight);
	}

	.close-mark {
		display: grid;
		transition: transform 0.2s var(--ease-overshoot);
	}

	.close:hover .close-mark {
		transform: scale(1.3);
	}

	@media (prefers-reduced-motion: reduce) {
		.close,
		.close-mark {
			transition: none;
		}
	}
</style>
