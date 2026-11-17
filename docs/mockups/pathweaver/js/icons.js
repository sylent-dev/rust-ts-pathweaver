// Icons as SVG lines in the colour of the text: text symbols (◀, ⚠, ×) render small and off-center.
const icon = (size, body, extra = "") => `<svg class="app-icon" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;
const ICONS = {
  previous: '<path d="M11 2.5 4.5 8l6.5 5.5z" fill="currentColor"/>',
  next: '<path d="M5 2.5 11.5 8 5 13.5z" fill="currentColor"/>',
  close: '<path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  minus: '<path d="M3 8h10"/>',
  down: '<path d="M4.5 6.5 8 10l3.5-3.5"/>',
  warning: '<path d="M8 2.2 14.3 13.5H1.7z"/><path d="M8 6.5v3.2M8 11.6v.1"/>',
  link: '<path d="M6.8 9.2a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.9.9"/><path d="M9.2 6.8a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l.9-.9"/>',
  bug: '<rect x="5" y="5.5" width="6" height="8.5" rx="3"/><path d="M6.3 5.6a1.7 1.7 0 0 1 3.4 0M6.6 3.9 5.6 2.6M9.4 3.9l1-1.3M8 8v6M5 8.5H2.5M11 8.5h2.5M5 11.5l-2 1.3M11 11.5l2 1.3M5.3 6.6 3.4 5.4M10.7 6.6l1.9-1.2"/>',
  download: '<path d="M8 2.5v8M4.8 7.5 8 10.7l3.2-3.2M3 13.5h10"/>',
};
