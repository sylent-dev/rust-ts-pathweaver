<!-- A link in words, as on the band of the site (specs.md, Window layout): in the colour of the frame
     of the logo, the full height of its row; on hover, its words turn to the colour of the text and
     a line of 2 pixels sweeps under them, never left drawn. Over the first visit for now (Report a
     bug); the band of the site takes it with its links (4f). It leads out of the website, in a new
     tab, so that the builds open stay open. -->
<script lang="ts">
	interface Props {
		href: string;
		label: string;
	}

	let { href, label }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- an address outside the website, which resolve() would put under its path -->
<a class="link" {href} target="_blank" rel="noopener noreferrer"
	><span class="label">{label}</span></a
>

<style>
	.link {
		display: flex;
		align-items: center;
		height: 100%;
		padding: 0 16px;
		color: var(--accent);
		font-family: var(--site-link-font);
		font-weight: var(--site-link-weight);
		font-size: var(--site-link-size);
		text-decoration: none;
		transition: color var(--hover-fade);
	}

	.link:hover {
		color: var(--text);
	}

	.label {
		position: relative;
		line-height: 1;
	}

	.label::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -8px;
		height: 2px;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: 0;
	}

	/* It draws itself from the left, rests a moment and leaves by its other end, in 500 ms (the
	   owner, 2026-11-20); none when the system asks for less motion, the colour alone saying the
	   hover. */
	.link:hover .label::after {
		animation: sweep 500ms both;
	}

	@media (prefers-reduced-motion: reduce) {
		.link:hover .label::after {
			animation: none;
		}
	}

	@keyframes sweep {
		0% {
			transform: scaleX(0);
			transform-origin: 0;
			animation-timing-function: var(--ease-out-soft);
		}
		40% {
			transform: scaleX(1);
			transform-origin: 0;
		}
		60% {
			transform: scaleX(1);
			transform-origin: 100%;
			animation-timing-function: cubic-bezier(0.5, 0, 0.75, 0.3);
		}
		100% {
			transform: scaleX(0);
			transform-origin: 100%;
		}
	}
</style>
