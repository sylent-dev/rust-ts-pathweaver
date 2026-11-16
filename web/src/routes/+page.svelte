<!-- The first page: a .build file dropped or chosen, read by the core in Rust, and its summary.
     Replaced by the viewer of the passive tree, the skills and the inventory. -->
<script lang="ts">
	import { loadCore, summarizeBuild, type BuildSummary } from '#lib/core.ts';
	import { t } from '#lib/i18n.ts';

	const core = loadCore();

	let summary = $state<BuildSummary>();
	let failure = $state<string>();
	let isDragging = $state(false);

	async function read(file: File | undefined): Promise<void> {
		if (file === undefined) {
			return;
		}
		await core;
		try {
			summary = summarizeBuild(await file.text());
			failure = undefined;
		} catch (error) {
			summary = undefined;
			failure = error instanceof Error ? error.message : String(error);
		}
	}

	function drop(event: DragEvent): void {
		event.preventDefault();
		isDragging = false;
		void read(event.dataTransfer?.files[0]);
	}

	function choose(event: Event & { currentTarget: HTMLInputElement }): void {
		void read(event.currentTarget.files?.[0]);
	}
</script>

<svelte:head>
	<title>{t('app-name')}</title>
</svelte:head>

<main>
	<h1>{t('app-name')}</h1>
	<p>{t('app-tagline')}</p>
	{#await core then { version }}
		<label
			class="drop"
			class:dragging={isDragging}
			ondragover={(event) => {
				event.preventDefault();
				isDragging = true;
			}}
			ondragleave={() => (isDragging = false)}
			ondrop={drop}
		>
			{t('drop-build')}
			<input type="file" accept=".build,application/json" onchange={choose} />
		</label>
		{#if summary}
			<dl>
				<dt>{t('build-name')}</dt>
				<dd>{summary.name}</dd>
				<dt>{t('build-author')}</dt>
				<dd>{summary.author ?? t('build-unknown')}</dd>
				<dt>{t('build-ascendancy')}</dt>
				<dd>{summary.ascendancy ?? t('build-unknown')}</dd>
				<dt>{t('build-contents')}</dt>
				<dd>
					{t('build-counts', {
						passives: summary.passiveCount,
						skills: summary.skillCount,
						slots: summary.inventorySlotCount
					})}
				</dd>
			</dl>
		{/if}
		{#if failure}
			<p role="alert">{t('build-unreadable', { reason: failure })}</p>
		{/if}
		<p class="version">{t('core-version', { version })}</p>
	{:catch}
		<p role="alert">{t('core-load-failed')}</p>
	{/await}
</main>

<style>
	.drop {
		display: block;
		padding: 2rem;
		border: 2px dashed currentColor;
		border-radius: 0.5rem;
		text-align: center;
		cursor: pointer;
	}

	.dragging {
		background: color-mix(in srgb, currentColor 10%, transparent);
	}

	.drop input {
		display: block;
		margin: 1rem auto 0;
	}

	.version {
		opacity: 0.6;
	}
</style>
