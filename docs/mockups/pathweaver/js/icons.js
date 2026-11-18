// Icons as SVG lines in the colour of the text: text symbols (◀, ⚠, ×) render small and off-center.
const icon = (size, body, extra = "") => `<svg class="app-icon" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;
const ICONS = {
  previous: '<path d="M11 2.5 4.5 8l6.5 5.5z" fill="currentColor"/>',
  next: '<path d="M5 2.5 11.5 8 5 13.5z" fill="currentColor"/>',
  close: '<path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  // The + that adds a build (the band of the builds), its ends cut flat like the icon of the drop
  // zone it leads to (sections/home-drop.js); the + of the zoom keeps the round ends of its -.
  add: '<path d="M8 3v10M3 8h10" stroke-linecap="butt"/>',
  minus: '<path d="M3 8h10"/>',
  down: '<path d="M4.5 6.5 8 10l3.5-3.5"/>',
  warning: '<path d="M8 2.2 14.3 13.5H1.7z"/><path d="M8 6.5v3.2M8 11.6v.1"/>',
  link: '<path d="M6.8 9.2a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.9.9"/><path d="M9.2 6.8a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l.9-.9"/>',
  download: '<path d="M8 2.5v8M4.8 7.5 8 10.7l3.2-3.2M3 13.5h10"/>',
  arrow: '<path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/>',
};
