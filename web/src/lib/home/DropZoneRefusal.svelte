<!-- What the drop zone of the first visit says when no file of a drop opens (specs.md, Window
     layout): what went wrong, then the file and its reason in the red, or a line each of several
     files, four at most, from five the first three and « and N more ». -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import type { RefusedRead } from '#lib/page/opening.svelte.ts';
	import { listedRefusals, refusalReason, refusalTitle } from '#lib/page/refusal-text.ts';

	interface Props {
		/** The files of the drop, all refused: one or more. */
		refused: readonly RefusedRead[];
	}

	let { refused }: Props = $props();

	const listed = $derived(listedRefusals(refused));

	const title = $derived(refusalTitle(refused));
</script>

<div class="refusal" class:is-list={refused.length > 1}>
	<strong>{title}</strong>
	{#if refused.length > 1}
		<ul>
			{#each listed.listed as file, index (index)}
				<!-- Cut by « … » at the width of the zone. -->
				<li>
					<span class="file">{file.fileName}</span>
					<span class="reason">{refusalReason(file.refusal)}</span>
				</li>
			{/each}
			{#if listed.more > 0}
				<li class="more">{t('refused-more', { count: listed.more })}</li>
			{/if}
		</ul>
	{:else if refused[0]}
		<p>
			<span class="file">{refused[0].fileName}</span>
			<span class="reason">{refusalReason(refused[0].refusal)}</span>
		</p>
	{/if}
</div>

<style>
	/* The message alone at the centre of the zone, the title in the text, the reason in the red. */
	.refusal {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		max-width: 100%;
		text-align: center;
	}

	strong {
		font-size: 22px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	p {
		margin: 0;
		font-size: 14.5px;
	}

	.file {
		color: var(--text);
	}

	.reason {
		color: var(--error);
	}

	/* Several files: the title, then a line each, left aligned. */
	.is-list {
		width: 100%;
		align-items: stretch;
		gap: 12px;
		text-align: left;
	}

	.is-list strong {
		text-align: center;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 13.5px;
	}

	/* One line each, so that four always fit. */
	li {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.more {
		color: var(--weak);
	}
</style>
