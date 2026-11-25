<!-- The guide of a build in its colophon (specs.md, The header of a build; 2k3 of the mock-up): one
     link, in the look of « Download .build » without an icon, its site alone in the accent, on one
     line, its end only past what the pane holds, its whole address in its tooltip, opened in a new tab that keeps no hold on the page; « from the
     description », small and grey under it, when the file names none and its description does.
     A `link` that isn't an address shows as text; an address whose site the browser can't read
     too, as a chip of the description does; « none » in the weak grey without a guide. -->
<script lang="ts">
	import type { BuildGuide } from '#lib/core.ts';
	import { t } from '#lib/i18n.ts';
	import { siteOf, strangerLink } from '#lib/markup/site.ts';

	interface Props {
		guide: BuildGuide | undefined;
	}

	let { guide }: Props = $props();
</script>

{#snippet link(address: string)}
	{@const site = siteOf(address, 'guide')}
	{#if site === undefined}
		<span class="text">{address}</span>
	{:else}
		<a class="link" {...strangerLink(address)}>{site}</a>
	{/if}
{/snippet}

<div class="guide">
	{#if guide === undefined}
		<span class="none">{t('about-no-guide')}</span>
	{:else if guide.kind === 'link'}
		{@render link(guide.address)}
	{:else if guide.kind === 'fromDescription'}
		{@render link(guide.address)}
		<span class="from">{t('about-guide-from-description')}</span>
	{:else}
		<bdi class="text">{guide.text}</bdi>
	{/if}
</div>

<style>
	.guide {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 3px;
	}

	/* In the look of « Download .build »: its site in the accent, the colour of the text on hover,
	   never cut across two lines (siteOf keeps what the pane holds). */
	.link {
		color: var(--accent);
		font-size: 13px;
		font-weight: 600;
		line-height: 1.1;
		text-decoration: none;
		white-space: nowrap;
		transition: color var(--hover-fade);
	}

	.link:hover {
		color: var(--text);
	}

	.text {
		overflow-wrap: anywhere;
	}

	.from {
		color: var(--weak);
		font-size: 11px;
		line-height: 1.3;
	}

	.none {
		color: var(--weak);
	}
</style>
