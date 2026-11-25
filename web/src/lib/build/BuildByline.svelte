<!-- « by author · ascendancy class » under the name of a build, in its header and its colophon
     (specs.md, Window layout): the author and an ascendancy the game data don't know, both
     written by a stranger, each in an isolate of its direction; « by » without an author, and
     « · » without both, left out. Its parent sets the colour of the class (--class-colour, the
     colour of the line). -->
<script lang="ts">
	import { tAround } from '#lib/i18n.ts';
	import type { NamedAscendancy } from './named-ascendancy.ts';

	interface Props {
		author: string | undefined;
		ascendancy: NamedAscendancy | undefined;
	}

	let { author, ascendancy }: Props = $props();

	/** What parts the author from the ascendancy, written here until French (docs/backlog.md). */
	const SEPARATOR = ' · ';

	const by = tAround('build-by', 'author');
</script>

{#if author !== undefined}
	{by.before}<bdi>{author}</bdi>{by.after}{#if ascendancy !== undefined}{SEPARATOR}{/if}
{/if}
{#if ascendancy?.kind === 'known'}
	{ascendancy.name} <span class="class">{ascendancy.characterClass}</span>
{:else if ascendancy?.kind === 'unknown'}
	<bdi>{ascendancy.id}</bdi>
{/if}

<style>
	.class {
		color: var(--class-colour, inherit);
	}
</style>
