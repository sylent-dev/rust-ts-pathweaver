import { describe, expect, it } from 'vitest';
import { siteOf } from './site.ts';

describe('the site of an address', () => {
	it('is its host without www.', () => {
		expect([
			siteOf('https://mobalytics.gg/poe-2/builds/spark'),
			siteOf('https://www.pathofexile.com/forum/view-thread/1'),
			siteOf('https://maxroll.gg:8080/planner'),
			siteOf('https://www.com/a')
		]).toEqual(['mobalytics.gg', 'pathofexile.com', 'maxroll.gg:8080', 'www.com']);
	});

	it('is the one the click opens, whatever the address holds to read as another', () => {
		expect([
			siteOf('https://pathofexile.com@evil.io/forum'),
			siteOf('https://evil.io\\@pathofexile.com/forum'),
			siteOf('https://%65vil.io/forum'),
			siteOf('https://EVIL.io/forum')
		]).toEqual(['evil.io', 'evil.io', 'evil.io', 'evil.io']);
	});

	it('is none when the browser can’t read the address', () => {
		expect([siteOf('https://['), siteOf('https://a b')]).toEqual([undefined, undefined]);
	});
});
