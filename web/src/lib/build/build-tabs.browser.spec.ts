// The row of the tabs of a build in a real browser: a click shows a tab, its bar under it, and the
// arrows stay the level's with the focus on a tab.

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { shownTab } from '#lib/page/build-tab.svelte.ts';
import { openBuilds } from '#lib/page/open-builds.svelte.ts';
import { openedBuild } from '#lib/page/opened-build.test-helper.ts';
import { hearKey } from '#lib/page/page-events.ts';
import BuildTabPanel from './BuildTabPanel.svelte';
import BuildTabs from './BuildTabs.svelte';

const shown: ReturnType<typeof mount>[] = [];

beforeEach(() => {
	shown.push(
		mount(BuildTabs, { target: document.body, props: { panelId: 'panel' } }),
		mount(BuildTabPanel, {
			target: document.body,
			props: { id: 'panel', build: openedBuild('key') }
		})
	);
	flushSync();
	document.addEventListener('keydown', hearKey);
});

afterEach(() => {
	document.removeEventListener('keydown', hearKey);
	for (const component of shown.splice(0)) {
		void unmount(component);
	}
	shownTab.show('overview');
	for (const build of openBuilds.all) {
		openBuilds.close(build.contentKey);
	}
});

/** The middle of an element, from the left of the page, in pixels. */
function middle(element: Element): number {
	const box = element.getBoundingClientRect();
	return box.left + box.width / 2;
}

describe('the tabs of a build', () => {
	it('name the five views, in their order', () => {
		expect(
			page
				.getByRole('button')
				.elements()
				.map((button) => button.textContent.trim())
		).toEqual(['Overview', 'Skills', 'Tree', 'Inventory', 'About']);
	});

	it('show the Overview at first, the one marked current', async () => {
		await expect
			.element(page.getByRole('button', { name: 'Overview' }))
			.toHaveAttribute('aria-current', 'true');
		await expect.element(page.getByRole('region', { name: 'Overview' })).toBeInTheDocument();
	});

	it('show the tab clicked, the bar sliding under its words', async () => {
		const skills = page.getByRole('button', { name: 'Skills' });
		await skills.click();
		await expect.element(skills).toHaveAttribute('aria-current', 'true');
		await expect
			.element(page.getByRole('button', { name: 'Overview' }))
			.toHaveAttribute('aria-current', 'false');
		await expect.element(page.getByRole('region', { name: 'Skills' })).toBeInTheDocument();
		const bar = document.querySelector('.bar');
		if (bar === null) {
			throw new Error('no bar');
		}
		await expect.poll(() => Math.round(middle(bar))).toBe(Math.round(middle(skills.element())));
	});

	it('are reached by Tab and shown by Enter, as any button', async () => {
		await userEvent.keyboard('{Tab}{Tab}{Enter}');
		await expect
			.element(page.getByRole('button', { name: 'Skills' }))
			.toHaveAttribute('aria-current', 'true');
		expect(shownTab.current).toBe('skills');
	});

	it('leave ← and → to the level while one of them has the focus', async () => {
		openBuilds.open(openedBuild('a', [10, 20]));
		openBuilds.showLevel(15);
		await page.getByRole('button', { name: 'Skills' }).click();
		await userEvent.keyboard('{ArrowRight}');
		expect([openBuilds.level, shownTab.current]).toEqual([20, 'skills']);
	});
});
