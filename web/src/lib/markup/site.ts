// The site of an address, as a chip of a description and the guide of a build show it (specs.md,
// The header of a build): read by the parser of the browser, the one that reads the address a
// link opens, so that what the page shows is where the click goes, whatever the address holds
// (a name before an `@`, a `\`, a host written in `%` codes).

/** The start of a host that the site shows without, when a name with a dot comes after it. */
const WWW = 'www.';

/**
 * The characters of a site shown at most, where it is shown: past them, its end only, after an
 * ellipsis, as the address bar of a browser cuts a long site, since its true domain is at its end
 * and its start may be chosen to read as another (4g3, its fourth review, the owner, 2026-11-24:
 * an ellipsis at its end hid the domain, a chip on several lines crowded the guide). A chip of a
 * description, 40; the guide of the colophon, 28, what its pane holds on one line (the third
 * review of 4g4b: one of 40 ran 83 pixels over the description; `forum.pathofexile.com`, 21,
 * stays whole).
 */
const SHOWN_CHARACTERS = { chip: 40, guide: 28 } as const;

/** Where a site is shown: a chip of a description, or the guide of the colophon. */
export type SitePlace = keyof typeof SHOWN_CHARACTERS;

/** The mark of the start of a site cut: a mark of the type, no word, the same in every language. */
const ELLIPSIS = '…';

/**
 * The site of an address as the page shows it: its host without `www.`, its end only past the
 * characters its place holds; none when the browser can't read the address.
 */
export function siteOf(address: string, place: SitePlace): string | undefined {
	if (!URL.canParse(address)) {
		return undefined;
	}
	const { host } = new URL(address);
	const rest = host.slice(WWW.length);
	const site = host.startsWith(WWW) && rest.includes('.') ? rest : host;
	const shown = SHOWN_CHARACTERS[place];
	return site.length > shown ? ELLIPSIS + site.slice(-(shown - ELLIPSIS.length)) : site;
}

/**
 * The attributes of a link to an address written by a stranger, the guide of a build or a chip
 * of its description (specs.md, The header of a build): a new tab that keeps no hold on the page,
 * since the link may lead anywhere, and its whole address in its tooltip. The address is outside
 * the website: never passed to `resolve()`, which would put it under the path of the website.
 */
export function strangerLink(address: string): {
	href: string;
	target: '_blank';
	rel: 'noopener noreferrer';
	title: string;
} {
	return { href: address, target: '_blank', rel: 'noopener noreferrer', title: address };
}
