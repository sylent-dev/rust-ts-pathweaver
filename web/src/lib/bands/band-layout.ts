// How the tabs of the open builds share the band (specs.md, Window layout; 2e2 of the mock-up):
// 184 pixels each, up to 240 when they all fit, then « +N ▾ » for those that don't, and + at the
// end. A rule the band draws and the open builds read, to keep the build shown in a tab.

/** The width of a tab while some builds don't fit, in pixels. */
export const TAB_WIDTH_PIXELS = 184;
/** The widest a tab grows while they all fit, in pixels. */
export const TAB_MAX_WIDTH_PIXELS = 240;
/** The margin of the band at its right end, in pixels; the band sets it from here. */
export const END_PADDING_PIXELS = 12;
/** The width of +, square, the height of the band, in pixels; the band sets it from here. */
export const ADD_WIDTH_PIXELS = 44;
/** What the band keeps at its right end: its margin and +, in pixels. */
const END_PIXELS = END_PADDING_PIXELS + ADD_WIDTH_PIXELS;
/** The same, « +N ▾ » before + (66, the width the mock-up gives it), in pixels. */
const END_WITH_MENU_PIXELS = END_PIXELS + 66;

/** How many builds have a tab, the others in « +N ▾ », and how wide each tab is. */
export interface BandLayout {
	/** The builds with a tab, the first of the list: one at least. */
	tabCount: number;
	tabWidthPixels: number;
}

/** How the tabs of so many builds share a band so wide. */
export function bandLayout(buildCount: number, bandWidthPixels: number): BandLayout {
	const roomForAll = bandWidthPixels - END_PIXELS;
	if (buildCount * TAB_WIDTH_PIXELS <= roomForAll) {
		return {
			tabCount: buildCount,
			tabWidthPixels: Math.min(TAB_MAX_WIDTH_PIXELS, Math.floor(roomForAll / buildCount))
		};
	}
	const room = bandWidthPixels - END_WITH_MENU_PIXELS;
	return {
		tabCount: Math.max(1, Math.floor(room / TAB_WIDTH_PIXELS)),
		tabWidthPixels: TAB_WIDTH_PIXELS
	};
}
