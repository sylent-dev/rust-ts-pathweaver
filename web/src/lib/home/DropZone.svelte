<!-- The drop zone of the first visit (specs.md, Window layout): a click chooses the files, the
     files dropped anywhere on the page open (the layout hears them). Black at 50 % over the page,
     its icon four corners around a +, which close in on it a little on hover and firmly while
     files are over the page, the zone lit then and saying « Let go to open it ». When no file of
     a drop opens, it says why, without its icon, a thin line in the red around it, its call at
     its foot, until the next files. -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import { fileDrop } from '#lib/page/file-drop.svelte.ts';
	import { opening } from '#lib/page/opening.svelte.ts';
	import DropZoneRefusal from './DropZoneRefusal.svelte';

	let chooser: HTMLInputElement;

	/** What the line under the title says: the call, or how many files are over the page. */
	const call = $derived.by(() => {
		if (!fileDrop.isOver) {
			return t('drop-zone-call');
		}
		return fileDrop.fileCount > 0 ? t('drop-zone-files-over', { count: fileDrop.fileCount }) : '';
	});

	/** Whether the zone says why the files of the last drop were refused: not while files are over. */
	const isRefusing = $derived(opening.refusedAll.length > 0 && !fileDrop.isOver);

	function choose(event: Event & { currentTarget: HTMLInputElement }): void {
		const files = [...(event.currentTarget.files ?? [])];
		// Emptied, so that the same file chosen again opens again.
		event.currentTarget.value = '';
		void opening.open(files);
	}
</script>

<div class="zone">
	<button
		type="button"
		class="call"
		class:is-over={fileDrop.isOver}
		class:is-refusing={isRefusing}
		onclick={() => chooser.click()}
	>
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
		<!-- The same elements, their words changed in place: an element taken away under the files
	     would be left unheard, its dragleave never reaching the page (file-drop.svelte.ts). -->
		<strong>{t(fileDrop.isOver ? 'drop-zone-let-go' : 'drop-zone-title')}</strong>
		<span hidden={call === ''}>{call}</span>
	</button>
	<!-- Over the button, which it lets the clicks and the files through to, faded while files are
     over the page; drawn again for each drop refused, so that a screen reader says it again. -->
	{#if opening.refusedAll.length > 0}
		{#key opening.refusedAll}
			<div class="reasons" class:is-faded={fileDrop.isOver} role="alert">
				<DropZoneRefusal refused={opening.refusedAll} />
			</div>
		{/key}
	{/if}
</div>
<input
	bind:this={chooser}
	type="file"
	accept=".build,application/json"
	multiple
	hidden
	onchange={choose}
/>

<style>
	/* Narrower below 960 pixels, so that the notes around it keep at 900 the margin they have at
	   960. */
	.zone {
		position: relative;
		width: min(560px, calc(100cqi - 400px));
		height: 260px;
	}

	/* The button the whole zone: without a border, darker than the page, darker still on hover,
	   its corners square (the owner, 2026-11-18). */
	.call {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		width: 100%;
		height: 100%;
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

	.call:hover {
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

	.call:hover .corner {
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

	/* Refusing: the icon and the title give way to the reasons, the call goes to the foot. */
	.is-refusing {
		box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--error) 70%, transparent);
	}

	.is-refusing .mark,
	.is-refusing strong {
		display: none;
	}

	.is-refusing span {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 22px;
	}

	/* The reasons at the centre of the zone, above its call. */
	.reasons {
		position: absolute;
		inset: 0 28px 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		transition: opacity 0.2s;
	}

	.is-faded {
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.corner,
		.reasons {
			transition: none;
		}
	}
</style>
