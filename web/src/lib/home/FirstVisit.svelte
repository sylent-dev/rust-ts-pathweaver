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
	import { fileDrop } from '#lib/page/file-drop.svelte.ts';
	import SiteLink from '#lib/site/SiteLink.svelte';
	import { REPORT_BUG_URL } from '#lib/site/site-links.ts';
	import FirstVisitTitle from './FirstVisitTitle.svelte';
	import PlanNotes from './PlanNotes.svelte';

	interface Props {
		/** The drop zone, which the notes are drawn around. */
		zone: Snippet;
		/** What is said under the zone: the files refused, until the zone says it (4e3). */
		below?: Snippet;
	}

	let { zone, below }: Props = $props();

	/** Where the pointer was last over the page, which the grid is lit around. */
	let pointer = $state({ x: '50%', y: '40%' });

	function follow(event: PointerEvent | DragEvent): void {
		pointer = { x: `${event.clientX}px`, y: `${event.clientY}px` };
	}
</script>

<main
	class="first-visit"
	class:is-over={fileDrop.isOver}
	style:--x={pointer.x}
	style:--y={pointer.y}
	onpointermove={follow}
	ondragover={follow}
>
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
		{@render below?.()}
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

	/* While files are over the page, the whole grid lights up in the accent, from the pointer. */
	.first-visit::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		display: none;
		pointer-events: none;
		background: var(--accent);
		mask-image:
			var(--texture), radial-gradient(circle 1600px at var(--x) var(--y), #000 0%, transparent 100%);
		mask-size:
			var(--tile) var(--tile),
			100% 100%;
		mask-repeat: repeat, no-repeat;
		mask-composite: intersect;
	}

	.is-over::after {
		display: block;
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

	/* The zone grows a little with its notes while files are over the page, so that their lines
	   still reach its edges. */
	.stage {
		position: relative;
		transition: transform 0.3s var(--ease-overshoot);
	}

	.is-over .stage {
		transform: scale(1.03);
	}

	@media (prefers-reduced-motion: reduce) {
		.stage {
			transition: none;
		}
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
