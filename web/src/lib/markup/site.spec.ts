import { describe, expect, it } from 'vitest';
import { siteOf, strangerLink } from './site.ts';

describe('the site of an address', () => {
	it('is its host without www.', () => {
		expect([
			siteOf('https://mobalytics.gg/poe-2/builds/spark', 'chip'),
			siteOf('https://www.pathofexile.com/forum/view-thread/1', 'chip'),
			siteOf('https://maxroll.gg:8080/planner', 'chip'),
			siteOf('https://www.com/a', 'chip')
		]).toEqual(['mobalytics.gg', 'pathofexile.com', 'maxroll.gg:8080', 'www.com']);
	});

	it('is the one the click opens, whatever the address holds to read as another', () => {
		expect([
			siteOf('https://pathofexile.com@evil.io/forum', 'chip'),
			siteOf('https://evil.io\\@pathofexile.com/forum', 'chip'),
			siteOf('https://%65vil.io/forum', 'chip'),
			siteOf('https://EVIL.io/forum', 'chip')
		]).toEqual(['evil.io', 'evil.io', 'evil.io', 'evil.io']);
	});

	it('is none when the browser can’t read the address', () => {
		expect([siteOf('https://[', 'chip'), siteOf('https://a b', 'chip')]).toEqual([
			undefined,
			undefined
		]);
	});

	it('is its end only past 40 characters, its true domain kept after an ellipsis', () => {
		const forty = `${'a'.repeat(32)}.evil.io`;
		const longer = `pathofexile.com.${'forum-view-thread'.repeat(4)}.evil.io`;
		expect([
			siteOf(`https://${forty}/x`, 'chip'),
			siteOf(`https://www.${forty}/x`, 'chip'),
			siteOf(`https://${longer}/x`, 'chip')
		]).toEqual([forty, forty, `…${longer.slice(-39)}`]);
		expect(siteOf(`https://${longer}/x`, 'chip')?.endsWith('.evil.io')).toBe(true);
		expect(siteOf(`https://${longer}/x`, 'chip')).toHaveLength(40);
	});

	it('is its end only past 28 characters in the guide, what its pane holds', () => {
		const twentyEight = `${'a'.repeat(20)}.evil.io`;
		const longer = `mobalytics.gg-guides-and-builds-for-poe2.evil.io`;
		expect([
			siteOf('https://forum.pathofexile.com/forum/view-thread/1', 'guide'),
			siteOf(`https://${twentyEight}/x`, 'guide'),
			siteOf(`https://${longer}/x`, 'guide')
		]).toEqual(['forum.pathofexile.com', twentyEight, `…${longer.slice(-27)}`]);
	});
});

describe('a link to an address of a stranger', () => {
	it('opens in a new tab that keeps no hold on the page, its whole address in its tooltip', () => {
		const address = 'https://maxroll.gg/poe2/planner/0pgpe000';
		expect(strangerLink(address)).toEqual({
			href: address,
			target: '_blank',
			rel: 'noopener noreferrer',
			title: address
		});
	});
});
