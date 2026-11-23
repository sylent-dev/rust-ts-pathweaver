<script lang="ts">
	import '#lib/style/fonts.css';
	import '#lib/style/tokens.css';
	import '#lib/style/base.css';
	import { hearClick, hearKey } from '#lib/page/page-events.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:document onkeydown={hearKey} onclick={hearClick} />

<div class="window">
	{@render children()}
</div>

<style>
	/* The window of the application, the container its components ask the width of; from 900
	   pixels, below which the page keeps its width and scrolls sideways (specs.md, Screens). */
	.window {
		container: window / inline-size;
		min-width: 900px;
		min-height: 100vh;
	}
</style>
