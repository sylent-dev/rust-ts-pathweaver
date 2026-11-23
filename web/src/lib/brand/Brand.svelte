<!-- The brand: the mark and the name of Pathweaver, in Archivo (specs.md, The brand), as in the
     band of the site; the phone page and the first visit show it too. -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import LogoMark from './LogoMark.svelte';

	interface Props {
		/** The side of the mark, in pixels. */
		markSize: number;
	}

	let { markSize }: Props = $props();
</script>

<span class="brand">
	<LogoMark size={markSize} />
	<span class="name">{t('app-name')}</span>
</span>

<style>
	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--brand-gap);
		color: var(--text);
	}

	/* 1 px below the middle of the mark, by eye (the owner, 2026-11-17). */
	.name {
		position: relative;
		top: var(--brand-name-offset);
		font-family: var(--brand-font);
		font-weight: var(--brand-weight);
		font-size: var(--brand-size);
		line-height: 1.15;
		letter-spacing: var(--brand-spacing);
		white-space: nowrap;
	}
</style>
