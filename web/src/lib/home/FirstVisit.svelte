<!-- The home page at the first visit (specs.md, Window layout; the owner's E1b, 2026-11-18): on the
     graph paper of the whole window, without the band of the site, the brand floating at its top
     left and Report a bug at its top right; in the middle, the title, then the drop zone with the
     notes of what a build shows around it; the mark of the brand in a watermark behind; the sources
     of the files at the foot. What's next comes with its box (4f), My library would lead here. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Brand from '#lib/brand/Brand.svelte';
	import LogoMark from '#lib/brand/LogoMark.svelte';
	import { t } from '#lib/i18n.ts';
	import SiteLink from '#lib/site/SiteLink.svelte';
	import { REPORT_BUG_URL } from '#lib/site/site-links.ts';
	import FirstVisitTitle from './FirstVisitTitle.svelte';
	import PlanNotes from './PlanNotes.svelte';

	interface Props {
		/** The drop zone, which the notes are drawn around. */
		zone: Snippet;
	}

	let { zone }: Props = $props();
</script>

<main class="first-visit">
	<div class="watermark" aria-hidden="true"><LogoMark pixels={620} /></div>
	<div class="top">
		<Brand markPixels={26} place="first-visit" />
		<nav class="links"><SiteLink href={REPORT_BUG_URL} label={t('site-report-bug')} /></nav>
	</div>
	<div class="middle">
		<FirstVisitTitle />
		<div class="stage">
			{@render zone()}
			<PlanNotes />
		</div>
	</div>
	<p class="foot">{t('first-visit-foot')}</p>
</main>

<style>
	/* The graph paper of the first visit, its own: a tile of 48 px, twice that of the blocks, so that
	   the fluid runs along its main lines (2l, the owner, 2026-11-18). */
	.first-visit {
		--tile: 48px;
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.first-visit::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background: var(--texture-colour);
		opacity: var(--texture-opacity);
		mask-image: var(--texture);
		mask-size: var(--tile) var(--tile);
	}

	/* The mark, large, behind the zone, at 3 % (the owner, 2026-11-18), its P in the text. */
	.watermark {
		position: absolute;
		z-index: -1;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -54%);
		opacity: 3%;
		color: var(--text);
		pointer-events: none;
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
		padding: 0 12px 0 28px;
	}

	.links {
		display: flex;
		height: 44px;
	}

	.middle {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 18px;
		padding: 0 40px 64px;
	}

	.stage {
		position: relative;
	}

	.foot {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 22px;
		margin: 0;
		color: var(--weak);
		font-size: 12.5px;
		text-align: center;
	}
</style>
