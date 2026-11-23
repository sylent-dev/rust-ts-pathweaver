// The fluid of the graph paper in a real browser (specs.md, Window layout): its canvas comes and
// goes with the wish of the system for less motion, which can change during the visit.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GridFluid from './GridFluid.svelte';

/** A wish for less motion the test sets, as the system would during the visit. */
class LessMotion extends EventTarget {
	matches = false;
	readonly media = '(prefers-reduced-motion: reduce)';

	/** The system turns the wish on or off. */
	turn(on: boolean): void {
		this.matches = on;
		this.dispatchEvent(new Event('change'));
	}
}

let shown: ReturnType<typeof mount> | undefined;

afterEach(() => {
	if (shown !== undefined) {
		void unmount(shown);
		shown = undefined;
	}
	vi.restoreAllMocks();
});

describe('the fluid', () => {
	it('takes its canvas away when the system asks for less motion during the visit', () => {
		const lessMotion = new LessMotion();
		vi.spyOn(window, 'matchMedia').mockReturnValue(lessMotion as unknown as MediaQueryList);
		const host = document.createElement('div');
		host.style.cssText = 'position: relative; width: 480px; height: 480px; --tile: 48px';
		document.body.append(host);
		shown = mount(GridFluid, { target: host });
		flushSync();
		expect(host.querySelector('canvas')).not.toBeNull();

		lessMotion.turn(true);
		flushSync();

		expect(host.querySelector('canvas')).toBeNull();
		host.remove();
	});

	it('says in the console when its ink is not written #rrggbb, rather than vanish unsaid', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const host = document.createElement('div');
		host.style.cssText =
			'position: relative; width: 480px; height: 480px; --tile: 48px; --accent: rgb(96 165 250)';
		document.body.append(host);
		shown = mount(GridFluid, { target: host });
		flushSync();

		await expect
			.poll(() => warn.mock.calls[0])
			.toEqual([
				'grid-fluid: --accent is not written #rrggbb, the fluid is not drawn',
				'rgb(96 165 250)'
			]);
		host.remove();
	});
});
