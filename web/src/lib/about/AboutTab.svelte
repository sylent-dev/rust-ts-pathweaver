<!-- The About tab of a build (specs.md, Window layout: the About tab; 2k3 of the mock-up), as high
     as the Overview, scrolling inside, on the graph paper of the blocks: the colophon at the left
     on a pane as dark as a slot (Colophon.svelte), the description at the right at the width of
     a page of text, behind it the mark of a note of the author as a watermark. The warnings (4i),
     the file to download and where the game reads the builds (7) come with their steps. -->
<script lang="ts">
	import type { OpenedBuild } from '#lib/core.ts';
	import { t } from '#lib/i18n.ts';
	import Icon from '#lib/icons/Icon.svelte';
	import AuthorText from '#lib/markup/AuthorText.svelte';
	import Colophon from './Colophon.svelte';

	interface Props {
		build: OpenedBuild;
	}

	let { build }: Props = $props();
</script>

<div class="about-tab">
	<div class="about graph-paper">
		<Colophon {build} />
		<div class="main">
			<span class="watermark"><Icon name="note" size={240} /></span>
			{#if build.description === undefined}
				<p class="none">{t('about-no-description')}</p>
			{:else}
				<div class="description"><AuthorText text={build.description} /></div>
			{/if}
		</div>
	</div>
</div>

<style>
	.about-tab {
		height: var(--build-tab-height);
		overflow-y: auto;
		box-sizing: border-box;
		background: var(--side-column);
		scrollbar-width: thin;
	}

	.about {
		display: flex;
		box-sizing: border-box;
		min-height: 100%;
		font-size: 13px;
		line-height: 1.5;
	}

	.main {
		position: relative;
		isolation: isolate;
		flex: 1;
		max-width: 600px;
		padding: 24px 32px 28px;
	}

	/* The mark of a note, filled, 240 pixels, in the middle of the part, behind the words, at 3 %
	   (2k3b, the owner, 2026-11-21, on a slider; its outline set aside). */
	.watermark {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: -1;
		display: flex;
		translate: -50% -50%;
		color: var(--text);
		opacity: 0.03;
		pointer-events: none;
	}

	/* The author's words, colours and styles; a long address breaks where it must. */
	.description {
		font-size: 13.5px;
		line-height: 1.6;
		overflow-wrap: anywhere;
	}

	.none {
		margin: 0;
		color: var(--weak);
		font-size: 12.5px;
	}

	/* A wide window (2k4, from 1,600 pixels): the description a little wider. */
	@container window (min-width: 1600px) {
		.main {
			max-width: 680px;
		}
	}
</style>
