<!-- The drop zone of the first visit (specs.md, Window layout): a click chooses the files, the
     files dropped anywhere on the page open (the layout hears them). Black at 50 % over the page,
     its icon four corners around a +, which close in on it a little on hover and firmly while
     files are over the page, the zone lit then and saying « Let go to open it ». -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import { fileDrop } from '#lib/page/file-drop.svelte.ts';

	let chooser: HTMLInputElement;

	function choose(event: Event & { currentTarget: HTMLInputElement }): void {
		const files = [...(event.currentTarget.files ?? [])];
		// Emptied, so that the same file chosen again opens again.
		event.currentTarget.value = '';
		void fileDrop.open(files);
	}
</script>

<button type="button" class="zone" class:is-over={fileDrop.isOver} onclick={() => chooser.click()}>
	<!-- The corners of a zone around the + of the band of the open builds, their ends cut flat
	     (the owner, 2026-11-18); one corner drawn four times, turned around the centre. -->
	<svg
		class="mark"
		width="56"
		height="56"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.6"
		stroke-linecap="butt"
		stroke-linejoin="miter"
		aria-hidden="true"
	>
		{#each [0, 90, 180, 270] as turn (turn)}
			<g transform="rotate({turn} 12 12)"><path class="corner" d="M1.5 6.5v-5h5" /></g>
		{/each}
		<path d="M12 6v12M6 12h12" />
	</svg>
	{#if fileDrop.isOver}
		<strong>{t('drop-zone-let-go')}</strong>
		{#if fileDrop.fileCount > 0}
			<span>{t('drop-zone-files-over', { count: fileDrop.fileCount })}</span>
		{/if}
	{:else}
		<strong>{t('drop-zone-title')}</strong>
		<span>{t('drop-zone-call')}</span>
	{/if}
</button>
<input
	bind:this={chooser}
	type="file"
	accept=".build,application/json"
	multiple
	hidden
	onchange={choose}
/>

<style>
	/* Without a border, darker than the page, darker still on hover, its corners square (the
	   owner, 2026-11-18); narrower below 960 pixels, so that the notes around it keep at 900 the
	   margin they have at 960. */
	.zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		width: min(560px, calc(100cqi - 400px));
		height: 260px;
		padding: 0;
		border: none;
		border-radius: 0;
		background: var(--drop-zone);
		color: var(--text);
		cursor: pointer;
		transition:
			background-color 0.25s,
			box-shadow 0.3s;
	}

	.zone:hover {
		background: var(--drop-zone-hover);
	}

	.mark {
		color: var(--accent);
	}

	strong {
		font-size: 22px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	span {
		color: var(--weak);
		font-size: 13.5px;
	}

	/* Each corner along its diagonal, in units of the icon (24 a side). */
	.corner {
		transition: transform 0.35s var(--ease-overshoot);
	}

	.zone:hover .corner {
		transform: translate(1.2px, 1.2px);
	}

	.is-over .corner,
	.is-over:hover .corner {
		transform: translate(2.4px, 2.4px);
	}

	.is-over,
	.is-over:hover {
		background: color-mix(in srgb, var(--accent) 16%, var(--page));
		box-shadow:
			0 0 0 8px color-mix(in srgb, var(--accent) 16%, transparent),
			0 0 60px color-mix(in srgb, var(--accent) 45%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.corner {
			transition: none;
		}
	}
</style>
