// The name of a build as the page writes it (specs.md, The header of a build): the core gives
// none for a name that shows nothing, which the page calls « Untitled build ».

import { t } from '#lib/i18n.ts';

/** The name of a build in plain text, for a tooltip or the label of a button. */
export function plainName(name: string | undefined): string {
	return name ?? t('build-untitled');
}
