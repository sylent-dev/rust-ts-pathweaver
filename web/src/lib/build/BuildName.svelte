<!-- The name of a build where the page draws it (its tab, its header, its colophon): in an isolate
     of its direction, so that a name of Hebrew never moves the punctuation drawn around it (the
     third review of 4g4a); « Untitled build » in the weak grey when it shows nothing. Its parent
     sets its font and cuts it. -->
<script lang="ts">
	import { plainName } from './build-name.ts';

	interface Props {
		name: string | undefined;
	}

	let { name }: Props = $props();
</script>

{#if name === undefined}
	<span class="untitled">{plainName(name)}</span>
{:else}
	<bdi>{name}</bdi>
{/if}

<style>
	.untitled {
		color: var(--weak);
	}
</style>
