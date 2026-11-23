<!-- The title of the first visit (specs.md, Window layout): « Weave your path to level 100 », large,
     the game named small over it, rising from behind it as the page loads (the owner, 2026-11-18). -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
</script>

<div class="title">
	<span class="game">{t('first-visit-game')}</span>
	<h1>{t('first-visit-title')}</h1>
</div>

<style>
	.title {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		max-width: 860px;
		margin-bottom: 14px;
		text-align: center;
	}

	/* The game, in the grey of the secondary texts, its letters spaced 0.1 em (the owner,
	   2026-11-23: it was 0.24), rising to its place and fading in; still when the system asks for
	   less motion. */
	.game {
		position: relative;
		z-index: 0;
		color: var(--weak);
		font-family: var(--font-number);
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		animation: rise 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(34px);
			filter: blur(3px);
		}
	}

	/* In sentence case, in Archivo at its normal width, 42 px, its letters drawn close (the owner,
	   2026-11-18, among twelve fonts and four cases). */
	h1 {
		position: relative;
		z-index: 1;
		margin: 0;
		color: var(--text);
		font-family: var(--brand-font);
		font-weight: 800;
		font-size: 42px;
		line-height: 1;
		letter-spacing: -0.06em;
		text-wrap: balance;
	}

	@media (prefers-reduced-motion: reduce) {
		.game {
			animation: none;
		}
	}
</style>
