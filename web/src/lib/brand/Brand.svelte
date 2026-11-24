<!-- The brand: the mark and the name of Pathweaver, in Archivo (specs.md, The brand), in the band
     of the site, its name 1 pixel below the middle of the mark; at the top of the phone page in the
     same size, on the middle; larger over the first visit, which has no band. -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import LogoMark from './LogoMark.svelte';

	interface Props {
		/** The side of the mark, in pixels. */
		markPixels: number;
		/** Where it is drawn: the band of the site, the phone page or over the first visit. */
		place: 'band' | 'phone' | 'first-visit';
	}

	let { markPixels, place }: Props = $props();
</script>

<span class="brand" class:band={place === 'band'} class:first-visit={place === 'first-visit'}>
	<LogoMark pixels={markPixels} />
	<span class="name">{t('app-name')}</span>
</span>

<style>
	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--brand-gap);
		color: var(--text);
	}

	/* On the middle of the mark, but in the band of the site. */
	.name {
		font-family: var(--brand-font);
		font-weight: var(--brand-weight);
		font-size: var(--brand-size);
		line-height: 1.15;
		letter-spacing: var(--brand-spacing);
		white-space: nowrap;
	}

	/* In the band of the site, 1 px below the middle of the mark, by eye (the owner, 2026-11-17). */
	.band .name {
		position: relative;
		top: var(--brand-name-offset);
	}

	/* Over the first visit, the name larger and a little further from the mark (2l, the mock-up). */
	.first-visit {
		gap: 10px;
	}

	.first-visit .name {
		font-size: 22px;
	}
</style>
