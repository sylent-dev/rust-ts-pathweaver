<!-- The page of a build (specs.md, Window layout), from top to bottom: its header; the level band
     (4h) and its tabs come under it. Until their notice (4f3), the files refused with the build
     shown are a line each. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { OpenedBuild } from '#lib/core.ts';
	import { opening } from '#lib/page/opening.svelte.ts';
	import { refusalReason } from '#lib/page/refusal-text.ts';
	import BuildHeader from './BuildHeader.svelte';

	interface Props {
		build: OpenedBuild;
		/** What the page says when the core can't load. */
		coreFailure: Snippet;
	}

	let { build, coreFailure }: Props = $props();
</script>

<main class="build-page">
	<BuildHeader {build} />
	{#each opening.refused as refused, index (index)}
		<p role="alert">{refused.fileName} {refusalReason(refused.refusal)}</p>
	{/each}
	{@render coreFailure()}
</main>
