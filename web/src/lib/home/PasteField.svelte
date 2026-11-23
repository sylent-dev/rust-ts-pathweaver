<!-- Paste JSON (specs.md, Window layout): the drop zone become a field, in its place, its size and
     its black, the caret in it, a thin line in the accent around it while the caret is there. A
     paste opens the build at once, without a button: the field takes the paste of the keyboard,
     so the browser asks no permission, as reading the clipboard would. A text refused stays in it,
     its reason in the red at its foot, until the next paste; Esc gives the zone back. -->
<script lang="ts">
	import { t } from '#lib/i18n.ts';
	import { opening } from '#lib/page/opening.svelte.ts';
	import type { FileRefusal } from '#lib/page/read-files.ts';
	import { refusalReason } from '#lib/page/refusal-text.ts';

	interface Props {
		/** Gives the zone back, on Esc. */
		onback: () => void;
	}

	let { onback }: Props = $props();

	const hintId = $props.id();
	let field: HTMLTextAreaElement;
	let text = $state('');
	/** Why the text pasted last is refused. */
	let refusal: FileRefusal | undefined = $state();

	// The caret in the field as it opens, where the paste of the keyboard goes.
	$effect(() => {
		field.focus();
	});

	/**
	 * Puts the text pasted in place of the field's, and opens it. The texts pasted open one after
	 * the other (Opening), so the reason said is that of the last.
	 */
	async function paste(event: ClipboardEvent): Promise<void> {
		event.preventDefault();
		text = event.clipboardData?.getData('text/plain') ?? '';
		refusal = await opening.openText(text);
	}

	function hearKey(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			onback();
		}
	}
</script>

<div class="paste" class:is-refused={refusal !== undefined}>
	<textarea
		bind:this={field}
		bind:value={text}
		placeholder=" "
		spellcheck="false"
		aria-label={t('paste-field')}
		aria-describedby={hintId}
		onpaste={paste}
		onkeydown={hearKey}></textarea>
	<!-- The call, at the centre while the field is empty. -->
	<div class="hint" id={hintId}>
		<strong>{t('paste-title')}</strong>
		<span>{t('paste-call')}</span>
	</div>
	{#if refusal !== undefined}
		<p class="reason" role="alert">{t('paste-refused', { reason: refusalReason(refusal) })}</p>
	{/if}
</div>

<style>
	.paste {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: var(--drop-zone);
		cursor: text;
	}

	.paste:focus-within:not(.is-refused) {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.is-refused {
		box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--error) 70%, transparent);
	}

	textarea {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		padding: 18px 22px;
		border: none;
		background: none;
		color: var(--text);
		font-family: var(--font-code);
		font-size: 12.5px;
		line-height: 1.6;
		resize: none;
		outline: none;
		caret-color: var(--accent);
	}

	/* Its text, scrolled, never under the reason. */
	.is-refused textarea {
		height: calc(100% - 44px);
		color: var(--weak);
	}

	.hint {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		pointer-events: none;
	}

	textarea:not(:placeholder-shown) ~ .hint {
		display: none;
	}

	strong {
		font-size: 22px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	span {
		color: var(--weak);
		font-size: 13.5px;
	}

	/* At the foot of the field, on its black, without a fade (the owner, 2026-11-18). */
	.reason {
		position: absolute;
		left: 22px;
		right: 22px;
		bottom: 16px;
		margin: 0;
		color: var(--error);
		font-size: 14.5px;
		text-align: center;
		pointer-events: none;
	}
</style>
