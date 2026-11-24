<!-- The page of the first visit, while no build is open: its drop zone, which turns into the
     field of Paste JSON and back. Whether it is the field belongs to this page alone, so that the
     page given back once every build is closed shows the zone again, never the field a build was
     pasted in. -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import { carriesFiles } from '#lib/page/file-drop.svelte.ts';
	import SiteLink from '#lib/site/SiteLink.svelte';
	import DropZone from './DropZone.svelte';
	import FirstVisit from './FirstVisit.svelte';

	interface Props {
		/** The core, loading: the page says when it can't load. */
		core: Promise<void>;
	}

	let { core }: Props = $props();

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
