<!-- The home page: the first visit, where .build files are dropped or chosen and read by the core
     in Rust; once one opens, what it is, until the page of a build (4f). The files refused are
     said in a line each, until the zone that refuses (4e3) and the notice of the page of a
     build (4f). -->
<script lang="ts">
	import { loadCore } from '#lib/core.ts';
	import DropZone from '#lib/home/DropZone.svelte';
	import FirstVisit from '#lib/home/FirstVisit.svelte';
	import { t } from '#lib/i18n.ts';
	import { fileDrop } from '#lib/page/file-drop.svelte.ts';
	import { openBuilds } from '#lib/page/open-builds.svelte.ts';
	import type { FileRefusal } from '#lib/page/read-files.ts';

	/** Loaded at once, so that the first files dropped don't wait for it. */
	const core = loadCore();

	/** Why a file is refused, in a sentence. */
	function reason(refusal: FileRefusal): string {
		switch (refusal.reason) {
			case 'tooLarge':
				return t('refused-too-large', { bytes: refusal.bytes, limit: refusal.limit });
			case 'notJson':
				return t('refused-not-json', { line: refusal.line, excerpt: refusal.excerpt });
			case 'notABuild':
				return t('refused-not-a-build');
			case 'wrongValue':
				return t('refused-wrong-value', { field: refusal.field });
			case 'missingField':
				return t('refused-missing-field', { field: refusal.field });
			case 'unreadable':
				return t('refused-unreadable');
		}
	}
</script>

<svelte:head>
	<title>{t('app-page-title')}</title>
</svelte:head>

{#snippet refusals()}
	{#each fileDrop.refused as refused, index (index)}
		<p role="alert">
			{t('build-unreadable', { file: refused.fileName, reason: reason(refused.refusal) })}
		</p>
	{/each}
	{#await core catch}
		<p role="alert">{t('core-load-failed')}</p>
	{/await}
{/snippet}

{#if openBuilds.shown}
	{@const build = openBuilds.shown}
	<main class="build">
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
		{@render refusals()}
		{#await core then { version }}
			<p class="version">{t('core-version', { version })}</p>
		{/await}
	</main>
{:else}
	<FirstVisit>
		{#snippet zone()}
			<DropZone />
		{/snippet}
		{#snippet below()}
			{@render refusals()}
		{/snippet}
	</FirstVisit>
{/if}

<style>
	.build {
		padding: 2rem;
	}

	.version {
		opacity: 0.6;
	}
</style>
