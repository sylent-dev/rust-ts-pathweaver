<!-- The phone page (specs.md, Screens): under 600 pixels, one message in place of every page, on
     the page and its graph paper without its light; the brand at the top, without its band, since
     nothing on this page leads anywhere. -->
<script lang="ts">
	import Brand from '#lib/brand/Brand.svelte';
	import { t } from '#lib/i18n.ts';
</script>

<svelte:head>
	<title>{t('app-name')}</title>
</svelte:head>

<main class="phone graph-paper">
	<div class="top"><Brand markPixels={22} place="phone" /></div>
	<div class="message">
		<!-- The face: the sticky note « ? » of an unknown id, turned, two eyes and a mouth in a
		     slash drawn in its ink (U14, the owner, 2026-11-21). -->
		<svg
			class="note"
			width="92"
			height="92"
			viewBox="0 0 48 48"
			fill="none"
			stroke="currentColor"
			stroke-width="2.2"
			stroke-linecap="round"
			aria-hidden="true"
		>
			<rect class="paper" x="5" y="5" width="38" height="38" stroke="none" />
			<circle cx="18" cy="21" r="1.8" fill="currentColor" stroke="none" />
			<circle cx="30" cy="21" r="1.8" fill="currentColor" stroke="none" />
			<path d="M19 33.5l10-3" />
		</svg>
		<h1>{t('phone-title')}</h1>
		<p>{t('phone-why-computer')}</p>
		<p>{t('phone-why-screen')}</p>
	</div>
</main>

<style>
	.phone {
		display: flex;
		flex-direction: column;
		/* The height of the phone with the bar of its browser shown, so that the message stays in
		   the middle of what is seen. */
		min-height: 100svh;
		background: var(--page);
	}

	.top {
		padding: 20px 24px;
	}

	.message {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 32px 72px;
		text-align: center;
	}

	.note {
		display: block;
		margin-bottom: 28px;
		color: var(--unknown-ink);
		transform: rotate(var(--note-tilt));
		filter: drop-shadow(2px 4px 4px var(--shadow-colour));
	}

	.paper {
		fill: var(--unknown-note);
	}

	h1 {
		margin: 0 0 14px;
		font: 800 26px/1.15 var(--brand-font);
		letter-spacing: -0.03em;
	}

	/* One sentence a line (the owner, 2026-11-21). */
	p {
		margin: 0;
		color: var(--weak);
		font-size: 14px;
		line-height: 1.6;
		white-space: nowrap;
	}
</style>
