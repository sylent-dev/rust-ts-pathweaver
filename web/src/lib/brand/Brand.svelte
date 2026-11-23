<!-- The brand: the mark and the name of Pathweaver, in Archivo (specs.md, The brand), as in the
     band of the site, which the phone page copies; larger over the first visit, which has no band. -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import LogoMark from './LogoMark.svelte';

	interface Props {
		/** The side of the mark, in pixels. */
		markPixels: number;
		/** Where it is drawn: the band of the site (the default), or over the first visit. */
		place?: 'band' | 'first-visit';
	}

	let { markPixels, place = 'band' }: Props = $props();
</script>

<span class="brand" class:first-visit={place === 'first-visit'}>
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

	/* On the middle of the mark; the band of the site sets it 1 px lower (--brand-name-offset). */
	.name {
		font-family: var(--brand-font);
		font-weight: var(--brand-weight);
		font-size: var(--brand-size);
		line-height: 1.15;
		letter-spacing: var(--brand-spacing);
		white-space: nowrap;
	}

	/* Over the first visit, the name larger and a little further from the mark (2l, the mock-up). */
	.first-visit {
		gap: 10px;
	}

	.first-visit .name {
		font-size: 22px;
	}
</style>
