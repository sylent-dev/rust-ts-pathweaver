<!-- The first page: a .build file dropped or chosen, read by the core in Rust, and what it is.
     Replaced by the viewer of the passive tree, the skills and the inventory. -->
<script lang="ts">
	import { loadCore, readBuildFile, type BuildFile, type RefusedFile } from '#lib/core.ts';
	import { t } from '#lib/i18n.ts';

	const core = loadCore();

	let opened = $state<BuildFile>();
	let isDragging = $state(false);

	async function read(file: File | undefined): Promise<void> {
		if (file === undefined) {
			return;
		}
		await core;
		opened = readBuildFile(await file.text());
	}

	/** Why a file is refused, in a sentence. */
	function reason(error: RefusedFile): string {
		switch (error.reason) {
			case 'tooLarge':
				return t('refused-too-large', { bytes: error.bytes, limit: error.limit });
			case 'notJson':
				return t('refused-not-json', { line: error.line, excerpt: error.excerpt });
			case 'notABuild':
				return t('refused-not-a-build');
			case 'wrongValue':
				return t('refused-wrong-value', { field: error.field });
			case 'missingField':
				return t('refused-missing-field', { field: error.field });
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
		{#if opened?.kind === 'build'}
			{@const build = opened.build}
			<dl>
				<dt>{t('build-name')}</dt>
				<dd>{build.name}</dd>
				<dt>{t('build-author')}</dt>
				<dd>{build.author ?? t('build-unknown')}</dd>
				<dt>{t('build-ascendancy')}</dt>
				<dd>{build.ascendancy ?? t('build-unknown')}</dd>
				<dt>{t('build-link')}</dt>
				<dd>{build.link ?? t('build-unknown')}</dd>
			</dl>
		{:else if opened?.kind === 'refused'}
			<p role="alert">{t('build-unreadable', { reason: reason(opened.error) })}</p>
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
