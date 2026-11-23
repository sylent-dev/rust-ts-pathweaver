<!-- The home page: the first visit, where .build files are dropped or chosen, or the JSON of a
     build pasted, and read by the core in Rust, its zone saying why when none of them opens; once one opens, what it is, until the
     page of a build (4f), the files refused with it in a line each, until its notice (4f). -->
<script lang="ts">
	import { loadCore } from '#lib/core.ts';
	import DropZone from '#lib/home/DropZone.svelte';
	import FirstVisit from '#lib/home/FirstVisit.svelte';
	import { t } from '#lib/i18n.ts';
	import { carriesFiles } from '#lib/page/file-drop.svelte.ts';
	import { opening } from '#lib/page/opening.svelte.ts';
	import { openBuilds } from '#lib/page/open-builds.svelte.ts';
	import { refusalReason } from '#lib/page/refusal-text.ts';
	import SiteLink from '#lib/site/SiteLink.svelte';

	/** Loaded at once, so that the first files dropped don't wait for it. */
	const core = loadCore();

	/** Whether the drop zone is the field of Paste JSON. */
	let isPasting = $state(false);
	let pasteSwitch: SiteLink | undefined = $state();

	/** Gives the zone back, the keyboard on the link that turns it into the field again. */
	function backToFiles(): void {
		isPasting = false;
		pasteSwitch?.focus();
	}

	/** Files dropped give the zone back, which says why when none of them opens. */
	function hearDrop(event: DragEvent): void {
		if (carriesFiles(event)) {
			isPasting = false;
		}
	}
</script>

<svelte:window ondrop={hearDrop} />

<svelte:head>
	<title>{t('app-page-title')}</title>
</svelte:head>

{#snippet coreFailure()}
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
		{#each opening.refused as refused, index (index)}
			<p role="alert">{refused.fileName} {refusalReason(refused.refusal)}</p>
		{/each}
		{@render coreFailure()}
		{#await core then { version }}
			<p class="version">{t('core-version', { version })}</p>
		{/await}
	</main>
{:else}
	<FirstVisit>
		{#snippet zone()}
			<DropZone {isPasting} onback={backToFiles} />
		{/snippet}
		{#snippet below()}
			<SiteLink
				bind:this={pasteSwitch}
				size="compact"
				label={t(isPasting ? 'paste-back' : 'paste-json')}
				onclick={() => (isPasting ? backToFiles() : (isPasting = true))}
			/>
			{@render coreFailure()}
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
