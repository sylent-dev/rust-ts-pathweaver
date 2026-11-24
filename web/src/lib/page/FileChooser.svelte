<!-- The choice of files of the system, hidden (specs.md, Opening builds): the .build files chosen
     open as dropped ones do. Shared by what opens it, the drop zone of the first visit and the + of
     the band of the open builds. -->
<script lang="ts">
	import { opening } from './opening.svelte.ts';

	let chooser: HTMLInputElement;

	/** Opens the choice of files of the system. */
	export function open(): void {
		chooser.click();
	}

	function choose(event: Event & { currentTarget: HTMLInputElement }): void {
		const files = [...(event.currentTarget.files ?? [])];
		// Emptied, so that the same file chosen again opens again.
		event.currentTarget.value = '';
		void opening.open(files);
	}
</script>

<input
	bind:this={chooser}
	type="file"
	accept=".build,application/json"
	multiple
	hidden
	onchange={choose}
/>
