<script lang="ts">
	import '#lib/style/fonts.css';
	import '#lib/style/tokens.css';
	import '#lib/style/base.css';
	import { MediaQuery } from 'svelte/reactivity';
	import { hearClick, hearKey } from '#lib/page/page-events.ts';
	import PhonePage from '#lib/phone/PhonePage.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	/** A phone (specs.md, Screens): one message replaces every page. */
	const isPhone = new MediaQuery('width < 600px');
</script>

<svelte:document onkeydown={hearKey} onclick={hearClick} />

{#if isPhone.current}
	<PhonePage />
{:else}
	<div class="window">
		{@render children()}
	</div>
{/if}

<style>
	/* The window of the application, the container its components ask the width of; from 900
	   pixels, below which the page keeps its width and scrolls sideways (specs.md, Screens). */
	.window {
		container: window / inline-size;
		min-width: 900px;
		min-height: 100vh;
	}
</style>
