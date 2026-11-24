<!-- An author's text with the markup of the game (specs.md, The author's texts), the pieces the
     core read: each text in its font, its size and its colour, a line break where the author
     wrote one, an address of a description a link that opens in a new tab, its whole address in
     its tooltip. Its texts are written as text, never read as HTML: a file from someone else is
     untrusted. Its sizes are factors of the size of the text around it, which its parent sets;
     the description of the About tab, the notes of the cards on hover (4j, 5c, 6). -->
<script lang="ts" module>
	import type { MarkupColourName, MarkupPiece, MarkupStyle } from '#lib/core.ts';
	import { markupSurface } from './markup-surface.ts';
	import { readableOn } from './readable-colour.ts';

	/** The token of each colour the game names: a name without its token stops the type check. */
	const NAMED_COLOURS: Record<MarkupColourName, string> = {
		white: 'var(--markup-white)',
		grey: 'var(--markup-grey)',
		black: 'var(--markup-black)',
		red: 'var(--markup-red)',
		orange: 'var(--markup-orange)',
		yellow: 'var(--markup-yellow)',
		green: 'var(--markup-green)',
		blue: 'var(--markup-blue)',
		indigo: 'var(--markup-indigo)',
		violet: 'var(--markup-violet)',
		bronze: 'var(--markup-bronze)',
		silver: 'var(--markup-silver)',
		gold: 'var(--markup-gold)',
		unique: 'var(--markup-unique)'
	};

	/**
	 * The colour of a text: a named one by its token, an `rgb` readable on the surface of the
	 * author's texts; none, the colour of the text around it.
	 */
	function colourOf({ colour }: MarkupStyle): string | undefined {
		switch (colour?.kind) {
			case undefined:
				return undefined;
			case 'named':
				return NAMED_COLOURS[colour.name];
			case 'rgb': {
				const surface = markupSurface();
				const { red, green, blue } = surface === undefined ? colour : readableOn(colour, surface);
				return `rgb(${String(red)}, ${String(green)}, ${String(blue)})`;
			}
		}
	}
</script>

<script lang="ts">
	interface Props {
		/** The text, as the core read it. */
		pieces: MarkupPiece[];
	}

	let { pieces }: Props = $props();
</script>

{#snippet styled(text: string, style: MarkupStyle)}<span
		class={[
			style.size,
			{ bold: style.isBold, italic: style.isItalic, underlined: style.isUnderlined }
		]}
		style:color={colourOf(style)}>{text}</span
	>{/snippet}

<!-- eslint-disable svelte/no-navigation-without-resolve -- an address outside the website, which resolve() would put under its path -->
{#snippet link(address: string, style: MarkupStyle)}<a
		class="link"
		href={address}
		target="_blank"
		rel="noopener noreferrer"
		title={address}>{@render styled(address, style)}</a
	>{/snippet}
<!-- eslint-enable svelte/no-navigation-without-resolve -->

<span class="author-text"
	>{#each pieces as piece, index (index)}{#if piece.kind === 'lineBreak'}<br
			/>{:else if piece.kind === 'link'}{@render link(
				piece.address,
				piece.style
			)}{:else}{@render styled(piece.text, piece.style)}{/if}{/each}</span
>

<style>
	/* The fonts of the markup; a text without them in those of the text around it. */
	.bold {
		font-weight: 700;
	}

	.italic {
		font-style: italic;
	}

	.underlined {
		text-decoration: underline;
	}

	/* Each size a factor of the size of the whole text, so that a size inside a size doesn't grow
	   again: the pieces are flat, each a child of the text. */
	.small {
		font-size: calc(var(--markup-small) * 1em);
	}

	.medium {
		font-size: calc(var(--markup-medium) * 1em);
	}

	.large {
		font-size: calc(var(--markup-large) * 1em);
	}

	/* An address of the author in the words, colours and styles of the author, underlined on
	   hover. */
	.link {
		color: inherit;
		text-decoration: none;
	}

	.link:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
