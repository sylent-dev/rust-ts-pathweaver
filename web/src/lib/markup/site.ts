// The site of an address, as a chip of a description and the guide of a build show it (specs.md,
// The header of a build): read by the parser of the browser, the one that reads the address a
// link opens, so that what the page shows is where the click goes, whatever the address holds
// (a name before an `@`, a `\`, a host written in `%` codes).

/** The start of a host that the site shows without, when a name of its own comes after it. */
const WWW = 'www.';

/** The site of an address, its host without `www.`; none when the browser can't read it. */
export function siteOf(address: string): string | undefined {
	if (!URL.canParse(address)) {
		return undefined;
	}
	const { host } = new URL(address);
	const withoutWww = host.startsWith(WWW) ? host.slice(WWW.length) : host;
	return withoutWww.includes('.') ? withoutWww : host || undefined;
}
