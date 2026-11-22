<script lang="ts">
	import { hearClick, hearKey } from '#lib/page/page-events.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:document onkeydown={hearKey} onclick={hearClick} />

{@render children()}
