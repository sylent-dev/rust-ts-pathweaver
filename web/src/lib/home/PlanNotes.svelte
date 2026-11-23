<!-- What a build shows, around the drop zone of the first visit (specs.md, Window layout): the
     passive tree, the skills and the gear, as the notes of a plan, their lines drawn to the zone,
     their dots beating. In white, never in the accent, which marks what can be clicked (the owner,
     2026-11-18). Laid over the stage of the zone, whose edges their lines reach. -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';

	/** The notes, the first on the left of the zone, the two others on its right. */
	const NOTES = ['first-visit-shows-tree', 'first-visit-shows-skills', 'first-visit-shows-gear'];
</script>

<ul class="notes">
	{#each NOTES as id, index (id)}
		<li class="note note-{index + 1}" style:--note={index}>
			<b>{t(id)}</b><i aria-hidden="true"></i>
		</li>
	{/each}
</ul>

<style>
	.notes {
		position: absolute;
		inset: 0;
		margin: 0;
		padding: 0;
		list-style: none;
		pointer-events: none;
	}

	.note {
		position: absolute;
		display: flex;
		align-items: center;
	}

	b {
		color: var(--text);
		font-family: var(--font-number);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		white-space: nowrap;
		animation: note-in 0.4s ease-out calc(0.4s + var(--note) * 0.35s) both;
	}

	/* The line, drawn from the zone outward, then its dot beating. */
	i {
		position: relative;
		width: 34px;
		height: 1px;
		margin: 0 0 0 10px;
		background: color-mix(in srgb, var(--text) 55%, transparent);
		transform-origin: right;
		animation: note-line 0.5s var(--ease-out-soft) calc(0.2s + var(--note) * 0.35s) both;
	}

	i::after {
		content: '';
		position: absolute;
		right: -3px;
		top: -3px;
		width: 7px;
		height: 7px;
		background: var(--text);
		animation: note-dot 1.667s ease-in-out infinite;
	}

	.note-1 {
		right: 100%;
		top: 26%;
	}

	.note-2,
	.note-3 {
		left: 100%;
		flex-direction: row-reverse;
	}

	.note-2 {
		top: 26%;
	}

	.note-3 {
		top: 70%;
	}

	.note-2 i,
	.note-3 i {
		margin: 0 10px 0 0;
		transform-origin: left;
	}

	.note-2 i::after,
	.note-3 i::after {
		right: auto;
		left: -3px;
	}

	@keyframes note-line {
		from {
			transform: scaleX(0);
		}
	}

	@keyframes note-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	@keyframes note-dot {
		50% {
			box-shadow: 0 0 0 4px color-mix(in srgb, var(--text) 20%, transparent);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		b,
		i,
		i::after {
			animation: none;
		}
	}
</style>
