<script lang="ts">
	import '#lib/style/fonts.css';
	import '#lib/style/tokens.css';
	import '#lib/style/base.css';
	import { MediaQuery } from 'svelte/reactivity';
	import { fileDrop } from '#lib/page/file-drop.svelte.ts';
	import { hearClick, hearKey } from '#lib/page/page-events.ts';
	import PhonePage from '#lib/phone/PhonePage.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	/**
	 * A phone (specs.md, Screens): one message replaces every page. Written without the range
	 * syntax (`width < 600px`), which Safari reads from iOS 16.4 only.
	 */
	const isPhone = new MediaQuery('not (min-width: 600px)');
</script>

<svelte:document onkeydown={hearKey} onclick={hearClick} />
<!-- Files dropped anywhere, on any page, open (specs.md, Opening builds). -->
<svelte:window
	ondragenter={(event) => fileDrop.enter(event)}
	ondragover={(event) => fileDrop.over(event)}
	ondragleave={(event) => fileDrop.leave(event)}
	ondrop={(event) => fileDrop.drop(event)}
/>

{#if isPhone.current}
	<PhonePage />
{:else}
	<div class="window">
		{@render children()}
	</div>
{/if}

<style>
	/* The window of the application, the container its components ask the width of
	   (@container window), never the class of a page; from 900 pixels, below which the page keeps
	   its width and scrolls sideways (specs.md, Screens). The light of the page from its top left,
	   drawn here rather than on the body, so that it spans the page and not the browser. */
	.window {
		container: window / inline-size;
		min-width: 900px;
		min-height: 100vh;
		background: var(--page-image), var(--page);
		background-size: var(--page-image-size);
	}
</style>
