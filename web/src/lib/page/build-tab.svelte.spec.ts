import { describe, expect, it } from 'vitest';
import { ShownTab } from './build-tab.svelte.ts';

describe('the tab shown', () => {
	it('is the Overview, until another is chosen', () => {
		const tab = new ShownTab();
		expect(tab.current).toBe('overview');
		tab.show('skills');
		expect(tab.current).toBe('skills');
	});
});
