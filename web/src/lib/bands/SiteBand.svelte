<!-- The band of the site (specs.md, Window layout; 2e2 of the mock-up), at the top of every page
     but the first visit: the brand on the left, on the right its links in words, the full height of
     the band, their words turning to the colour of the text of the band on hover. On the graph paper
     of the blocks, without a shadow. The brand leads nowhere yet, nor is there My library: both
     lead to the library (8). -->
<script lang="ts">
	import Brand from '#lib/brand/Brand.svelte';
	import { t } from '#lib/i18n.ts';
	import { REPORT_BUG_URL } from '#lib/site/site-links.ts';
	import SiteLink from '#lib/site/SiteLink.svelte';
</script>

<header class="band graph-paper">
	<Brand markPixels={24} place="band" />
	<nav class="links" aria-label={t('site-band')}>
		<SiteLink href={REPORT_BUG_URL} label={t('site-report-bug')} />
	</nav>
</header>

<style>
	/* 44 pixels, over the band of the open builds and what is under it. */
	.band {
		--site-link-hover: var(--on-top-band);
		position: relative;
		z-index: 7;
		display: flex;
		align-items: center;
		height: 44px;
		padding-left: 14px;
		background: var(--top-band-image), var(--site-band);
		color: var(--on-top-band);
	}

	.links {
		display: flex;
		height: 100%;
		margin-left: auto;
	}
</style>
