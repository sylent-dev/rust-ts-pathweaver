import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';

// The path the website is served from: empty (unset) at the root of its domain,
// `https://pathweaver.sylent.tools/`, where .github/workflows/deploy.yml builds it; set only to
// serve it under a path of another host. Never hard-coded, so that the address can change
// without changing the code.
// SvelteKit refuses a value that doesn't start with `/` or ends with it.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			paths: { base }
		})
	],
	test: {
		expect: { requireAssertions: true },
		// Each test starts with the real functions, whatever the spies of the one before.
		restoreMocks: true,
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'scripts/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.{svelte,browser}.{test,spec}.{js,ts}']
				}
			},
			{
				// The tests named `*.svelte.spec.ts`: the state of the interface, its `$state` the
				// proxies of a browser, without a page. Their files are compiled as for a browser
				// (see vitest-node-client.ts), and Svelte itself is the one of a browser.
				extends: './vite.config.ts',
				resolve: { conditions: ['browser'] },
				test: {
					name: 'client',
					environment: './vitest-node-client.ts',
					include: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},
			{
				// The tests named `*.browser.spec.ts`: what needs a page, run in a real Chromium
				// without a window (docs/technical-choices.md, Tests of the interface): the events
				// of a browser, the files dropped, the core loaded, the layout.
				extends: './vite.config.ts',
				test: {
					name: 'browser',
					include: ['src/**/*.browser.{test,spec}.{js,ts}'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }]
					}
				}
			}
		]
	}
});
