<!-- The home page: the first visit, where .build files are dropped or chosen, or the JSON of a
     build pasted, and read by the core in Rust, its zone saying why when none of them opens; once
     one opens, the page of the build shown. -->
<script lang="ts">
	import BuildPage from '#lib/build/BuildPage.svelte';
	import { loadCore } from '#lib/core.ts';
	import DropZone from '#lib/home/DropZone.svelte';
	import FirstVisit from '#lib/home/FirstVisit.svelte';
	import { t } from '#lib/i18n.ts';
	import { carriesFiles } from '#lib/page/file-drop.svelte.ts';
	import { openBuilds } from '#lib/page/open-builds.svelte.ts';
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

{#if openBuilds.shown}
	<BuildPage build={openBuilds.shown} />
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
			<!-- Only here: a build shown was read by the core, loaded by then. -->
			{#await core catch}
				<p role="alert">{t('core-load-failed')}</p>
			{/await}
		{/snippet}
	</FirstVisit>
{/if}
