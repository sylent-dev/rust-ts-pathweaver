// The site of an address, as a chip of a description and the guide of a build show it (specs.md,
// The header of a build): read by the parser of the browser, the one that reads the address a
// link opens, so that what the page shows is where the click goes, whatever the address holds
// (a name before an `@`, a `\`, a host written in `%` codes).

/** The start of a host that the site shows without, when a name with a dot comes after it. */
const WWW = 'www.';

/**
 * The characters of a site shown at most: past them, its end only, after an ellipsis, as the
 * address bar of a browser cuts a long site, since its true domain is at its end and its start
 * may be chosen to read as another (4g3, its fourth review, the owner, 2026-11-24: an ellipsis at
 * its end hid the domain, a chip on several lines crowded the guide).
 */
const SHOWN_CHARACTERS = 40;

/** The mark of the start of a site cut: a mark of the type, no word, the same in every language. */
const ELLIPSIS = '…';

/**
 * The site of an address as the page shows it: its host without `www.`, its end only past 40
 * characters; none when the browser can't read the address.
 */
export function siteOf(address: string): string | undefined {
	if (!URL.canParse(address)) {
		return undefined;
	}
	const { host } = new URL(address);
	const rest = host.slice(WWW.length);
	const site = host.startsWith(WWW) && rest.includes('.') ? rest : host;
	return site.length > SHOWN_CHARACTERS
		? ELLIPSIS + site.slice(-(SHOWN_CHARACTERS - ELLIPSIS.length))
		: site;
}
